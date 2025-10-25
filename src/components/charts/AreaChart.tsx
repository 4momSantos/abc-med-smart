import { MedicineItem } from "@/components/MedicineForm";
import { Card } from "@/components/ui/card";
import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AreaChartProps {
  items: MedicineItem[];
  title?: string;
}

export const AreaChart = ({ items, title = "Curva de Valor Acumulado por Classe" }: AreaChartProps) => {
  const sortedItems = [...items].sort((a, b) => b.totalValue - a.totalValue);

  let cumulativeA = 0;
  let cumulativeB = 0;
  let cumulativeC = 0;

  const data = sortedItems.map((item, index) => {
    if (item.classification === "A") {
      cumulativeA += item.totalValue;
    } else if (item.classification === "B") {
      cumulativeB += item.totalValue;
    } else {
      cumulativeC += item.totalValue;
    }

    return {
      index: index + 1,
      name: item.code,
      "Classe A": cumulativeA,
      "Classe B": cumulativeB,
      "Classe C": cumulativeC,
    };
  });

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsArea data={data}>
          <defs>
            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="index" 
            label={{ value: "Sequência de Itens", position: "insideBottom", offset: -5, fill: "hsl(var(--foreground))" }}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis 
            label={{ value: "Valor Acumulado (R$)", angle: -90, position: "insideLeft", fill: "hsl(var(--foreground))" }}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--background))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
          <Area 
            type="monotone" 
            dataKey="Classe A" 
            stackId="1"
            stroke="hsl(var(--chart-1))" 
            fillOpacity={1} 
            fill="url(#colorA)" 
          />
          <Area 
            type="monotone" 
            dataKey="Classe B" 
            stackId="1"
            stroke="hsl(var(--chart-2))" 
            fillOpacity={1} 
            fill="url(#colorB)" 
          />
          <Area 
            type="monotone" 
            dataKey="Classe C" 
            stackId="1"
            stroke="hsl(var(--chart-3))" 
            fillOpacity={1} 
            fill="url(#colorC)" 
          />
        </RechartsArea>
      </ResponsiveContainer>
    </Card>
  );
};
