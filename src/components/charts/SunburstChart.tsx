import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface SunburstChartProps {
  items: MedicineItem[];
  title?: string;
}

// Cores RGB que funcionam em light e dark mode
const getTextColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)';
};

const getSunburstColors = () => [
  'rgb(34, 197, 94)',   // verde (A)
  'rgb(234, 179, 8)',   // amarelo (B)
  'rgb(239, 68, 68)',   // vermelho (C)
  'rgb(99, 102, 241)',  // índigo
  'rgb(168, 85, 247)',  // roxo
];

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

  const textColor = getTextColor();
  const sunburstColors = getSunburstColors();

  const data = [
    {
      type: "sunburst" as const,
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: "total",
      marker: {
        line: { 
          width: 2,
          color: textColor
        }
      },
      textfont: {
        size: 13,
        color: textColor
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
        font: { color: textColor, size: 13 },
        margin: { t: 10, b: 10, l: 10, r: 10 },
        sunburstcolorway: sunburstColors
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "500px" }}
    />
  );
};
