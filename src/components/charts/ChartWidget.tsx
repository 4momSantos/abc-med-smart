import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, GitCompare, Maximize2, Download } from "lucide-react";
import { MedicineItem } from "@/components/MedicineForm";
import { PieChart } from "./PieChart";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";
import { ScatterChart } from "./ScatterChart";
import { HeatmapChart } from "./HeatmapChart";
import { ABCChart } from "../ABCChart";
import { FunnelChart } from "./FunnelChart";
import { BoxPlotChart } from "./BoxPlotChart";
import { RadarChart } from "./RadarChart";
import { AreaChart } from "./AreaChart";
import { TreemapChart } from "./TreemapChart";
import { SunburstChart } from "./SunburstChart";

interface ChartType {
  id: string;
  name: string;
  component: React.ComponentType<{ items: MedicineItem[]; title?: string }>;
}

const valueAnalysisCharts: ChartType[] = [
  { id: "pareto", name: "Curva de Pareto", component: ABCChart },
  { id: "funnel", name: "Funil de Classificação", component: FunnelChart },
  { id: "line", name: "Curva de Valor Acumulado", component: LineChart },
  { id: "area", name: "Área Acumulada", component: AreaChart },
  { id: "treemap", name: "Hierarquia de Valor", component: TreemapChart },
  { id: "bar", name: "Top Itens por Valor", component: BarChart },
];

const distributionPatternsCharts: ChartType[] = [
  { id: "pie", name: "Distribuição por Classe", component: PieChart },
  { id: "scatter", name: "Dispersão Quantidade/Preço", component: ScatterChart },
  { id: "heatmap", name: "Mapa de Calor", component: HeatmapChart },
  { id: "boxplot", name: "Distribuição de Preços", component: BoxPlotChart },
  { id: "radar", name: "Perfil Multidimensional", component: RadarChart },
  { id: "sunburst", name: "Hierarquia Circular", component: SunburstChart },
];

interface ChartWidgetProps {
  items: MedicineItem[];
  chartLibrary: "value-analysis" | "distribution-patterns";
  defaultChartId?: string;
  enableComparison?: boolean;
  onCompare?: (items: MedicineItem[]) => void;
}

export const ChartWidget = ({
  items,
  chartLibrary,
  defaultChartId,
  enableComparison = false,
  onCompare,
}: ChartWidgetProps) => {
  const chartTypes = chartLibrary === "value-analysis" ? valueAnalysisCharts : distributionPatternsCharts;
  
  const defaultIndex = defaultChartId 
    ? chartTypes.findIndex((c) => c.id === defaultChartId)
    : 0;
  
  const [currentIndex, setCurrentIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);
  const [selectedItems, setSelectedItems] = useState<MedicineItem[]>([]);

  const currentChart = chartTypes[currentIndex];
  const ChartComponent = currentChart.component;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : chartTypes.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < chartTypes.length - 1 ? prev + 1 : 0));
  };

  const handleCompare = () => {
    if (onCompare && selectedItems.length > 0) {
      onCompare(selectedItems);
    }
  };

  const handleFullscreen = () => {
    // TODO: Implementar visualização em tela cheia
    console.log("Fullscreen:", currentChart.id);
  };

  const handleDownload = () => {
    // TODO: Implementar download do gráfico
    console.log("Download:", currentChart.id);
  };

  return (
    <Card className="shadow-[var(--shadow-medium)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              title="Gráfico anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CardTitle className="text-lg">
              {currentChart.name}
            </CardTitle>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              title="Próximo gráfico"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {enableComparison && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
                disabled={selectedItems.length === 0}
                title="Comparar itens selecionados"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar ({selectedItems.length})
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              title="Tela cheia"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Baixar gráfico"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          {currentIndex + 1} de {chartTypes.length} visualizações • {chartLibrary === "value-analysis" ? "Análise de Valor" : "Distribuição e Padrões"}
        </div>
      </CardHeader>

      <CardContent>
        <ChartComponent items={items} />
      </CardContent>
    </Card>
  );
};
