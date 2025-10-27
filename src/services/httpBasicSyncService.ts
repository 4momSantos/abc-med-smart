import { HttpSyncConfig, SyncLog, SyncStatus, ProcessResult, SyncError } from '@/types/httpSync';
import { MedicineItem } from '@/types/medicine';
import { encryptPassword, decryptPassword } from '@/lib/httpSyncHelpers';

class HttpBasicSyncService {
  private config: HttpSyncConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastSync: Date | null = null;
  private syncStats = {
    total_syncs: 0,
    successful_syncs: 0,
    failed_syncs: 0,
    last_duration_ms: 0,
  };
  private onStatusChange?: () => void;
  private onLogUpdate?: () => void;

  constructor(config: HttpSyncConfig) {
    this.config = config;
  }

  setCallbacks(onStatusChange?: () => void, onLogUpdate?: () => void) {
    this.onStatusChange = onStatusChange;
    this.onLogUpdate = onLogUpdate;
  }

  start() {
    if (this.isRunning) {
      console.warn('Sincronização já está em execução');
      return;
    }

    console.log(`Iniciando sincronização automática a cada ${this.config.sync_interval}ms`);
    this.isRunning = true;
    
    // Executar primeira sincronização imediatamente
    this.syncNow();
    
    // Agendar próximas sincronizações
    this.syncInterval = setInterval(() => {
      this.syncNow();
    }, this.config.sync_interval);

    this.onStatusChange?.();
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('Sincronização automática parada');
    this.onStatusChange?.();
  }

  changeInterval(newIntervalMs: number) {
    this.config.sync_interval = newIntervalMs;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  async syncNow(): Promise<SyncLog> {
    const syncId = this.generateSyncId();
    const startTime = Date.now();
    
    console.log(`[${syncId}] Iniciando sincronização...`);
    
    const syncLog: SyncLog = {
      sync_id: syncId,
      tipo: 'http_basic',
      inicio: new Date().toISOString(),
      status: 'em_andamento',
      tentativas: 0,
      dados: {
        total_registros: 0,
        inseridos: 0,
        atualizados: 0,
        ignorados: 0,
        erros: 0,
      },
      erros: [],
    };

    try {
      // Fazer requisição HTTP Basic
      const responseData = await this.makeHttpRequest();
      
      // Processar dados recebidos
      const result = await this.processData(responseData, syncLog);
      
      // Atualizar estatísticas
      this.syncStats.total_syncs++;
      this.syncStats.successful_syncs++;
      this.syncStats.last_duration_ms = Date.now() - startTime;
      this.lastSync = new Date();
      
      syncLog.status = 'sucesso';
      syncLog.fim = new Date().toISOString();
      syncLog.duracao_ms = this.syncStats.last_duration_ms;
      
      console.log(`[${syncId}] Sincronização concluída com sucesso em ${this.syncStats.last_duration_ms}ms`);
      console.log(`[${syncId}] Registros: ${result.inseridos} inseridos, ${result.atualizados} atualizados, ${result.erros} erros`);
      
      // Salvar log
      this.saveSyncLog(syncLog);
      this.saveStats();
      
      this.onStatusChange?.();
      this.onLogUpdate?.();
      
      return syncLog;
      
    } catch (error: any) {
      console.error(`[${syncId}] Erro na sincronização:`, error);
      
      this.syncStats.total_syncs++;
      this.syncStats.failed_syncs++;
      
      syncLog.status = 'erro';
      syncLog.fim = new Date().toISOString();
      syncLog.duracao_ms = Date.now() - startTime;
      syncLog.erros.push({
        tipo: 'erro_geral',
        mensagem: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      
      // Salvar log de erro
      this.saveSyncLog(syncLog);
      this.saveStats();
      
      // Retry se configurado
      if (this.config.options.retry_on_error && syncLog.tentativas < this.config.options.max_retries) {
        console.log(`[${syncId}] Tentando novamente... (${syncLog.tentativas + 1}/${this.config.options.max_retries})`);
        syncLog.tentativas++;
        
        // Aguardar antes de tentar novamente (exponential backoff)
        const delayMs = Math.min(1000 * Math.pow(2, syncLog.tentativas), 30000);
        await this.sleep(delayMs);
        
        return await this.syncNow();
      }
      
      this.onStatusChange?.();
      this.onLogUpdate?.();
      
      throw error;
    }
  }

  async makeHttpRequest(): Promise<any> {
    const url = new URL(this.config.api_url);
    
    // Adicionar query parameters
    if (this.config.query_params) {
      Object.keys(this.config.query_params).forEach(key => {
        url.searchParams.append(key, this.config.query_params![key]);
      });
    }
    
    // Criar credenciais Basic Auth
    const password = decryptPassword(this.config.auth.password);
    const credentials = btoa(`${this.config.auth.username}:${password}`);
    
    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`,
      ...this.config.headers,
    };
    
    // Preparar opções da requisição
    const options: RequestInit = {
      method: this.config.method,
      headers: headers,
    };
    
    // Adicionar body se POST/PUT
    if (this.config.body && ['POST', 'PUT', 'PATCH'].includes(this.config.method)) {
      options.body = JSON.stringify(this.config.body);
    }
    
    // Log da requisição (se habilitado)
    if (this.config.options.log_requests) {
      console.log('HTTP Request:', {
        url: url.toString(),
        method: this.config.method,
        headers: { ...headers, 'Authorization': 'Basic ***' },
      });
    }
    
    // Fazer requisição com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout_ms);
    
    try {
      const response = await fetch(url.toString(), {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Verificar status
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      // Parse JSON
      const data = await response.json();
      
      // Log da resposta (se habilitado)
      if (this.config.options.log_requests) {
        console.log('HTTP Response:', {
          status: response.status,
          data_size: JSON.stringify(data).length,
        });
      }
      
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Timeout após ${this.config.timeout_ms}ms`);
      }
      throw error;
    }
  }

