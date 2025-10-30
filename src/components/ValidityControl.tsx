import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';
import { MedicineItem } from '@/types/medicine';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ValidityControlProps {
  items: MedicineItem[];
}

const COLORS = {
  expired: 'rgb(239, 68, 68)',      // vermelho
  expiresSoon: 'rgb(234, 179, 8)',  // amarelo
  expiring: 'rgb(59, 130, 246)',    // azul
  valid: 'rgb(34, 197, 94)',        // verde
};

const getValidityStatus = (expirationDate?: Date) => {
  if (!expirationDate) return 'unknown';
  
  const today = new Date();
  const expiry = new Date(expirationDate);
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiresSoon';
  if (daysUntilExpiry <= 90) return 'expiring';
  return 'valid';
};

const getStatusBadge = (status: string, daysUntilExpiry?: number) => {
  switch (status) {
    case 'expired':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Vencido
        </Badge>
      );
    case 'expiresSoon':
      return (
        <Badge className="gap-1 bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">
          <AlertTriangle className="w-3 h-3" />
          Vence em {daysUntilExpiry} dias
        </Badge>
      );
    case 'expiring':
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Vence em {daysUntilExpiry} dias
        </Badge>
      );
    case 'valid':
      return (
        <Badge className="gap-1 bg-success/10 text-success hover:bg-success/20 border-success/20">
          <CheckCircle2 className="w-3 h-3" />
          Válido
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <Calendar className="w-3 h-3" />
          Sem data
        </Badge>
      );
  }
};

export const ValidityControl = ({ items }: ValidityControlProps) => {
  const validityData = useMemo(() => {
    const stats = {
      expired: 0,
      expiresSoon: 0,
      expiring: 0,
      valid: 0,
      unknown: 0,
      totalValue: {
        expired: 0,
        expiresSoon: 0,
        expiring: 0,
        valid: 0,
      }
    };

    const criticalItems: Array<MedicineItem & { status: string; daysUntilExpiry: number }> = [];
    const monthlyExpiration: Record<string, number> = {};

    items.forEach((item) => {
      const status = getValidityStatus(item.expirationDate);
      const today = new Date();
      const expiry = item.expirationDate ? new Date(item.expirationDate) : null;
      const daysUntilExpiry = expiry 
        ? Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      stats[status as keyof typeof stats]++;
      
      if (status !== 'unknown' && status !== 'valid') {
        stats.totalValue[status as keyof typeof stats.totalValue] += item.totalValue;
      } else if (status === 'valid') {
        stats.totalValue.valid += item.totalValue;
      }

      if (status === 'expired' || status === 'expiresSoon') {
        criticalItems.push({ ...item, status, daysUntilExpiry });
      }

      // Agrupar por mês de vencimento (próximos 12 meses)
      if (expiry && daysUntilExpiry >= 0 && daysUntilExpiry <= 365) {
        const monthKey = `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, '0')}`;
        monthlyExpiration[monthKey] = (monthlyExpiration[monthKey] || 0) + 1;
      }
    });

    // Sort critical items by days until expiry
    criticalItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Preparar dados do gráfico de barras mensal
    const monthlyData = Object.entries(monthlyExpiration)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 12)
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        return { month: monthName, count };
      });

    return { stats, criticalItems: criticalItems.slice(0, 10), monthlyData };
  }, [items]);

  const chartData = [
    { name: 'Vencidos', value: validityData.stats.expired, color: COLORS.expired },
    { name: 'Vence em 30 dias', value: validityData.stats.expiresSoon, color: COLORS.expiresSoon },
    { name: 'Vence em 90 dias', value: validityData.stats.expiring, color: COLORS.expiring },
    { name: 'Válidos', value: validityData.stats.valid, color: COLORS.valid },
  ].filter(d => d.value > 0);

  const hasValidityData = items.some(item => item.expirationDate);
  const hasCriticalItems = validityData.criticalItems.length > 0;

  if (!hasValidityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Controle de Validade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Nenhum item com data de validade cadastrada. 
              Adicione datas de validade aos medicamentos para visualizar o controle.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {validityData.stats.expired > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{validityData.stats.expired} itens vencidos</strong> no estoque! 
            Valor total: {validityData.stats.totalValue.expired.toLocaleString('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            })}
          </AlertDescription>
        </Alert>
      )}

      {validityData.stats.expiresSoon > 0 && (
        <Alert className="border-warning/50 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription>
            <strong>{validityData.stats.expiresSoon} itens vencem em até 30 dias.</strong>
            {' '}Valor total: {validityData.stats.totalValue.expiresSoon.toLocaleString('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            })}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">
                {validityData.stats.expired}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Vencidos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">
                {validityData.stats.expiresSoon}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Vence em 30 dias</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {validityData.stats.expiring}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Vence em 90 dias</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">
                {validityData.stats.valid}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Válidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Expiration Bar Chart */}
        {validityData.monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Vencimentos por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={validityData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS.expiresSoon}
                    name="Itens vencendo"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Critical Items Table */}
      {hasCriticalItems && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Itens Críticos (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validityData.criticalItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name}
                      {item.code && (
                        <span className="text-xs text-muted-foreground block">
                          {item.code}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.expirationDate
                        ? new Date(item.expirationDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.totalValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status, item.daysUntilExpiry)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
