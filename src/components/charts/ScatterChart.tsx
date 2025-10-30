import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface ScatterChartProps {
  items: MedicineItem[];
  title?: string;
}

// Cores RGB que funcionam em light e dark mode
const ABC_COLORS = {
  A: 'rgb(34, 197, 94)',   // verde
  B: 'rgb(234, 179, 8)',   // amarelo
  C: 'rgb(239, 68, 68)',   // vermelho
};

const getTextColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)';
};

const getGridColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)';
};

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

  const textColor = getTextColor();
  const gridColor = getGridColor();

  const data = [
    createTrace(classA, "Classe A", ABC_COLORS.A),
    createTrace(classB, "Classe B", ABC_COLORS.B),
    createTrace(classC, "Classe C", ABC_COLORS.C)
  ];

  return (
    <Plot
      data={data}
      layout={{
        autosize: true,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor, size: 13 },
        margin: { t: 30, b: 80, l: 90, r: 30 },
        xaxis: {
          title: { text: "Quantidade", font: { color: textColor } },
          gridcolor: gridColor,
          color: textColor,
          tickfont: { color: textColor }
        },
        yaxis: {
          title: { text: "Preço Unitário (R$)", font: { color: textColor } },
          gridcolor: gridColor,
          color: textColor,
          tickfont: { color: textColor }
        },
        showlegend: true,
        legend: {
          orientation: "h",
          yanchor: "bottom",
          y: -0.3,
          xanchor: "center",
          x: 0.5,
          font: { color: textColor }
        }
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "500px" }}
    />
  );
};
