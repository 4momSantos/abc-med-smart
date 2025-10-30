import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface TreemapChartProps {
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

export const TreemapChart = ({ items, title = "Hierarquia de Valor por Item" }: TreemapChartProps) => {
  const topItems = [...items].sort((a, b) => b.totalValue - a.totalValue).slice(0, 20);
  const colors = getABCColors();
  const textColor = getTextColor();

  const labels = topItems.map(item => item.code);
  const parents = topItems.map(() => "");
  const values = topItems.map(item => item.totalValue);
  const itemColors = topItems.map(item => {
    switch (item.classification) {
      case "A": return colors.A;
      case "B": return colors.B;
      case "C": return colors.C;
      default: return textColor;
    }
  });

  const data = [
    {
      type: "treemap" as const,
      labels: labels,
      parents: parents,
      values: values,
      marker: {
        colors: itemColors,
        line: { color: textColor, width: 2 }
      },
      text: topItems.map(item => 
        `${item.code}<br>${item.classification}<br>R$ ${item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ),
      textfont: { color: textColor, size: 11, family: 'Inter, system-ui, sans-serif' },
      textposition: "middle center",
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
        font: { color: textColor, size: 11 },
        margin: { t: 0, b: 0, l: 0, r: 0 }
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "450px" }}
    />
  );
};
