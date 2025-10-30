import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MedicineItem } from '@/types/medicine';

interface QuantityValueChartProps {
  items: MedicineItem[];
}

export const QuantityValueChart = ({ items }: QuantityValueChartProps) => {
  const chartData = useMemo(() => {
    const classA = items.filter(d => d.classification === 'A');
    const classB = items.filter(d => d.classification === 'B');
    const classC = items.filter(d => d.classification === 'C');

    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

    return [
      {
        class: 'A',
        items: classA.length,
        percentage: totalValue > 0 ? (classA.reduce((sum, d) => sum + d.totalValue, 0) / totalValue) * 100 : 0,
      },
      {
        class: 'B',
        items: classB.length,
        percentage: totalValue > 0 ? (classB.reduce((sum, d) => sum + d.totalValue, 0) / totalValue) * 100 : 0,
      },
      {
        class: 'C',
        items: classC.length,
        percentage: totalValue > 0 ? (classC.reduce((sum, d) => sum + d.totalValue, 0) / totalValue) * 100 : 0,
      },
    ];
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="class" stroke="hsl(var(--foreground))" />
        <YAxis 
          yAxisId="left" 
          stroke="hsl(var(--foreground))"
          label={{ value: 'Quantidade de Itens', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="hsl(var(--foreground))"
          label={{ value: '% do Valor Total', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--foreground))' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'Quantidade de Itens') return value.toFixed(0);
            return `${value.toFixed(1)}%`;
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="items" fill="#3b82f6" name="Quantidade de Itens" />
        <Bar yAxisId="right" dataKey="percentage" fill="#10b981" name="% do Valor Total" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
