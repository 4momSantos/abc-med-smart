import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { useMLStore } from '@/store/mlStore';
import { useSettingsStore } from '@/store/settingsStore';
import { FilterBar } from '@/components/shared/FilterBar';
import { ABCChart } from '@/components/ABCChart';
import { ABCTable } from '@/components/ABCTable';
import { ABCSummary } from '@/components/ABCSummary';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';

export default function Dashboard() {
  const { filteredItems } = useDataStore();
  const { anomalies } = useMLStore();
  const { abcConfig, period } = useSettingsStore();

  const totalValue = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.totalValue, 0),
    [filteredItems]
  );

  const classDistribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0 };
    filteredItems.forEach((item) => {
      dist[item.classification]++;
    });
    return dist;
  }, [filteredItems]);

  const anomalyCount = useMemo(
    () => anomalies.filter((a) => a.isAnomaly).length,
    [anomalies]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Principal</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral da análise de Curva ABC
        </p>
      </div>

      <FilterBar />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classe A</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classDistribution.A}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((classDistribution.A / filteredItems.length) * 100 || 0).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anomalias</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens com comportamento atípico</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Curva de Pareto</CardTitle>
          </CardHeader>
          <CardContent>
            <ABCChart items={filteredItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart items={filteredItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Itens por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={filteredItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo ABC</CardTitle>
          </CardHeader>
          <CardContent>
            <ABCSummary items={filteredItems} />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <ABCTable items={filteredItems} abcConfig={abcConfig} period={period} />
        </CardContent>
      </Card>
    </div>
  );
}
