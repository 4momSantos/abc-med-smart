import { MedicineItem } from "@/components/MedicineForm";
import Plot from "react-plotly.js";

interface FunnelChartProps {
  items: MedicineItem[];
  title?: string;
}

// Cores RGB fixas para classes ABC
const ABC_COLORS = {
  A: 'rgb(34, 197, 94)',   // verde
  B: 'rgb(234, 179, 8)',   // amarelo
  C: 'rgb(239, 68, 68)',   // vermelho
};

const getTextColor = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)';
};

export const FunnelChart = ({ items, title = "Funil de Classificação ABC" }: FunnelChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const totalValueA = classA.reduce((sum, item) => sum + item.totalValue, 0);
  const totalValueB = classB.reduce((sum, item) => sum + item.totalValue, 0);
  const totalValueC = classC.reduce((sum, item) => sum + item.totalValue, 0);

  const totalValue = totalValueA + totalValueB + totalValueC;
  const percentA = totalValue > 0 ? (totalValueA / totalValue * 100).toFixed(1) : 0;
  const percentB = totalValue > 0 ? (totalValueB / totalValue * 100).toFixed(1) : 0;
  const percentC = totalValue > 0 ? (totalValueC / totalValue * 100).toFixed(1) : 0;

  const textColor = getTextColor();

  const data = [
    {
      type: "funnel" as const,
      y: ["Classe A", "Classe B", "Classe C"],
      x: [classA.length, classB.length, classC.length],
      text: [
        `${classA.length} itens (${percentA}%)<br>R$ ${totalValueA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${classB.length} itens (${percentB}%)<br>R$ ${totalValueB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${classC.length} itens (${percentC}%)<br>R$ ${totalValueC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ],
      textposition: "inside",
      textinfo: "text",
      textfont: {
        size: 14,
        color: 'white',
        family: 'Inter, system-ui, sans-serif'
      },
      marker: {
        color: [ABC_COLORS.A, ABC_COLORS.B, ABC_COLORS.C],
        line: {
          color: textColor,
          width: 2
        }
      },
      hovertemplate: "<b>%{y}</b><br>Quantidade: %{x} itens<br><extra></extra>",
      connector: {
        line: {
          color: textColor,
          width: 2
        }
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
        font: { 
          color: textColor,
          size: 14,
          family: 'Inter, system-ui, sans-serif'
        },
        margin: { t: 30, b: 50, l: 140, r: 50 },
        yaxis: {
          color: textColor,
          tickfont: { size: 14, color: textColor }
        }
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "600px" }}
    />
  );
};
