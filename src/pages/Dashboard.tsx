import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { useMLStore } from '@/store/mlStore';
import { useSettingsStore } from '@/store/settingsStore';
import { FilterBar } from '@/components/shared/FilterBar';
import { ABCTable } from '@/components/ABCTable';
import { ABCSummary } from '@/components/ABCSummary';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { ValidityControl } from '@/components/ValidityControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MedicineItem } from '@/types/medicine';

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
  const { filteredItems } = useDataStore();
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
      if (item.classification) {
        classDistribution[item.classification]++;
      }
    });

    return { totalValue, classDistribution };
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLargeDataset ? 'Dataset otimizado para visualização' : 'Todos os itens'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
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
            <div className="text-2xl font-bold">{stats.classDistribution.A.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.classDistribution.A / filteredItems.length) * 100 || 0).toFixed(1)}% do total
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

      {/* Charts Grid - Otimizados */}
      <Tabs defaultValue="value" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="value">Análise de Valor</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="validity">Controle de Validade</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="value" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              items={chartData.topItems}
              chartLibrary="value-analysis"
              defaultChartId="pareto"
              enableComparison
              onCompare={(items) => console.log('Comparar:', items)}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Por Categoria (Top 20)</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Agregação por categoria dos {filteredItems.length} itens
                </p>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  items={chartData.categoryAggregated}
                  chartLibrary="value-analysis"
                  defaultChartId="bar"
                  enableComparison={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              items={chartData.topItems}
              chartLibrary="distribution-patterns"
              defaultChartId="pie"
              enableComparison
              onCompare={(items) => console.log('Comparar:', items)}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo ABC</CardTitle>
              </CardHeader>
              <CardContent>
                <ABCSummary items={filteredItems} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validity" className="space-y-4">
          <ValidityControl items={filteredItems} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Completo ABC</CardTitle>
            </CardHeader>
            <CardContent>
              <ABCSummary items={filteredItems} />
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
