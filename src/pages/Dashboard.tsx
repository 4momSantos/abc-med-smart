import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, TrendingUp, AlertTriangle, Info, Activity } from 'lucide-react';
import { useMedicineOperations } from '@/lib/queries/medicineQueries';
import { useMLStore } from '@/store/mlStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/contexts/AuthContext';
import { FilterBar } from '@/components/shared/FilterBar';
import { ABCTable } from '@/components/ABCTable';
import { ABCSummary } from '@/components/ABCSummary';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { ValidityControl } from '@/components/ValidityControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MedicineItem } from '@/types/medicine';
import { QuantityValueChart } from '@/components/charts/QuantityValueChart';
import { StockDaysChart } from '@/components/charts/StockDaysChart';
import { TurnoverRateChart } from '@/components/charts/TurnoverRateChart';
import { DemandForecastChart } from '@/components/charts/DemandForecastChart';
import { SeasonalityChart } from '@/components/charts/SeasonalityChart';
import { StockAlertsWidget } from '@/components/charts/StockAlertsWidget';
import { KPICard } from '@/components/shared/KPICard';

// Otimização: Limitar dados para gráficos
const MAX_CHART_ITEMS = 100;
const MAX_TABLE_ITEMS = 50;

const getTopItemsByValue = (items: MedicineItem[], limit: number): MedicineItem[] => {
  return [...items]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
};

const aggregateByCategory = (items: MedicineItem[]): MedicineItem[] => {
  const categoryMap = new Map<string, MedicineItem>();
  
  items.forEach(item => {
    const category = item.category || 'Sem Categoria';
    const existing = categoryMap.get(category);
    
    if (existing) {
      existing.totalValue += item.totalValue;
      existing.quantity += item.quantity;
    } else {
      categoryMap.set(category, {
        ...item,
        id: `cat-${category}`,
        name: category,
        category,
      });
    }
  });
  
  return Array.from(categoryMap.values())
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 20); // Top 20 categorias
};

