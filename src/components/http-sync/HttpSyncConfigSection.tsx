import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ConnectionTab } from './ConnectionTab';
import { MappingTab } from './MappingTab';
import { TransformationsTab } from './TransformationsTab';
import { ScheduleTab } from './ScheduleTab';
import { LogsTab } from './LogsTab';
import { HttpSyncConfig, SyncLog } from '@/types/httpSync';

interface HttpSyncConfigSectionProps {
  config: HttpSyncConfig | null;
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
  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração HTTP Sync</CardTitle>
          <CardDescription>
            Configure a sincronização automática com APIs externas via HTTP Basic Auth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Carregando configuração...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração HTTP Sync</CardTitle>
        <CardDescription>
          Configure a sincronização automática com APIs externas via HTTP Basic Auth
        </CardDescription>
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
