import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import Plot from "react-plotly.js";

interface HeatmapChartProps {
  items: MedicineItem[];
  title?: string;
}

export const HeatmapChart = ({ items, title = "Mapa de Calor: Valor por Criticidade e Classe" }: HeatmapChartProps) => {
  // Criar matriz de valores agregados
  const criticalities = ["baixa", "média", "alta"];
  const classes = ["A", "B", "C"];
  
  const matrix = criticalities.map(crit => 
    classes.map(cls => {
      const filtered = items.filter(
        i => i.clinicalCriticality === crit && i.classification === cls
      );
      return filtered.reduce((sum, i) => sum + i.totalValue, 0);
    })
  );

  const data = [
    {
      z: matrix,
      x: classes,
      y: criticalities.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      type: "heatmap" as const,
      colorscale: [
        [0, "hsl(var(--muted))"],
        [0.5, "hsl(var(--primary) / 0.5)"],
        [1, "hsl(var(--primary))"]
      ],
      hovertemplate: "Classe %{x}<br>Criticidade: %{y}<br>Valor Total: R$ %{z:,.2f}<extra></extra>",
      showscale: true,
      colorbar: {
        title: "Valor (R$)",
        titleside: "right"
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
          margin: { t: 20, b: 60, l: 80, r: 100 },
          xaxis: {
            title: "Classe ABC",
            color: "hsl(var(--foreground))"
          },
          yaxis: {
            title: "Criticidade Clínica",
            color: "hsl(var(--foreground))"
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "350px" }}
      />
    </Card>
  );
};