  async processData(responseData: any, syncLog: SyncLog): Promise<ProcessResult> {
    // Extrair dados do caminho especificado
    let records = responseData;
    
    if (this.config.data_mapping.root_path) {
      const pathParts = this.config.data_mapping.root_path.split('.');
      for (const part of pathParts) {
        if (part && records) {
          records = records[part];
        }
      }
      
      if (!records) {
        throw new Error(`Caminho ${this.config.data_mapping.root_path} não encontrado na resposta`);
      }
    }
    
    // Garantir que records é um array
    if (!Array.isArray(records)) {
      records = [records];
    }
    
    syncLog.dados.total_registros = records.length;
    
    let inseridos = 0;
    let atualizados = 0;
    let ignorados = 0;
    let erros = 0;
    
    const itemsToImport: MedicineItem[] = [];
    
    // Processar cada registro
    for (const record of records) {
      try {
        // Mapear campos
        const item = this.mapFields(record);
        
        // Aplicar transformações
        const transformedItem = this.applyTransformations(item);
        
        // Validar item
        if (!this.validateItem(transformedItem)) {
          ignorados++;
          syncLog.erros.push({
            tipo: 'validacao',
            mensagem: 'Item não passou na validação',
            registro: record,
            timestamp: new Date().toISOString(),
          });
          continue;
        }
        
        // Criar MedicineItem
        const medicineItem: Partial<MedicineItem> = {
          id: transformedItem.codigo || `item_${Date.now()}_${Math.random()}`,
          code: transformedItem.codigo,
          name: transformedItem.nome || 'Item sem nome',
          quantity: Number(transformedItem.quantidade) || 0,
          unitPrice: Number(transformedItem.preco) || 0,
          totalValue: (Number(transformedItem.quantidade) || 0) * (Number(transformedItem.preco) || 0),
          unit: transformedItem.unidade,
          category: transformedItem.categoria,
          subcategory: transformedItem.subcategoria,
          batch: transformedItem.lote,
          expirationDate: transformedItem.data_validade ? new Date(transformedItem.data_validade) : undefined,
          supplier: transformedItem.fornecedor,
          clinicalCriticality: transformedItem.criticidade,
          requestingSector: transformedItem.setor,
          leadTime: transformedItem.prazo_entrega ? Number(transformedItem.prazo_entrega) : undefined,
          minStock: transformedItem.estoque_minimo ? Number(transformedItem.estoque_minimo) : undefined,
          currentStock: transformedItem.estoque_atual ? Number(transformedItem.estoque_atual) : undefined,
        };
        
        itemsToImport.push(medicineItem as MedicineItem);
        
      } catch (error: any) {
        erros++;
        syncLog.erros.push({
          tipo: 'processamento',
          mensagem: error.message,
          registro: record,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Salvar no Supabase usando bulk insert
    if (itemsToImport.length > 0) {
      try {
        const { bulkInsertMedicines } = await import('@/lib/bulkDataImport');
        const result = await bulkInsertMedicines(itemsToImport);
        inseridos = result.inserted;
        erros += result.errors;
        
        console.log(`HTTP Sync: ${result.inserted} itens salvos no Supabase`);
      } catch (error: any) {
        console.error('Erro ao salvar no Supabase:', error);
        erros += itemsToImport.length;
        syncLog.erros.push({
          tipo: 'erro_geral',
          mensagem: `Erro ao salvar no banco: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    syncLog.dados.inseridos = inseridos;
    syncLog.dados.atualizados = atualizados;
    syncLog.dados.ignorados = ignorados;
    syncLog.dados.erros = erros;
    
    return { inseridos, atualizados, ignorados, erros };
  }

  mapFields(record: any): any {
    const mapped: any = {};
    const fieldMapping = this.config.data_mapping.fields;
    
    for (const [internalField, externalField] of Object.entries(fieldMapping)) {
      const value = this.getNestedValue(record, externalField);
      mapped[internalField] = value;
    }
    
    return mapped;
  }

  getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }
      value = value[part];
    }
    
    return value;
  }

  applyTransformations(item: any): any {
    let transformed = { ...item };
    
    for (const transformation of this.config.transformations) {
      try {
        transformed = this.applyTransformation(transformed, transformation);
      } catch (error) {
        console.error('Erro ao aplicar transformação:', error);
      }
    }
    
    return transformed;
  }

  applyTransformation(item: any, transformation: any): any {
    const { field, type, params } = transformation;
    
    if (!item[field]) return item;
    
    switch (type) {
      case 'uppercase':
        item[field] = String(item[field]).toUpperCase();
        break;
      
      case 'lowercase':
        item[field] = String(item[field]).toLowerCase();
        break;
      
      case 'trim':
        item[field] = String(item[field]).trim();
        break;
      
      case 'parse_number':
        item[field] = parseFloat(String(item[field]).replace(',', '.'));
        break;
      
      case 'parse_date':
        item[field] = new Date(item[field]).toISOString();
        break;
      
      case 'multiply':
        item[field] = parseFloat(item[field]) * (params?.factor || 1);
        break;
      
      case 'divide':
        item[field] = parseFloat(item[field]) / (params?.divisor || 1);
        break;
      
      case 'replace':
        item[field] = String(item[field]).replace(params?.search || '', params?.replace || '');
        break;
      
      case 'concat':
        item[field] = String(item[field]) + (params?.suffix || '');
        break;
      
      case 'prefix':
        item[field] = (params?.prefix || '') + String(item[field]);
        break;
      
      case 'format_currency':
        item[field] = parseFloat(item[field]).toFixed(2);
        break;
    }
    
    return item;
  }

  validateItem(item: any): boolean {
    if (!item.codigo && !item.nome) return false;
    return true;
  }

  saveSyncLog(syncLog: SyncLog) {
    const logs = this.getSyncLogs();
    logs.unshift(syncLog);
    
    // Manter apenas últimos 100 logs
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    localStorage.setItem('http_sync_logs', JSON.stringify(logs));
  }

  getSyncLogs(): SyncLog[] {
    const logs = localStorage.getItem('http_sync_logs');
    return logs ? JSON.parse(logs) : [];
  }

  saveStats() {
    localStorage.setItem('http_sync_stats', JSON.stringify({
      ...this.syncStats,
      lastSync: this.lastSync?.toISOString(),
      isRunning: this.isRunning,
      interval_ms: this.config.sync_interval,
    }));
  }

  getStatus(): SyncStatus {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      stats: this.syncStats,
      interval_ms: this.config.sync_interval,
      next_sync: this.isRunning && this.lastSync 
        ? new Date(this.lastSync.getTime() + this.config.sync_interval)
        : null,
    };
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default HttpBasicSyncService;
