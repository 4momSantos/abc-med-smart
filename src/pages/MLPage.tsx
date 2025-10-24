import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Scan, AlertTriangle } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { useMLStore } from '@/store/mlStore';
import { FilterBar } from '@/components/shared/FilterBar';
import { MLPanel } from '@/components/MLPanel';

export default function MLPage() {
  const { filteredItems } = useDataStore();
  const { anomalies, clusters } = useMLStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Machine Learning</h1>
        <p className="text-muted-foreground mt-2">
          Análises avançadas com algoritmos de aprendizado de máquina
        </p>
      </div>

      <FilterBar />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clustering</CardTitle>
            <Brain className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clusters.length > 0 ? `${new Set(clusters.map(c => c.cluster)).size} grupos` : 'Não executado'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agrupamento por similaridade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anomalias</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter(a => a.isAnomaly).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens com comportamento atípico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Análise</CardTitle>
            <Scan className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens sendo analisados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Analysis Panel */}
      <MLPanel items={filteredItems} />
    </div>
  );
}
