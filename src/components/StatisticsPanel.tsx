import { Card } from "@/components/ui/card";
import { DescriptiveStats } from "@/lib/statistics/descriptiveStats";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";

interface StatisticsPanelProps {
  stats: DescriptiveStats;
}

export const StatisticsPanel = ({ stats }: StatisticsPanelProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Estatísticas Descritivas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Medidas de Tendência Central */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
            <p className="text-2xl font-bold text-foreground">{stats.count}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Média</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.mean)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Mediana</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.median)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Moda</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.mode !== null ? formatCurrency(stats.mode) : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dispersão */}
        <Card className="p-6 shadow-[var(--shadow-medium)]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Medidas de Dispersão</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Desvio Padrão</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.stdDev)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Variância</span>
              <span className="font-semibold text-foreground">{formatNumber(stats.variance, 0)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Coef. Variação</span>
              <span className="font-semibold text-foreground">{formatNumber(stats.coefficientOfVariation)}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amplitude</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.range)}</span>
            </div>

            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-muted-foreground">Mínimo</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.min)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Máximo</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.max)}</span>
            </div>
          </div>
        </Card>

        {/* Quartis e Percentis */}
        <Card className="p-6 shadow-[var(--shadow-medium)]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Quartis e Percentis</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Q1 (25%)</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.quartiles.q1)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Q2 (50%)</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.quartiles.q2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Q3 (75%)</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.quartiles.q3)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">IQR (Intervalo Interquartil)</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.quartiles.iqr)}</span>
            </div>

            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-muted-foreground">P10</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.percentiles.p10)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">P90</span>
              <span className="font-semibold text-foreground">{formatCurrency(stats.percentiles.p90)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Forma da Distribuição */}
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Forma da Distribuição</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Assimetria (Skewness)</p>
            <p className="text-2xl font-bold text-foreground">{formatNumber(stats.skewness)}</p>
            <p className="text-xs text-muted-foreground">
              {stats.skewness > 0.5 ? "Assimétrica à direita" : 
               stats.skewness < -0.5 ? "Assimétrica à esquerda" : "Aproximadamente simétrica"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Curtose (Kurtosis)</p>
            <p className="text-2xl font-bold text-foreground">{formatNumber(stats.kurtosis)}</p>
            <p className="text-xs text-muted-foreground">
              {stats.kurtosis > 0 ? "Leptocúrtica (pico alto)" : 
               stats.kurtosis < 0 ? "Platicúrtica (pico baixo)" : "Mesocúrtica (normal)"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Outliers Detectados</p>
            <p className="text-2xl font-bold text-foreground">{stats.outliers.count}</p>
            <p className="text-xs text-muted-foreground">
              {stats.outliers.lower.length} inferiores, {stats.outliers.upper.length} superiores
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
