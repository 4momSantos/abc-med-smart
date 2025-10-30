import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MedicineItem } from '@/types/medicine';

interface DemandForecastChartProps {
  items: MedicineItem[];
}

export const DemandForecastChart = ({ items }: DemandForecastChartProps) => {
  const chartData = useMemo(() => {
    // Agrupar itens por mês usando movementDate
    const itemsByMonth = new Map<string, number>();
    
    items.forEach(item => {
      if (item.movementDate) {
        const date = new Date(item.movementDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        itemsByMonth.set(monthKey, (itemsByMonth.get(monthKey) || 0) + item.quantity);
      }
    });

    // Se não houver dados históricos, usar quantidade média
    if (itemsByMonth.size === 0) {
      const avgQuantity = items.reduce((sum, item) => sum + item.quantity, 0) / items.length || 0;
      const months = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'];
      return months.map((month, i) => ({
        month,
        real: i < 3 ? avgQuantity : undefined,
        previsto: avgQuantity,
        min: avgQuantity * 0.85,
        max: avgQuantity * 1.15,
      }));
    }

    // Usar dados reais quando disponíveis
    const sortedMonths = Array.from(itemsByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return sortedMonths.map(([monthKey, quantity], i) => {
      const [year, month] = monthKey.split('-');
      const monthName = monthNames[parseInt(month) - 1];
      const isHistorical = i < 3;
      
      return {
        month: monthName,
        real: isHistorical ? quantity : undefined,
        previsto: quantity,
        min: quantity * 0.9,
        max: quantity * 1.1,
      };
    });
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
        <YAxis 
          stroke="hsl(var(--foreground))"
          label={{ value: 'Consumo (unidades)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => value.toFixed(0)}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="max" 
          fill="#3b82f6" 
          fillOpacity={0.15}
          stroke="none"
          name="Intervalo de Confiança"
        />
        <Line
          type="monotone" 
          dataKey="real" 
          stroke="#10b981" 
          strokeWidth={3}
          name="Real"
          dot={{ r: 5, fill: '#10b981' }}
        />
        <Line 
          type="monotone" 
          dataKey="previsto" 
          stroke="#ef4444" 
          strokeWidth={3}
          strokeDasharray="5 5"
          name="Previsto"
          dot={{ r: 5, fill: '#ef4444' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
