import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface ScatterChartProps {
  items: MedicineItem[];
  title?: string;
}

export const ScatterChart = ({ items, title = "Dispersão: Quantidade vs Preço Unitário" }: ScatterChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const createTrace = (data: MedicineItem[], name: string, color: string) => ({
    x: data.map(i => i.quantity),
    y: data.map(i => i.unitPrice),
    mode: "markers" as const,
    type: "scatter" as const,
    name,
    marker: {
      color,
      size: data.map(i => Math.max(8, Math.min(20, i.totalValue / 100))),
      opacity: 0.7
    },
    text: data.map(i => i.name),
    hovertemplate: "<b>%{text}</b><br>Quantidade: %{x}<br>Preço: R$ %{y:,.2f}<extra></extra>"
  });

  const data = [
    createTrace(classA, "Classe A", "hsl(var(--chart-1))"),
    createTrace(classB, "Classe B", "hsl(var(--chart-2))"),
    createTrace(classC, "Classe C", "hsl(var(--chart-3))")
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
          margin: { t: 20, b: 60, l: 80, r: 20 },
          xaxis: {
            title: "Quantidade",
            gridcolor: "hsl(var(--border))",
            color: "hsl(var(--foreground))"
          },
          yaxis: {
            title: "Preço Unitário (R$)",
            gridcolor: "hsl(var(--border))",
            color: "hsl(var(--foreground))"
          },
          showlegend: true,
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: -0.25,
            xanchor: "center",
            x: 0.5
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />
    </Card>
  );
};
