import { useState } from 'react';
import { Eye, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { SyncLog } from '@/types/httpSync';
import { formatDuration } from '@/lib/httpSyncHelpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LogDetailsModal } from './LogDetailsModal';

interface LogsTabProps {
  logs: SyncLog[];
}

export const LogsTab = ({ logs }: LogsTabProps) => {
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);

  const getStatusBadge = (status: string) => {
    if (status === 'sucesso') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Sucesso</Badge>;
    }
    if (status === 'erro') {
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Erro</Badge>;
    }
    return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Em andamento</Badge>;
  };

  const downloadLog = (log: SyncLog) => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-log-${log.sync_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma sincronização realizada ainda</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Inseridos</TableHead>
                <TableHead>Atualizados</TableHead>
                <TableHead>Erros</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.sync_id}>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    {new Date(log.inicio).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{formatDuration(log.duracao_ms || 0)}</TableCell>
                  <TableCell>{log.dados.total_registros}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {log.dados.inseridos}
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {log.dados.atualizados}
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {log.dados.erros}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadLog(log)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
};
