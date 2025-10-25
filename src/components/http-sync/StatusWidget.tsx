import { Play, Pause, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { SyncStatus } from '@/types/httpSync';
import { formatDuration, formatInterval, getNextSyncCountdown } from '@/lib/httpSyncHelpers';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusWidgetProps {
  status: SyncStatus | null;
  isRunning: boolean;
  lastSync: Date | null;
  loading: boolean;
  error: string | null;
  configExists: boolean;
  onStart: () => void;
  onStop: () => void;
  onSyncNow: () => void;
}

export const StatusWidget = ({
  status,
  isRunning,
  lastSync,
  loading,
  error,
  configExists,
  onStart,
  onStop,
  onSyncNow,
}: StatusWidgetProps) => {
  const successRate = status?.stats?.total_syncs 
    ? ((status.stats.successful_syncs / status.stats.total_syncs) * 100).toFixed(1)
    : '0';

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 mb-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Status da Sincronização</h2>
        <div className="flex gap-2">
          {isRunning ? (
            <Button
              onClick={onStop}
              variant="destructive"
              size="sm"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </Button>
          ) : (
            <Button
              onClick={onStart}
              disabled={!configExists}
              size="sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          )}
          <Button
            onClick={onSyncNow}
            disabled={loading || !configExists}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Agora
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status */}
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            {isRunning ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <XCircle className="text-muted-foreground" size={20} />
            )}
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <p className="text-lg font-semibold">
            {isRunning ? 'Ativo' : 'Pausado'}
          </p>
        </div>
        
        {/* Última Sincronização */}
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-primary" size={20} />
            <span className="text-sm text-muted-foreground">Última Sync</span>
          </div>
          <p className="text-lg font-semibold">
            {lastSync ? new Date(lastSync).toLocaleTimeString('pt-BR') : '-'}
          </p>
          <p className="text-xs text-muted-foreground">
            {status?.stats?.last_duration_ms 
              ? `(${formatDuration(status.stats.last_duration_ms)})`
              : ''}
          </p>
        </div>
        
        {/* Próxima Sincronização */}
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-orange-500" size={20} />
            <span className="text-sm text-muted-foreground">Próxima Sync</span>
          </div>
          <p className="text-lg font-semibold">
            {getNextSyncCountdown(status?.next_sync || null)}
          </p>
          <p className="text-xs text-muted-foreground">
            Intervalo: {status ? formatInterval(status.interval_ms) : '-'}
          </p>
        </div>
        
        {/* Estatísticas */}
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
          </div>
          <p className="text-lg font-semibold">
            {successRate}%
          </p>
          <p className="text-xs text-muted-foreground">
            {status?.stats?.total_syncs || 0} sincronizações
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
