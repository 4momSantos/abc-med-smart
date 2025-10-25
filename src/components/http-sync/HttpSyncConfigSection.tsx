import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { ConnectionTab } from './ConnectionTab';
import { MappingTab } from './MappingTab';
import { TransformationsTab } from './TransformationsTab';
import { ScheduleTab } from './ScheduleTab';
import { LogsTab } from './LogsTab';
import { HttpSyncConfig, SyncLog } from '@/types/httpSync';
import { isConfigComplete } from '@/lib/httpSyncHelpers';

interface HttpSyncConfigSectionProps {
  config: HttpSyncConfig;
  syncLogs: SyncLog[];
  loading: boolean;
  saveConfig: (config: HttpSyncConfig) => Promise<boolean>;
  testConnection: (config?: HttpSyncConfig) => Promise<any>;
}

export function HttpSyncConfigSection({
  config,
  syncLogs,
  loading,
  saveConfig,
  testConnection,
}: HttpSyncConfigSectionProps) {
  const configComplete = isConfigComplete(config);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configuração HTTP Sync</CardTitle>
            <CardDescription>
              Configure a sincronização automática com APIs externas via HTTP Basic Auth
            </CardDescription>
          </div>
          {!configComplete && (
            <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-500">
              <AlertCircle className="h-3 w-3" />
              Configuração Incompleta
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="connection">
            <AccordionTrigger>Conexão</AccordionTrigger>
            <AccordionContent>
              <ConnectionTab
                config={config}
                onChange={(newConfig) => {
                  saveConfig(newConfig);
                }}
                onSave={() => saveConfig(config)}
                onTest={() => testConnection(config)}
                loading={loading}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mapping">
            <AccordionTrigger>Mapeamento</AccordionTrigger>
            <AccordionContent>
              <MappingTab
                config={config}
                onChange={(newConfig) => {
                  saveConfig(newConfig);
                }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="transformations">
            <AccordionTrigger>Transformações</AccordionTrigger>
            <AccordionContent>
              <TransformationsTab
                config={config}
                onChange={(newConfig) => {
                  saveConfig(newConfig);
                }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="schedule">
            <AccordionTrigger>Agendamento</AccordionTrigger>
            <AccordionContent>
              <ScheduleTab
                config={config}
                onChange={(newConfig) => {
                  saveConfig(newConfig);
                }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="logs">
            <AccordionTrigger>Logs</AccordionTrigger>
            <AccordionContent>
              <LogsTab logs={syncLogs} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
