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
      A: 'rgb(74, 222, 128)',    // Verde vibrante
      B: 'rgb(251, 191, 36)',    // Amarelo/Laranja vibrante
      C: 'rgb(248, 113, 113)',   // Vermelho/Rosa vibrante
    };
  }
  
  return {
    A: 'rgb(34, 197, 94)',     // Verde escuro
    B: 'rgb(234, 179, 8)',     // Amarelo escuro
    C: 'rgb(239, 68, 68)',     // Vermelho escuro
  };
};

const getTextColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgb(226, 232, 240)' : 'rgb(30, 41, 59)';
};

const getGridColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)';
};

export const PieChart = ({ items, title = "Distribuição por Classe ABC" }: PieChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const colors = getABCColors();
  const textColor = getTextColor();

  const data = [
    {
      values: [classA.length, classB.length, classC.length],
      labels: ["Classe A", "Classe B", "Classe C"],
      type: "pie" as const,
      marker: {
        colors: [colors.A, colors.B, colors.C],
        line: { color: textColor, width: 1 }
      },
      textfont: { color: textColor, size: 12 },
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
        font: { color: textColor, size: 12 },
        margin: { t: 10, b: 10, l: 10, r: 10 },
        showlegend: true,
        legend: {
          orientation: "v",
          yanchor: "middle",
          y: 0.5,
          xanchor: "left",
          x: 1.05,
          font: { color: textColor }
        }
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "350px" }}
    />
  );
};
