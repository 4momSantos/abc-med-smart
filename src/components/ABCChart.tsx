import { MedicineItem } from "./MedicineForm";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";

interface ABCChartProps {
  items: MedicineItem[];
}

export const ABCChart = ({ items }: ABCChartProps) => {
  const chartData = items.map((item) => ({
    name: item.code,
    valor: item.totalValue,
    acumulado: item.accumulatedPercentage,
    classe: item.classification,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-[var(--shadow-medium)]">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Valor: R$ {payload[0].value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">
            Acumulado: {payload[1]?.value.toFixed(2)}%
          </p>
          <p className="text-sm font-semibold">Classe {payload[0].payload.classe}</p>
        </div>
      );
    }
    return null;
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 shadow-[var(--shadow-medium)]">
        <div className="text-center text-muted-foreground">
          <p>Adicione itens para visualizar o Gráfico de Pareto</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Gráfico de Pareto - Curva ABC</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            stroke="hsl(var(--foreground))"
          />
          <YAxis 
            yAxisId="left" 
            stroke="hsl(var(--foreground))"
            label={{ value: "Valor (R$)", angle: -90, position: "insideLeft" }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="hsl(var(--foreground))"
            label={{ value: "% Acumulado", angle: 90, position: "insideRight" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="valor" 
            fill="hsl(var(--primary))" 
            name="Valor Total"
            radius={[8, 8, 0, 0]}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="acumulado" 
            stroke="hsl(var(--destructive))" 
            strokeWidth={3}
            name="% Acumulado"
            dot={{ fill: "hsl(var(--destructive))", r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};
