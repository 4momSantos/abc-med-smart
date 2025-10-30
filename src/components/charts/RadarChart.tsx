import { MedicineItem } from "@/components/MedicineForm";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer } from "recharts";

interface RadarChartProps {
  items: MedicineItem[];
  title?: string;
}

// Cores RGB que funcionam em light e dark mode
const ABC_COLORS = {
  A: 'rgb(34, 197, 94)',   // verde
  B: 'rgb(234, 179, 8)',   // amarelo
  C: 'rgb(239, 68, 68)',   // vermelho
};

export const RadarChart = ({ items, title = "Perfil Multidimensional por Classe" }: RadarChartProps) => {
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");

  const avgQuantityA = classA.reduce((sum, i) => sum + i.quantity, 0) / (classA.length || 1);
  const avgQuantityB = classB.reduce((sum, i) => sum + i.quantity, 0) / (classB.length || 1);
  const avgQuantityC = classC.reduce((sum, i) => sum + i.quantity, 0) / (classC.length || 1);

  const avgPriceA = classA.reduce((sum, i) => sum + i.unitPrice, 0) / (classA.length || 1);
  const avgPriceB = classB.reduce((sum, i) => sum + i.unitPrice, 0) / (classB.length || 1);
  const avgPriceC = classC.reduce((sum, i) => sum + i.unitPrice, 0) / (classC.length || 1);

  const avgValueA = classA.reduce((sum, i) => sum + i.totalValue, 0) / (classA.length || 1);
  const avgValueB = classB.reduce((sum, i) => sum + i.totalValue, 0) / (classB.length || 1);
  const avgValueC = classC.reduce((sum, i) => sum + i.totalValue, 0) / (classC.length || 1);

  const maxQty = Math.max(avgQuantityA, avgQuantityB, avgQuantityC);
  const maxPrice = Math.max(avgPriceA, avgPriceB, avgPriceC);
  const maxValue = Math.max(avgValueA, avgValueB, avgValueC);

  const data = [
    {
      subject: "Qtd Média",
      A: (avgQuantityA / maxQty) * 100,
      B: (avgQuantityB / maxQty) * 100,
      C: (avgQuantityC / maxQty) * 100,
    },
    {
      subject: "Preço Médio",
      A: (avgPriceA / maxPrice) * 100,
      B: (avgPriceB / maxPrice) * 100,
      C: (avgPriceC / maxPrice) * 100,
    },
    {
      subject: "Valor Médio",
      A: (avgValueA / maxValue) * 100,
      B: (avgValueB / maxValue) * 100,
      C: (avgValueC / maxValue) * 100,
    },
    {
      subject: "Nº Itens",
      A: (classA.length / items.length) * 100,
      B: (classB.length / items.length) * 100,
      C: (classC.length / items.length) * 100,
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <RechartsRadar data={data}>
        <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }} 
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} 
        />
        <Radar 
          name="Classe A" 
          dataKey="A" 
          stroke={ABC_COLORS.A} 
          fill={ABC_COLORS.A} 
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Radar 
          name="Classe B" 
          dataKey="B" 
          stroke={ABC_COLORS.B} 
          fill={ABC_COLORS.B} 
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Radar 
          name="Classe C" 
          dataKey="C" 
          stroke={ABC_COLORS.C} 
          fill={ABC_COLORS.C} 
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Legend 
          wrapperStyle={{ 
            color: "hsl(var(--foreground))",
            fontSize: "13px",
            paddingTop: "10px"
          }} 
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
};