export default function Dashboard() {
  const { currentOrganization } = useAuth();
  const { medicines: filteredItems, kpis, isLoading } = useMedicineOperations(currentOrganization?.id);
  const { anomalies } = useMLStore();
  const { abcConfig, period } = useSettingsStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Performance: Detectar grandes datasets
  const isLargeDataset = filteredItems.length > 1000;
  const showPerformanceWarning = filteredItems.length > 3000;

  // KPIs otimizados
  const stats = useMemo(() => {
    const totalValue = filteredItems.reduce((sum, item) => sum + item.totalValue, 0);
    const classDistribution = { A: 0, B: 0, C: 0 };
    
    filteredItems.forEach((item) => {
      const classification = item.classification || 'C';
      classDistribution[classification]++;
    });

    // Calcular rotatividade média
    const avgRotatividade = filteredItems.reduce((sum, item) => {
      const currentStock = item.currentStock || item.quantity || 1;
      const rotatividade = (item.quantity / currentStock) * 12;
      return sum + rotatividade;
    }, 0) / (filteredItems.length || 1);

    return { totalValue, classDistribution, avgRotatividade };
  }, [filteredItems]);

  const anomalyCount = useMemo(
    () => anomalies.filter((a) => a.isAnomaly).length,
    [anomalies]
  );

  // Dados otimizados para gráficos
  const chartData = useMemo(() => {
    if (isLargeDataset) {
      // Para datasets grandes: mostrar top itens e agregações por categoria
      return {
        topItems: getTopItemsByValue(filteredItems, MAX_CHART_ITEMS),
        categoryAggregated: aggregateByCategory(filteredItems),
      };
    }
    return {
      topItems: filteredItems,
      categoryAggregated: filteredItems,
    };
  }, [filteredItems, isLargeDataset]);

  // Dados paginados para tabela
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * MAX_TABLE_ITEMS;
    return filteredItems.slice(startIndex, startIndex + MAX_TABLE_ITEMS);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / MAX_TABLE_ITEMS);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Principal</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral da análise de Curva ABC
          {isLargeDataset && (
            <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded">
              {filteredItems.length.toLocaleString()} itens - Visualização otimizada
            </span>
          )}
        </p>
      </div>

      {showPerformanceWarning && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Grande volume de dados detectado ({filteredItems.length.toLocaleString()} itens).</strong>
            {' '}Os gráficos estão mostrando os {MAX_CHART_ITEMS} itens de maior valor e agregações por categoria para melhor desempenho.
            Use os filtros para análises mais detalhadas.
          </AlertDescription>
        </Alert>
      )}

      <FilterBar />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Valor Total"
          value={`R$ ${(stats.totalValue / 1000).toFixed(0)}k`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{
            value: 12.5,
            direction: 'up',
            label: 'vs mês anterior'
          }}
          color="success"
        />
        
        <KPICard
          label="Total de Itens"
          value={filteredItems.length.toLocaleString()}
          icon={<Package className="w-5 h-5" />}
          trend={{
            value: 2.3,
            direction: 'down'
          }}
          color="default"
        />

        <KPICard
          label="Classe A"
          value={`${stats.classDistribution.A} itens`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="danger"
        />

        <KPICard
          label="Rotatividade Média"
          value={`${stats.avgRotatividade.toFixed(1)}x`}
          icon={<Activity className="w-5 h-5" />}
          trend={{
            value: 8.2,
            direction: 'up',
            label: 'Por ano'
          }}
          color="default"
        />
      </div>

      {/* Sistema de 4 Abas com 12 Visualizações */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="abc">Análise ABC</TabsTrigger>
          <TabsTrigger value="inventory">Gestão de Estoque</TabsTrigger>
          <TabsTrigger value="predictive">Análise Preditiva</TabsTrigger>
        </TabsList>

        {/* ABA 1: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* 1. Curva ABC (Pareto) */}
          <Card>
            <CardHeader>
              <CardTitle>1. Curva ABC (Pareto) - Análise Clássica</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualização da distribuição 80-15-5: identifica itens críticos que representam 80% do valor
              </p>
            </CardHeader>
            <CardContent>
              <ChartWidget
                items={chartData.topItems}
                chartLibrary="value-analysis"
                defaultChartId="pareto"
                enableComparison={false}
              />
            </CardContent>
          </Card>

          {/* 2. Distribuição por Valor + 3. Quantidade vs Valor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>2. Distribuição por Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  items={chartData.topItems}
                  chartLibrary="distribution-patterns"
                  defaultChartId="pie"
                  enableComparison={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Quantidade vs Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <QuantityValueChart items={filteredItems} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: Análise ABC */}
        <TabsContent value="abc" className="space-y-6">
          {/* 4. Matriz Valor vs Rotatividade */}
          <Card>
            <CardHeader>
              <CardTitle>4. Matriz Valor vs Rotatividade</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Identifica itens de alto valor com baixa rotatividade (risco de obsolescência)
              </p>
            </CardHeader>
            <CardContent>
              <ChartWidget
                items={chartData.topItems}
                chartLibrary="distribution-patterns"
                defaultChartId="scatter"
                enableComparison={false}
              />
            </CardContent>
          </Card>

          {/* 5. Treemap */}
          <Card>
            <CardHeader>
              <CardTitle>5. Mapa de Árvore - Valor por Medicamento</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualização proporcional do valor de cada medicamento (tamanho = valor)
              </p>
            </CardHeader>
            <CardContent>
              <ChartWidget
                items={chartData.topItems.slice(0, 30)}
                chartLibrary="distribution-patterns"
                defaultChartId="treemap"
                enableComparison={false}
              />
            </CardContent>
          </Card>

          {/* 6. Radar Multidimensional */}
          <Card>
            <CardHeader>
              <CardTitle>6. Radar - Análise Multidimensional por Classe</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compara múltiplas dimensões entre as classes ABC
              </p>
            </CardHeader>
            <CardContent>
              <ChartWidget
                items={filteredItems}
                chartLibrary="distribution-patterns"
                defaultChartId="radar"
                enableComparison={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: Gestão de Estoque */}
        <TabsContent value="inventory" className="space-y-6">
          {/* 7. Dias de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>7. Dias de Estoque por Classe ABC</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitora cobertura de estoque - Classe A deve ter menos dias (just-in-time)
              </p>
            </CardHeader>
            <CardContent>
              <StockDaysChart items={chartData.topItems} />
            </CardContent>
          </Card>

          {/* 8. Taxa de Giro + 9. Distribuição de Rotatividade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>8. Taxa de Giro - Top 20</CardTitle>
              </CardHeader>
              <CardContent>
                <TurnoverRateChart items={chartData.topItems} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Distribuição de Rotatividade</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  items={chartData.topItems.slice(0, 50)}
                  chartLibrary="distribution-patterns"
                  defaultChartId="area"
                  enableComparison={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* 10. Alertas Críticos de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>10. Alertas Críticos de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <StockAlertsWidget items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: Análise Preditiva */}
        <TabsContent value="predictive" className="space-y-6">
          {/* 11. Previsão de Demanda */}
          <Card>
            <CardHeader>
              <CardTitle>11. Previsão de Demanda - Próximos 3 Meses</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Baseado em histórico de consumo e sazonalidade
              </p>
            </CardHeader>
            <CardContent>
              <DemandForecastChart items={filteredItems} />
            </CardContent>
          </Card>

          {/* 12. Análise de Sazonalidade */}
          <Card>
            <CardHeader>
              <CardTitle>12. Análise de Sazonalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <SeasonalityChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table - Paginada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens Detalhados</CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * MAX_TABLE_ITEMS) + 1}-
                  {Math.min(currentPage * MAX_TABLE_ITEMS, filteredItems.length)} de {filteredItems.length.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ABCTable 
            items={paginatedItems} 
            abcConfig={abcConfig} 
            period={period} 
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                Anterior
              </button>
              
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                Próxima
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
