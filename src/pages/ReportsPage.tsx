import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Gere e gerencie relatórios personalizados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Relatório Executivo</CardTitle>
            </div>
            <CardDescription>
              Visão geral com KPIs principais e gráficos resumidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Relatório Técnico</CardTitle>
            </div>
            <CardDescription>
              Análise detalhada com todas as métricas e estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Relatório de Anomalias</CardTitle>
            </div>
            <CardDescription>
              Lista de itens com comportamento atípico detectado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A funcionalidade completa de geração de relatórios personalizados estará disponível em
            breve. Você poderá criar templates customizados, agendar geração automática e exportar
            em múltiplos formatos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
