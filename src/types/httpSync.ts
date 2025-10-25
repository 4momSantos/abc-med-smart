export interface HttpSyncConfig {
  tenant_id?: string;
  api_url: string;
  method: 'GET' | 'POST' | 'PUT';
  auth: {
    username: string;
    password: string;
  };
  headers?: Record<string, string>;
  query_params?: Record<string, string>;
  body?: any;
  timeout_ms: number;
  sync_interval: number;
  data_mapping: {
    root_path: string;
    fields: Record<string, string>;
  };
  transformations: Transformation[];
  options: {
    auto_start: boolean;
    retry_on_error: boolean;
    max_retries: number;
    log_requests: boolean;
    notify_on_error: boolean;
    notify_on_success: boolean;
  };
}

export interface Transformation {
  field: string;
  type: TransformationType;
  description?: string;
  params?: Record<string, any>;
}

export type TransformationType = 
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'parse_number'
  | 'parse_date'
  | 'multiply'
  | 'divide'
  | 'replace'
  | 'concat'
  | 'prefix'
  | 'format_currency';

export interface SyncLog {
  sync_id: string;
  tenant_id?: string;
  tipo: 'http_basic';
  inicio: string;
  fim?: string;
  status: 'em_andamento' | 'sucesso' | 'erro';
  duracao_ms?: number;
  tentativas: number;
  dados: {
    total_registros: number;
    inseridos: number;
    atualizados: number;
    ignorados: number;
    erros: number;
  };
  erros: SyncError[];
}

export interface SyncError {
  tipo: 'validacao' | 'processamento' | 'erro_geral';
  mensagem: string;
  registro?: any;
  stack?: string;
  timestamp: string;
}

export interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  stats: {
    total_syncs: number;
    successful_syncs: number;
    failed_syncs: number;
    last_duration_ms: number;
  };
  interval_ms: number;
  next_sync: Date | null;
}

export interface ProcessResult {
  inseridos: number;
  atualizados: number;
  ignorados: number;
  erros: number;
}
