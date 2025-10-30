import { MedicineItem } from "./MedicineForm";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Cell } from "recharts";

interface ABCChartProps {
  items: MedicineItem[];
}

// Cores RGB que funcionam em light e dark mode
const ABC_COLORS = {
  A: 'rgb(34, 197, 94)',   // verde
  B: 'rgb(234, 179, 8)',   // amarelo
  C: 'rgb(239, 68, 68)',   // vermelho
};

const ABC_INTERPRETATIONS = {
  A: 'Itens críticos - alta prioridade',
  B: 'Itens importantes - prioridade média',
  C: 'Itens comuns - baixa prioridade'
};

interface AggregatedData {
  classe: string;
  quantidade: number;
  valorTotal: number;
  percentual: number;
  acumulado: number;
}

export const ABCChart = ({ items }: ABCChartProps) => {
  // Agregar dados por classe ABC
  const aggregateByClass = (): AggregatedData[] => {
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    
    const classData = {
      A: { items: items.filter(i => i.classification === 'A'), accumulated: 0 },
      B: { items: items.filter(i => i.classification === 'B'), accumulated: 0 },
      C: { items: items.filter(i => i.classification === 'C'), accumulated: 0 },
    };

    const result: AggregatedData[] = [];
    let accumulated = 0;

    ['A', 'B', 'C'].forEach((classe) => {
      const classItems = classData[classe as 'A' | 'B' | 'C'].items;
      const valorTotal = classItems.reduce((sum, item) => sum + item.totalValue, 0);
      const percentual = totalValue > 0 ? (valorTotal / totalValue) * 100 : 0;
      accumulated += percentual;

      result.push({
        classe: `Classe ${classe}`,
        quantidade: classItems.length,
        valorTotal,
        percentual,
        acumulado: accumulated,
      });
    });

    return result;
  };

  const chartData = aggregateByClass();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const classe = data.classe.replace('Classe ', '') as 'A' | 'B' | 'C';
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-bold text-lg mb-2" style={{ color: ABC_COLORS[classe] }}>
            {data.classe}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold">Quantidade:</span> {data.quantidade} itens
            </p>
            <p className="text-sm">
              <span className="font-semibold">Valor Total:</span> R$ {data.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm">
              <span className="font-semibold">% do Total:</span> {data.percentual.toFixed(1)}%
            </p>
            <p className="text-sm">
              <span className="font-semibold">% Acumulado:</span> {data.acumulado.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {ABC_INTERPRETATIONS[classe]}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Adicione itens para visualizar o Gráfico de Pareto</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart
        data={chartData} 
        margin={{ 
          top: 20, 
          right: 40, 
          left: 20,
          bottom: 60
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="classe" 
          stroke="hsl(var(--foreground))"
          tick={{ fill: 'hsl(var(--foreground))' }}
          fontSize={14}
          fontWeight={600}
        />
        <YAxis 
          yAxisId="left" 
          stroke="hsl(var(--foreground))"
          tick={{ fill: 'hsl(var(--foreground))' }}
          label={{ 
            value: "Valor Total (R$)", 
            angle: -90, 
            position: "insideLeft",
            style: { fill: 'hsl(var(--foreground))' }
          }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="hsl(var(--foreground))"
          tick={{ fill: 'hsl(var(--foreground))' }}
          domain={[0, 100]}
          label={{ 
            value: "% Acumulado", 
            angle: 90, 
            position: "insideRight",
            style: { fill: 'hsl(var(--foreground))' }
          }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="square"
        />
        <Bar 
          yAxisId="left" 
          dataKey="valorTotal" 
          name="Valor Total"
          radius={[8, 8, 0, 0]}
        >
          {chartData.map((entry, index) => {
            const classe = entry.classe.replace('Classe ', '') as 'A' | 'B' | 'C';
            return <Cell key={`cell-${index}`} fill={ABC_COLORS[classe]} />;
          })}
        </Bar>
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="acumulado" 
          stroke="rgb(99, 102, 241)" 
          strokeWidth={3}
          name="% Acumulado"
          dot={{ fill: "rgb(99, 102, 241)", r: 6, strokeWidth: 2, stroke: "#fff" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
