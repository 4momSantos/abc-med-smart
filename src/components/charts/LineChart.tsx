import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface LineChartProps {
  items: MedicineItem[];
  title?: string;
}

export const LineChart = ({ items, title = "Curva de Valor Acumulado" }: LineChartProps) => {
  const data = [
    {
      x: items.map((_, idx) => idx + 1),
      y: items.map(i => i.accumulatedPercentage),
      type: "scatter" as const,
      mode: "lines+markers" as const,
      name: "% Acumulado",
      line: {
        color: "hsl(var(--primary))",
        width: 3
      },
      marker: {
        color: items.map(i => 
          i.classification === "A" ? "hsl(var(--chart-1))" :
          i.classification === "B" ? "hsl(var(--chart-2))" :
          "hsl(var(--chart-3))"
        ),
        size: 6
      },
      text: items.map(i => i.name),
      hovertemplate: "<b>%{text}</b><br>Posição: %{x}<br>Acumulado: %{y:.2f}%<extra></extra>"
    }
  ];

  // Linhas de referência para 80% e 95%
  const shapes = [
    {
      type: "line" as const,
      x0: 0,
      x1: items.length,
      y0: 80,
      y1: 80,
      line: {
        color: "hsl(var(--chart-1))",
        width: 2,
        dash: "dash" as const
      }
    },
    {
      type: "line" as const,
      x0: 0,
      x1: items.length,
      y0: 95,
      y1: 95,
      line: {
        color: "hsl(var(--chart-2))",
        width: 2,
        dash: "dash" as const
      }
    }
  ];

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <Plot
        data={data}
        layout={{
          autosize: true,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "hsl(var(--foreground))" },
          margin: { t: 20, b: 60, l: 60, r: 20 },
          xaxis: {
            title: "Itens (ordenados por valor)",
            gridcolor: "hsl(var(--border))",
            color: "hsl(var(--foreground))"
          },
          yaxis: {
            title: "Percentual Acumulado (%)",
            gridcolor: "hsl(var(--border))",
            color: "hsl(var(--foreground))",
            range: [0, 105]
          },
          shapes,
          showlegend: false
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />
    </Card>
  );
};
