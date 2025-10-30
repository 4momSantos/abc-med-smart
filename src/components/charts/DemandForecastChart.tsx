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
    // Gerar dados históricos e previsão baseados nos itens
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const baseValue = totalQuantity / items.length || 4500;
    
    // Últimos 3 meses (real)
    const historicalData = [
      { month: 'Nov', real: baseValue * 0.9, previsto: baseValue * 0.88, min: baseValue * 0.84, max: baseValue * 0.92 },
      { month: 'Dez', real: baseValue * 1.04, previsto: baseValue * 1.02, min: baseValue * 0.98, max: baseValue * 1.06 },
      { month: 'Jan', real: baseValue * 0.96, previsto: baseValue * 0.98, min: baseValue * 0.94, max: baseValue * 1.02 },
    ];
    
    // Próximos 3 meses (previsão)
    const forecastData = [
      { month: 'Fev', previsto: baseValue * 1.06, min: baseValue * 1.00, max: baseValue * 1.12 },
      { month: 'Mar', previsto: baseValue * 1.10, min: baseValue * 1.04, max: baseValue * 1.16 },
      { month: 'Abr', previsto: baseValue * 1.02, min: baseValue * 0.96, max: baseValue * 1.08 },
    ];
    
    return [...historicalData, ...forecastData];
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
          fillOpacity={0.2}
          stroke="none"
          name="Intervalo de Confiança"
        />
        <Area 
          type="monotone" 
          dataKey="min" 
          fill="hsl(var(--background))" 
          fillOpacity={1}
          stroke="none"
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
