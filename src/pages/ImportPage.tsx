import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportWizard } from '@/components/ImportWizard';
import { StatusWidget } from '@/components/http-sync/StatusWidget';
import { ConnectionTab } from '@/components/http-sync/ConnectionTab';
import { MappingTab } from '@/components/http-sync/MappingTab';
import { TransformationsTab } from '@/components/http-sync/TransformationsTab';
import { ScheduleTab } from '@/components/http-sync/ScheduleTab';
import { LogsTab } from '@/components/http-sync/LogsTab';
import { useDataStore } from '@/store/dataStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useHttpSync } from '@/hooks/useHttpSync';
import { useNavigate } from 'react-router-dom';
import { Upload, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function ImportPage() {
  const { setItems } = useDataStore();
  const { abcConfig, updateABCConfig, period, setPeriod } = useSettingsStore();
  const navigate = useNavigate();
  const [syncTab, setSyncTab] = useState('status');

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

  const handleImportComplete = (items: any[]) => {
    setItems(items);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importar Dados</h1>
        <p className="text-muted-foreground mt-2">
          Importe seus dados de medicamentos e materiais hospitalares via arquivo ou sincronização HTTP
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload de Arquivo
          </TabsTrigger>
          <TabsTrigger value="http-sync" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sincronização HTTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo</CardTitle>
              <CardDescription>
                Suportamos arquivos Excel (.xlsx, .xls) e CSV. O arquivo deve conter informações sobre
                medicamentos incluindo nome, quantidade, valor unitário e criticidade clínica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportWizard 
                onImportComplete={handleImportComplete}
                abcConfig={abcConfig}
                onConfigChange={updateABCConfig}
                period={period}
                onPeriodChange={setPeriod}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="http-sync" className="mt-6 space-y-6">
          <StatusWidget
            status={status}
            isRunning={isRunning}
            lastSync={lastSync}
            loading={loading}
            error={error}
            hasConfig={!!config}
            onStart={startSync}
            onStop={stopSync}
            onSyncNow={syncNow}
          />

          <Card>
            <CardHeader>
              <CardTitle>Configuração HTTP Sync</CardTitle>
              <CardDescription>
                Configure a sincronização automática com APIs externas via HTTP Basic Auth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={syncTab} onValueChange={setSyncTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="connection">Conexão</TabsTrigger>
                  <TabsTrigger value="mapping">Mapeamento</TabsTrigger>
                  <TabsTrigger value="transformations">Transformações</TabsTrigger>
                  <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="status" className="mt-0">
                    <div className="text-center text-muted-foreground py-8">
                      Use o widget acima para controlar a sincronização
                    </div>
                  </TabsContent>

                  <TabsContent value="connection" className="mt-0">
                    {config && (
                      <ConnectionTab
                        config={config}
                        onChange={saveConfig}
                        onSave={saveConfig}
                        onTest={testConnection}
                        loading={loading}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="mapping" className="mt-0">
                    {config && (
                      <MappingTab
                        config={config}
                        onChange={saveConfig}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="transformations" className="mt-0">
                    {config && (
                      <TransformationsTab
                        config={config}
                        onChange={saveConfig}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-0">
                    {config && (
                      <ScheduleTab
                        config={config}
                        onChange={saveConfig}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="logs" className="mt-0">
                    <LogsTab logs={syncLogs} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
