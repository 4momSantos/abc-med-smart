import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface BoxPlotChartProps {
  items: MedicineItem[];
  title?: string;
}

export const BoxPlotChart = ({ items, title = "Distribuição de Preços por Classe" }: BoxPlotChartProps) => {
  const classA = items.filter(i => i.classification === "A").map(i => i.unitPrice);
  const classB = items.filter(i => i.classification === "B").map(i => i.unitPrice);
  const classC = items.filter(i => i.classification === "C").map(i => i.unitPrice);

  const data = [
    {
      y: classA,
      type: "box" as const,
      name: "Classe A",
      marker: { color: "hsl(var(--chart-1))" },
      boxmean: "sd"
    },
    {
      y: classB,
      type: "box" as const,
      name: "Classe B",
      marker: { color: "hsl(var(--chart-2))" },
      boxmean: "sd"
    },
    {
      y: classC,
      type: "box" as const,
      name: "Classe C",
      marker: { color: "hsl(var(--chart-3))" },
      boxmean: "sd"
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
          margin: { t: 20, b: 60, l: 60, r: 40 },
          yaxis: { 
            title: "Preço Unitário (R$)",
            gridcolor: "hsl(var(--border))"
          },
          showlegend: true,
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: -0.3,
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
