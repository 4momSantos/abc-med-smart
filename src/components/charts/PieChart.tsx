import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface PieChartProps {
  items: MedicineItem[];
  title?: string;
}

// Converter HSL CSS vars para RGB que Plotly entende
const getABCColors = () => {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    return {
      A: 'rgb(66, 218, 134)',  // Verde vibrante
      B: 'rgb(245, 194, 61)',  // Amarelo/Laranja
      C: 'rgb(235, 110, 115)', // Vermelho/Rosa
    };
  }
  
  return {
    A: 'rgb(39, 174, 96)',   // Verde
    B: 'rgb(247, 202, 24)',  // Amarelo
    C: 'rgb(231, 76, 60)',   // Vermelho
  };
};

export const PieChart = ({ items, title = "Distribuição por Classe ABC" }: PieChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const colors = getABCColors();

  const data = [
    {
      values: [classA.length, classB.length, classC.length],
      labels: ["Classe A", "Classe B", "Classe C"],
      type: "pie" as const,
      marker: {
        colors: [colors.A, colors.B, colors.C]
      },
      textinfo: "label+percent",
      hovertemplate: "<b>%{label}</b><br>Itens: %{value}<br>Percentual: %{percent}<extra></extra>"
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
        margin: { t: 10, b: 10, l: 10, r: 10 },
        showlegend: true,
        legend: {
          orientation: "v",
          yanchor: "middle",
          y: 0.5,
          xanchor: "left",
          x: 1.05
        }
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "350px" }}
    />
  );
};
