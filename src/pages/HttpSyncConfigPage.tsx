import { useState, useEffect } from 'react';
import { useHttpSync } from '@/hooks/useHttpSync';
import { HttpSyncConfig } from '@/types/httpSync';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusWidget } from '@/components/http-sync/StatusWidget';
import { ConnectionTab } from '@/components/http-sync/ConnectionTab';
import { MappingTab } from '@/components/http-sync/MappingTab';
import { TransformationsTab } from '@/components/http-sync/TransformationsTab';
import { ScheduleTab } from '@/components/http-sync/ScheduleTab';
import { LogsTab } from '@/components/http-sync/LogsTab';

const defaultConfig: HttpSyncConfig = {
  api_url: '',
  method: 'GET',
  auth: { username: '', password: '' },
  timeout_ms: 30000,
  sync_interval: 300000,
  data_mapping: {
    root_path: '',
    fields: {
      codigo: 'id',
      nome: 'name',
      quantidade: 'quantity',
      preco: 'price',
      unidade: 'unit',
      categoria: 'category',
      lote: 'batch',
      data_validade: 'expiry_date',
      fornecedor: 'supplier',
    },
  },
  transformations: [],
  options: {
    auto_start: false,
    retry_on_error: true,
    max_retries: 3,
    log_requests: true,
    notify_on_error: true,
    notify_on_success: false,
  },
};

export default function HttpSyncConfigPage() {
  const {
    config,
    status,
    isRunning,
    lastSync,
    syncLogs,
    loading,
    error,
    saveConfig,
    testConnection,
    startSync,
    stopSync,
    syncNow,
  } = useHttpSync();

  const [formData, setFormData] = useState<HttpSyncConfig>(defaultConfig);
  const [testResponse, setTestResponse] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    return await saveConfig(formData);
  };

  const handleTest = async () => {
    const result = await testConnection(formData);
    if (result.success) {
      setTestResponse(result.data);
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sincronização HTTP Basic</h1>
        <p className="text-muted-foreground mt-2">
          Configure a sincronização automática de dados via API
        </p>
      </div>

      <StatusWidget
        status={status}
        isRunning={isRunning}
        lastSync={lastSync}
        loading={loading}
        error={error}
        configExists={!!config}
        config={config}
        onStart={startSync}
        onStop={stopSync}
        onSyncNow={syncNow}
      />

      <Tabs defaultValue="conexao" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conexao">Conexão</TabsTrigger>
          <TabsTrigger value="mapeamento">Mapeamento</TabsTrigger>
          <TabsTrigger value="transformacoes">Transformações</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-card rounded-lg shadow-lg p-6 border">
          <TabsContent value="conexao" className="mt-0">
            <ConnectionTab
              config={formData}
              onChange={setFormData}
              onSave={handleSave}
              onTest={handleTest}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="mapeamento" className="mt-0">
            <MappingTab
              config={formData}
              onChange={setFormData}
              apiResponse={testResponse}
            />
          </TabsContent>

          <TabsContent value="transformacoes" className="mt-0">
            <TransformationsTab
              config={formData}
              onChange={setFormData}
            />
          </TabsContent>

          <TabsContent value="sincronizacao" className="mt-0">
            <ScheduleTab
              config={formData}
              onChange={setFormData}
            />
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <LogsTab logs={syncLogs} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
