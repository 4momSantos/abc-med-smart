import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface SunburstChartProps {
  items: MedicineItem[];
  title?: string;
}

export const SunburstChart = ({ items, title = "Hierarquia Circular de Valor" }: SunburstChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const topA = classA.sort((a, b) => b.totalValue - a.totalValue).slice(0, 8);
  const topB = classB.sort((a, b) => b.totalValue - a.totalValue).slice(0, 8);
  const topC = classC.sort((a, b) => b.totalValue - a.totalValue).slice(0, 8);

  const labels = ["Total", "Classe A", "Classe B", "Classe C"];
  const parents = ["", "Total", "Total", "Total"];
  const values = [
    items.reduce((sum, i) => sum + i.totalValue, 0),
    classA.reduce((sum, i) => sum + i.totalValue, 0),
    classB.reduce((sum, i) => sum + i.totalValue, 0),
    classC.reduce((sum, i) => sum + i.totalValue, 0)
  ];

  topA.forEach(item => {
    labels.push(item.code);
    parents.push("Classe A");
    values.push(item.totalValue);
  });

  topB.forEach(item => {
    labels.push(item.code);
    parents.push("Classe B");
    values.push(item.totalValue);
  });

  topC.forEach(item => {
    labels.push(item.code);
    parents.push("Classe C");
    values.push(item.totalValue);
  });

  const data = [
    {
      type: "sunburst" as const,
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: "total",
      marker: {
        line: { width: 2 }
      },
      hovertemplate: "<b>%{label}</b><br>Valor: R$ %{value:.2f}<br><extra></extra>"
    }
  ];

  return (
    <Plot
      data={data}
      layout={{
        autosize: true,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: "hsl(var(--foreground))" },
        margin: { t: 0, b: 0, l: 0, r: 0 },
        sunburstcolorway: [
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))"
        ]
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "450px" }}
    />
  );
};
