import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer } from "recharts";

interface RadarChartProps {
  items: MedicineItem[];
  title?: string;
}

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
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadar data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <Radar name="Classe A" dataKey="A" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
          <Radar name="Classe B" dataKey="B" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
          <Radar name="Classe C" dataKey="C" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} />
          <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
        </RechartsRadar>
      </ResponsiveContainer>
    </Card>
  );
};
