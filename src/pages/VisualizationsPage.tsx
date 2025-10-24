import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/store/dataStore';
import { FilterBar } from '@/components/shared/FilterBar';
import { ABCChart } from '@/components/ABCChart';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { ScatterChart } from '@/components/charts/ScatterChart';
import { LineChart } from '@/components/charts/LineChart';
import { HeatmapChart } from '@/components/charts/HeatmapChart';

export default function VisualizationsPage() {
  const { filteredItems } = useDataStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visualizações</h1>
        <p className="text-muted-foreground mt-2">
          Explore seus dados através de diferentes visualizações interativas
        </p>
      </div>

      <FilterBar />

      <Tabs defaultValue="pareto" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="pareto">Pareto</TabsTrigger>
          <TabsTrigger value="pie">Pizza</TabsTrigger>
          <TabsTrigger value="bar">Barras</TabsTrigger>
          <TabsTrigger value="scatter">Dispersão</TabsTrigger>
          <TabsTrigger value="line">Linha</TabsTrigger>
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
        </TabsList>

        <TabsContent value="pareto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Curva de Pareto</CardTitle>
            </CardHeader>
            <CardContent>
              <ABCChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Classe ABC</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Itens por Valor</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quantidade vs Preço Unitário</CardTitle>
            </CardHeader>
            <CardContent>
              <ScatterChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valor Acumulado</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valor por Criticidade e Classe ABC</CardTitle>
            </CardHeader>
            <CardContent>
              <HeatmapChart items={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
