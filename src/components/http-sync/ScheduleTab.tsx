import { HttpSyncConfig } from '@/types/httpSync';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface ScheduleTabProps {
  config: HttpSyncConfig;
  onChange: (config: HttpSyncConfig) => void;
}

export const ScheduleTab = ({ config, onChange }: ScheduleTabProps) => {
  const intervals = [
    { label: '1 minuto', value: 60000 },
    { label: '5 minutos', value: 300000 },
    { label: '10 minutos', value: 600000 },
    { label: '15 minutos', value: 900000 },
    { label: '30 minutos', value: 1800000 },
    { label: '1 hora', value: 3600000 },
    { label: '2 horas', value: 7200000 },
    { label: '6 horas', value: 21600000 },
    { label: '12 horas', value: 43200000 },
    { label: '24 horas', value: 86400000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="sync_interval">Intervalo de Sincronização</Label>
        <Select
          value={config.sync_interval.toString()}
          onValueChange={(value) => onChange({ ...config, sync_interval: parseInt(value) })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {intervals.map(interval => (
              <SelectItem key={interval.value} value={interval.value.toString()}>
                {interval.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold">Opções</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto_start">Iniciar automaticamente ao carregar</Label>
            <p className="text-sm text-muted-foreground">
              A sincronização será iniciada automaticamente quando a página for carregada
            </p>
          </div>
          <Switch
            id="auto_start"
            checked={config.options.auto_start}
            onCheckedChange={(checked) => onChange({
              ...config,
              options: { ...config.options, auto_start: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="retry_on_error">Tentar novamente em caso de erro</Label>
            <p className="text-sm text-muted-foreground">
              O sistema tentará realizar a sincronização novamente se houver erro
            </p>
          </div>
          <Switch
            id="retry_on_error"
            checked={config.options.retry_on_error}
            onCheckedChange={(checked) => onChange({
              ...config,
              options: { ...config.options, retry_on_error: checked }
            })}
          />
        </div>

        {config.options.retry_on_error && (
          <div>
            <Label htmlFor="max_retries">Máximo de tentativas</Label>
            <Input
              id="max_retries"
              type="number"
              min={1}
              max={10}
              value={config.options.max_retries}
              onChange={(e) => onChange({
                ...config,
                options: { ...config.options, max_retries: parseInt(e.target.value) }
              })}
              className="mt-2"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="log_requests">Registrar todas as requisições</Label>
            <p className="text-sm text-muted-foreground">
              Salvar logs detalhados de todas as requisições HTTP
            </p>
          </div>
          <Switch
            id="log_requests"
            checked={config.options.log_requests}
            onCheckedChange={(checked) => onChange({
              ...config,
              options: { ...config.options, log_requests: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notify_on_error">Notificar em caso de erro</Label>
            <p className="text-sm text-muted-foreground">
              Receber notificações quando ocorrer erro na sincronização
            </p>
          </div>
          <Switch
            id="notify_on_error"
            checked={config.options.notify_on_error}
            onCheckedChange={(checked) => onChange({
              ...config,
              options: { ...config.options, notify_on_error: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notify_on_success">Notificar em caso de sucesso</Label>
            <p className="text-sm text-muted-foreground">
              Receber notificações quando a sincronização for bem-sucedida
            </p>
          </div>
          <Switch
            id="notify_on_success"
            checked={config.options.notify_on_success}
            onCheckedChange={(checked) => onChange({
              ...config,
              options: { ...config.options, notify_on_success: checked }
            })}
          />
        </div>
      </div>
    </div>
  );
};
