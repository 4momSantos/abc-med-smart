import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStore } from '@/store/dataStore';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { calculateDescriptiveStats } from '@/lib/statistics/descriptiveStats';

export default function StatisticsPage() {
  const { filteredItems } = useDataStore();
  
  const stats = useMemo(() => {
    if (filteredItems.length === 0) {
      return {
        count: 0,
        sum: 0,
        mean: 0,
        median: 0,
        mode: null,
        stdDev: 0,
        variance: 0,
        min: 0,
        max: 0,
        range: 0,
        quartiles: { q1: 0, q2: 0, q3: 0, iqr: 0 },
        percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
        skewness: 0,
        kurtosis: 0,
        coefficientOfVariation: 0,
        outliers: { lower: [], upper: [], count: 0 },
      };
    }
    return calculateDescriptiveStats(filteredItems);
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Análises Estatísticas</h1>
        <p className="text-muted-foreground mt-2">
          Estatísticas descritivas detalhadas dos seus dados
        </p>
      </div>

      <FilterBar />

      <StatisticsPanel stats={stats} />
    </div>
  );
}
