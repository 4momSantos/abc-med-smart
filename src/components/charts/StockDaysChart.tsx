import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MedicineItem } from '@/types/medicine';

interface StockDaysChartProps {
  items: MedicineItem[];
}

const ABC_COLORS = {
  A: '#ef4444',
  B: '#f59e0b',
  C: '#10b981',
};

export const StockDaysChart = ({ items }: StockDaysChartProps) => {
  const chartData = useMemo(() => {
    // Calcular dias de estoque baseado em leadTime ou valor padrão
    const itemsWithDays = items.map(item => ({
      ...item,
      estoqueDias: item.leadTime || Math.floor((item.quantity / (item.unitPrice || 1)) * 30) || 30,
    }));

    // Ordenar por dias de estoque e pegar top 20
    return itemsWithDays
      .sort((a, b) => b.estoqueDias - a.estoqueDias)
      .slice(0, 20);
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart 
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          type="number" 
          stroke="hsl(var(--foreground))"
          label={{ value: 'Dias de Estoque', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--foreground))' } }}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={140}
          stroke="hsl(var(--foreground))"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`${value} dias`, 'Dias de Estoque']}
          labelFormatter={(label) => `Item: ${label}`}
        />
        <Bar dataKey="estoqueDias" name="Dias de Estoque">
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={ABC_COLORS[entry.classification || 'C']} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
