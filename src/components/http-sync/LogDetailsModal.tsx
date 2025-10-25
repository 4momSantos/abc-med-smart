import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SyncLog } from '@/types/httpSync';
import { formatDuration } from '@/lib/httpSyncHelpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogDetailsModalProps {
  log: SyncLog;
  onClose: () => void;
}

export const LogDetailsModal = ({ log, onClose }: LogDetailsModalProps) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes da Sincronização</span>
            {log.status === 'sucesso' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" /> Sucesso
              </Badge>
            )}
            {log.status === 'erro' && (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" /> Erro
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sync ID</p>
                <p className="font-mono text-sm">{log.sync_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-semibold">{formatDuration(log.duracao_ms || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p>{new Date(log.inicio).toLocaleString('pt-BR')}</p>
              </div>
              {log.fim && (
                <div>
                  <p className="text-sm text-muted-foreground">Fim</p>
                  <p>{new Date(log.fim).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <h3 className="font-semibold mb-3">Resumo</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="border rounded-lg p-3 bg-background">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{log.dados.total_registros}</p>
                </div>
                <div className="border rounded-lg p-3 bg-background">
                  <p className="text-sm text-muted-foreground">Inseridos</p>
                  <p className="text-2xl font-bold text-green-600">{log.dados.inseridos}</p>
                </div>
                <div className="border rounded-lg p-3 bg-background">
                  <p className="text-sm text-muted-foreground">Atualizados</p>
                  <p className="text-2xl font-bold text-blue-600">{log.dados.atualizados}</p>
                </div>
                <div className="border rounded-lg p-3 bg-background">
                  <p className="text-sm text-muted-foreground">Ignorados</p>
                  <p className="text-2xl font-bold text-orange-600">{log.dados.ignorados}</p>
                </div>
                <div className="border rounded-lg p-3 bg-background">
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-2xl font-bold text-red-600">{log.dados.erros}</p>
                </div>
              </div>
            </div>

            {/* Errors */}
            {log.erros.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Erros ({log.erros.length})
                </h3>
                <div className="space-y-2">
                  {log.erros.map((erro, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50 dark:bg-red-950">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{erro.tipo}</p>
                          <p className="text-sm text-muted-foreground">{erro.mensagem}</p>
                          {erro.registro && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                Ver registro
                              </summary>
                              <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                                {JSON.stringify(erro.registro, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tentativas */}
            {log.tentativas > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Tentativas:</strong> {log.tentativas}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
