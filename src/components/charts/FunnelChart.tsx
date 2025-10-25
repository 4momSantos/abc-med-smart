import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface FunnelChartProps {
  items: MedicineItem[];
  title?: string;
}

export const FunnelChart = ({ items, title = "Funil de Classificação ABC" }: FunnelChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const totalValueA = classA.reduce((sum, item) => sum + item.totalValue, 0);
  const totalValueB = classB.reduce((sum, item) => sum + item.totalValue, 0);
  const totalValueC = classC.reduce((sum, item) => sum + item.totalValue, 0);

  const data = [
    {
      type: "funnel" as const,
      y: ["Classe A", "Classe B", "Classe C"],
      x: [classA.length, classB.length, classC.length],
      text: [
        `${classA.length} itens<br>R$ ${totalValueA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${classB.length} itens<br>R$ ${totalValueB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${classC.length} itens<br>R$ ${totalValueC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ],
      textposition: "inside",
      textinfo: "text",
      marker: {
        color: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]
      },
      hovertemplate: "<b>%{y}</b><br>Quantidade: %{x}<br><extra></extra>"
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
          margin: { t: 20, b: 40, l: 100, r: 40 }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />
    </Card>
  );
};
