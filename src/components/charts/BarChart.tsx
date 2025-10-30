import { MedicineItem } from "@/components/MedicineForm";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import Plot from "react-plotly.js";

interface BarChartProps {
  items: MedicineItem[];
  title?: string;
  topN?: number;
}

// Cores RGB que funcionam em light e dark mode
const ABC_COLORS = {
  A: 'rgb(34, 197, 94)',   // verde
  B: 'rgb(234, 179, 8)',   // amarelo
  C: 'rgb(239, 68, 68)',   // vermelho
};

const getTextColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)';
};

const getGridColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)';
};

export const BarChart = ({ items, title = "Top Itens por Valor", topN = 10 }: BarChartProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const topItems = items.slice(0, topN);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  const textColor = getTextColor();
  const gridColor = getGridColor();

  const data = [
    {
      x: topItems.map(i => i.totalValue),
      y: topItems.map(i => i.name.length > 30 ? i.name.substring(0, 27) + "..." : i.name),
      type: "bar" as const,
      orientation: "h" as const,
      marker: {
        color: topItems.map(i => 
          i.classification === "A" ? ABC_COLORS.A :
          i.classification === "B" ? ABC_COLORS.B :
          ABC_COLORS.C
        ),
        line: {
          color: textColor,
          width: 1
        }
      },
      hovertemplate: "<b>%{y}</b><br>Valor: R$ %{x:,.2f}<extra></extra>"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
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
      <Plot
        data={data}
        layout={{
          autosize: true,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: textColor, size: 12 },
          margin: { t: 20, b: 50, l: 220, r: 30 },
          xaxis: {
            title: { text: "Valor Total (R$)", font: { color: textColor } },
            gridcolor: gridColor,
            color: textColor,
            tickfont: { color: textColor }
          },
          yaxis: {
            gridcolor: gridColor,
            color: textColor,
            tickfont: { color: textColor, size: 11 }
          },
          showlegend: false
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: `${500 * zoomLevel}px` }}
      />
    </div>
  );
};
