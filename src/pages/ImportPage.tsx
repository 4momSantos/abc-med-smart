import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportWizard } from '@/components/ImportWizard';
import { StatusWidget } from '@/components/http-sync/StatusWidget';
import { HttpSyncConfigSection } from '@/components/http-sync/HttpSyncConfigSection';
import { useDataStore } from '@/store/dataStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useHttpSync } from '@/hooks/useHttpSync';
import { useNavigate } from 'react-router-dom';
import { Upload, RefreshCw } from 'lucide-react';

export default function ImportPage() {
  const { setItems } = useDataStore();
  const { abcConfig, updateABCConfig, period, setPeriod } = useSettingsStore();
  const navigate = useNavigate();

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
    try {
      setItems(items);
      navigate('/');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const itemCount = items.length;
        const message = itemCount > 10000 
          ? `O arquivo possui ${itemCount.toLocaleString()} itens e excede o limite de armazenamento local (~5MB). Considere usar sincronização HTTP ou importar arquivos menores.`
          : `O armazenamento local está cheio. Por favor, limpe dados antigos ou use arquivos menores.`;
        
        if (confirm(`${message}\n\nDeseja limpar os dados antigos e tentar novamente?`)) {
          localStorage.clear();
          window.location.reload();
        }
      } else {
        console.error('Erro ao importar dados:', error);
        alert('Erro ao importar dados. Por favor, tente novamente.');
      }
    }
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
              configExists={!!config}
              config={config}
              onStart={startSync}
              onStop={stopSync}
              onSyncNow={syncNow}
            />

          <HttpSyncConfigSection
            config={config}
            syncLogs={syncLogs}
            loading={loading}
            saveConfig={saveConfig}
            testConnection={testConnection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
