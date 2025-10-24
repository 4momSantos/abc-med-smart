import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface PieChartProps {
  items: MedicineItem[];
  title?: string;
}

export const PieChart = ({ items, title = "Distribuição por Classe ABC" }: PieChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const data = [
    {
      values: [classA.length, classB.length, classC.length],
      labels: ["Classe A", "Classe B", "Classe C"],
      type: "pie" as const,
      marker: {
        colors: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]
      },
      textinfo: "label+percent",
      hovertemplate: "<b>%{label}</b><br>Itens: %{value}<br>Percentual: %{percent}<extra></extra>"
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
          margin: { t: 0, b: 0, l: 0, r: 0 },
          showlegend: true,
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: -0.2,
            xanchor: "center",
            x: 0.5
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "350px" }}
      />
    </Card>
  );
};
