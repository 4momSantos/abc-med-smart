import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import Plot from "react-plotly.js";

interface BarChartProps {
  items: MedicineItem[];
  title?: string;
  topN?: number;
}

export const BarChart = ({ items, title = "Top Itens por Valor", topN = 10 }: BarChartProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const topItems = items.slice(0, topN);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  const data = [
    {
      x: topItems.map(i => i.totalValue),
      y: topItems.map(i => i.name.length > 30 ? i.name.substring(0, 27) + "..." : i.name),
      type: "bar" as const,
      orientation: "h" as const,
      marker: {
        color: topItems.map(i => 
          i.classification === "A" ? "hsl(var(--chart-1))" :
          i.classification === "B" ? "hsl(var(--chart-2))" :
          "hsl(var(--chart-3))"
        )
      },
      hovertemplate: "<b>%{y}</b><br>Valor: R$ %{x:,.2f}<extra></extra>"
    }
  ];

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            title="Reduzir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2}
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Plot
        data={data}
        layout={{
          autosize: true,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "hsl(var(--foreground))", size: 11 },
          margin: { t: 20, b: 40, l: 200, r: 20 },
          xaxis: {
            title: "Valor Total (R$)",
            gridcolor: "hsl(var(--border))",
            color: "hsl(var(--foreground))"
          },
          yaxis: {
            gridcolor: "hsl(var(--border))",
            color: "hsl(var(--foreground))"
          },
          showlegend: false
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: `${400 * zoomLevel}px` }}
      />
    </Card>
  );
};
