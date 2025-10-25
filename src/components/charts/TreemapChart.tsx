import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface TreemapChartProps {
  items: MedicineItem[];
  title?: string;
}

export const TreemapChart = ({ items, title = "Hierarquia de Valor por Item" }: TreemapChartProps) => {
  const topItems = [...items].sort((a, b) => b.totalValue - a.totalValue).slice(0, 20);

  const labels = topItems.map(item => item.code);
  const parents = topItems.map(() => "");
  const values = topItems.map(item => item.totalValue);
  const colors = topItems.map(item => {
    switch (item.classification) {
      case "A": return "hsl(var(--chart-1))";
      case "B": return "hsl(var(--chart-2))";
      case "C": return "hsl(var(--chart-3))";
      default: return "hsl(var(--muted))";
    }
  });

  const data = [
    {
      type: "treemap" as const,
      labels: labels,
      parents: parents,
      values: values,
      marker: {
        colors: colors
      },
      text: topItems.map(item => 
        `${item.code}<br>${item.classification}<br>R$ ${item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ),
      textposition: "middle center",
      hovertemplate: "<b>%{label}</b><br>Valor: R$ %{value:.2f}<br><extra></extra>"
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
          font: { color: "hsl(var(--foreground))", size: 10 },
          margin: { t: 0, b: 0, l: 0, r: 0 }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "450px" }}
      />
    </Card>
  );
};
