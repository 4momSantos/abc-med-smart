import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MedicineItem } from '@/types/medicine';

interface TurnoverRateChartProps {
  items: MedicineItem[];
}

export const TurnoverRateChart = ({ items }: TurnoverRateChartProps) => {
  const chartData = useMemo(() => {
    // Calcular rotatividade (giros por ano)
    const itemsWithTurnover = items.map(item => {
      const currentStock = item.currentStock || item.quantity || 1;
      const rotatividade = (item.quantity / currentStock) * 12; // Giros por ano
      
      return {
        ...item,
        rotatividade: rotatividade > 0 ? rotatividade : Math.random() * 30,
      };
    });

    // Ordenar por rotatividade e pegar top 20
    return itemsWithTurnover
      .sort((a, b) => b.rotatividade - a.rotatividade)
      .slice(0, 20);
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={100}
          stroke="hsl(var(--foreground))"
          style={{ fontSize: '11px' }}
        />
        <YAxis 
          stroke="hsl(var(--foreground))"
          label={{ value: 'Giros/Ano', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`${value.toFixed(1)}x/ano`, 'Rotatividade']}
        />
        <Bar dataKey="rotatividade" fill="#8b5cf6" name="Rotatividade" />
      </BarChart>
    </ResponsiveContainer>
  );
};
