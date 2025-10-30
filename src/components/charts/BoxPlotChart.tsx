import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface BoxPlotChartProps {
  items: MedicineItem[];
  title?: string;
}

const getABCColors = () => {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    return {
      A: 'rgb(74, 222, 128)',
      B: 'rgb(251, 191, 36)',
      C: 'rgb(248, 113, 113)',
    };
  }
  
  return {
    A: 'rgb(34, 197, 94)',
    B: 'rgb(234, 179, 8)',
    C: 'rgb(239, 68, 68)',
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

export const BoxPlotChart = ({ items, title = "Distribuição de Preços por Classe" }: BoxPlotChartProps) => {
  const classA = items.filter(i => i.classification === "A").map(i => i.unitPrice);
  const classB = items.filter(i => i.classification === "B").map(i => i.unitPrice);
  const classC = items.filter(i => i.classification === "C").map(i => i.unitPrice);
  
  const colors = getABCColors();
  const textColor = getTextColor();
  const gridColor = getGridColor();

  const data = [
    {
      y: classA,
      type: "box" as const,
      name: "Classe A",
      marker: { color: colors.A },
      line: { color: colors.A },
      boxmean: "sd"
    },
    {
      y: classB,
      type: "box" as const,
      name: "Classe B",
      marker: { color: colors.B },
      line: { color: colors.B },
      boxmean: "sd"
    },
    {
      y: classC,
      type: "box" as const,
      name: "Classe C",
      marker: { color: colors.C },
      line: { color: colors.C },
      boxmean: "sd"
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
        margin: { t: 20, b: 60, l: 60, r: 40 },
        yaxis: { 
          title: "Preço Unitário (R$)",
          gridcolor: gridColor,
          color: textColor
        },
        xaxis: {
          color: textColor
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
      style={{ width: "100%", height: "400px" }}
    />
  );
};
