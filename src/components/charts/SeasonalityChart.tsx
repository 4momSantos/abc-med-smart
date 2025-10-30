import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MedicineItem } from '@/types/medicine';

interface SeasonalityChartProps {
  items: MedicineItem[];
}

export const SeasonalityChart = ({ items }: SeasonalityChartProps) => {
  const chartData = useMemo(() => {
    // Calcular base de consumo
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const baseValue = totalQuantity / items.length || 4500;
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return months.map((mes, index) => {
      // Simular padrão sazonal com variação
      const seasonalFactor = 1 + Math.sin((index / 12) * Math.PI * 2) * 0.2;
      
      return {
        mes,
        '2023': Math.round(baseValue * seasonalFactor * (0.9 + Math.random() * 0.1)),
        '2024': Math.round(baseValue * seasonalFactor * (0.95 + Math.random() * 0.1)),
      };
    });
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
        <YAxis stroke="hsl(var(--foreground))" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`${value} unidades`, '']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="2023" 
          stroke="#94a3b8" 
          strokeWidth={2} 
          name="2023"
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="2024" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          name="2024"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
