import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicineItem } from "./MedicineForm";
import { KMeansClustering } from "@/lib/ml/clustering";
import { AnomalyDetector } from "@/lib/ml/anomalyDetection";
import { ClusterResult, AnomalyResult } from "@/types/ml";
import { Brain, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MLPanelProps {
  items: MedicineItem[];
  onAnalysisComplete?: (clusters: ClusterResult[], anomalies: AnomalyResult[]) => void;
}

export const MLPanel = ({ items, onAnalysisComplete }: MLPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clusters, setClusters] = useState<ClusterResult[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [numClusters, setNumClusters] = useState(3);
  const { toast } = useToast();

  const runClustering = async () => {
    if (items.length < 3) {
      toast({
        title: "Dados insuficientes",
        description: "É necessário pelo menos 3 itens para executar o clustering",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const clusterer = new KMeansClustering();
      const result = clusterer.fit(items, numClusters);
      setClusters(result.results);
      
      toast({
        title: "Clustering concluído",
        description: `${result.results.length} itens agrupados em ${numClusters} clusters (Silhouette Score: ${result.summary.silhouetteScore.toFixed(3)})`
      });
    } catch (error) {
      toast({
        title: "Erro no clustering",
        description: "Não foi possível executar a análise",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const runAnomalyDetection = async () => {
    if (items.length < 3) {
      toast({
        title: "Dados insuficientes",
        description: "É necessário pelo menos 3 itens para detectar anomalias",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const detector = new AnomalyDetector(3);
      const results = detector.detect(items);
      setAnomalies(results);
      
      const anomalyCount = results.filter(r => r.isAnomaly).length;
      
      toast({
        title: "Detecção de anomalias concluída",
        description: `${anomalyCount} anomalias detectadas de ${results.length} itens analisados`
      });
      
      if (onAnalysisComplete) {
        onAnalysisComplete(clusters, results);
      }
    } catch (error) {
      toast({
        title: "Erro na detecção",
        description: "Não foi possível detectar anomalias",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Análises com Machine Learning</h3>
      </div>

      <Tabs defaultValue="clustering">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clustering">Clustering (K-Means)</TabsTrigger>
          <TabsTrigger value="anomalies">Detecção de Anomalias</TabsTrigger>
        </TabsList>

        <TabsContent value="clustering" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Número de Clusters</label>
              <input
                type="number"
                min="2"
                max="10"
                value={numClusters}
                onChange={(e) => setNumClusters(parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <Button 
              onClick={runClustering} 
              disabled={isProcessing || items.length < 3}
              className="mt-6"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Executar Clustering"
              )}
            </Button>
          </div>

          {clusters.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Resultados do Clustering</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clusters.map((result) => (
                  <div key={result.itemId} className="p-3 bg-muted rounded-md border border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{result.itemName}</p>
                        <p className="text-sm text-muted-foreground">Cluster {result.cluster + 1}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Distância: {result.distance.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Button 
            onClick={runAnomalyDetection} 
            disabled={isProcessing || items.length < 3}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Detectar Anomalias"
            )}
          </Button>

          {anomalies.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Anomalias Detectadas</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {anomalies.filter(a => a.isAnomaly).map((result) => (
                  <div key={result.itemId} className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{result.itemName}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Score de anomalia: {result.anomalyScore.toFixed(2)}
                        </p>
                        <ul className="text-sm space-y-1">
                          {result.reasons.map((reason, idx) => (
                            <li key={idx} className="text-muted-foreground">• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                {anomalies.filter(a => a.isAnomaly).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma anomalia detectada
                  </p>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
