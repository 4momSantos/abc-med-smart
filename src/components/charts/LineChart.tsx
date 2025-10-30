import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface LineChartProps {
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

export const LineChart = ({ items, title = "Curva de Valor Acumulado" }: LineChartProps) => {
  const textColor = getTextColor();
  const gridColor = getGridColor();

  const data = [
    {
      x: items.map((_, idx) => idx + 1),
      y: items.map(i => i.accumulatedPercentage),
      type: "scatter" as const,
      mode: "lines+markers" as const,
      name: "% Acumulado",
      line: {
        color: 'rgb(99, 102, 241)',
        width: 3
      },
      marker: {
        color: items.map(i => 
          i.classification === "A" ? ABC_COLORS.A :
          i.classification === "B" ? ABC_COLORS.B :
          ABC_COLORS.C
        ),
        size: 6
      },
      text: items.map(i => i.name),
      hovertemplate: "<b>%{text}</b><br>Posição: %{x}<br>Acumulado: %{y:.2f}%<extra></extra>"
    }
  ];

  // Linhas de referência para 80% e 95%
  const shapes = [
    {
      type: "line" as const,
      x0: 0,
      x1: items.length,
      y0: 80,
      y1: 80,
      line: {
        color: ABC_COLORS.A,
        width: 2,
        dash: "dash" as const
      }
    },
    {
      type: "line" as const,
      x0: 0,
      x1: items.length,
      y0: 95,
      y1: 95,
      line: {
        color: ABC_COLORS.B,
        width: 2,
        dash: "dash" as const
      }
    }
  ];

  return (
    <Plot
      data={data}
      layout={{
        autosize: true,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor, size: 13 },
        margin: { t: 30, b: 70, l: 70, r: 30 },
        xaxis: {
          title: { text: "Itens (ordenados por valor)", font: { color: textColor } },
          gridcolor: gridColor,
          color: textColor,
          tickfont: { color: textColor }
        },
        yaxis: {
          title: { text: "Percentual Acumulado (%)", font: { color: textColor } },
          gridcolor: gridColor,
          color: textColor,
          tickfont: { color: textColor },
          range: [0, 105]
        },
        shapes,
        showlegend: false
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "500px" }}
    />
  );
};
