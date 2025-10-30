import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface HeatmapChartProps {
  items: MedicineItem[];
  title?: string;
}

const getTextColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgb(226, 232, 240)' : 'rgb(30, 41, 59)';
};

const getHeatmapColors = () => {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    return [
      [0, 'rgb(15, 23, 42)'],      // slate-950
      [0.25, 'rgb(59, 130, 246)'], // blue-500
      [0.5, 'rgb(139, 92, 246)'],  // violet-500
      [0.75, 'rgb(236, 72, 153)'], // pink-500
      [1, 'rgb(251, 113, 133)']    // rose-400
    ];
  }
  
  return [
    [0, 'rgb(241, 245, 249)'],   // slate-100
    [0.25, 'rgb(96, 165, 250)'], // blue-400
    [0.5, 'rgb(167, 139, 250)'], // violet-400
    [0.75, 'rgb(244, 114, 182)'],// pink-400
    [1, 'rgb(239, 68, 68)']      // red-500
  ];
};

export const HeatmapChart = ({ items, title = "Mapa de Calor: Valor por Criticidade e Classe" }: HeatmapChartProps) => {
  // Criar matriz de valores agregados
  const criticalities = ["baixa", "média", "alta"];
  const classes = ["A", "B", "C"];
  const textColor = getTextColor();
  const colorscale = getHeatmapColors();
  
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
      colorscale: colorscale,
      hovertemplate: "Classe %{x}<br>Criticidade: %{y}<br>Valor Total: R$ %{z:,.2f}<extra></extra>",
      showscale: true,
      colorbar: {
        title: "Valor (R$)",
        titleside: "right",
        tickfont: { color: textColor },
        titlefont: { color: textColor }
      },
      texttemplate: "R$ %{z:,.0f}",
      textfont: { color: textColor, size: 11 }
    }
  ];

  return (
    <Plot
      data={data}
      layout={{
        autosize: true,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor, size: 12 },
        margin: { t: 20, b: 60, l: 80, r: 100 },
        xaxis: {
          title: "Classe ABC",
          color: textColor,
          tickfont: { color: textColor }
        },
        yaxis: {
          title: "Criticidade Clínica",
          color: textColor,
          tickfont: { color: textColor }
        }
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "350px" }}
    />
  );
};
