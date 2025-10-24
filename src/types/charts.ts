export type ChartType = 
  | 'pareto' 
  | 'bar' 
  | 'pie' 
  | 'line' 
  | 'scatter'
  | 'heatmap';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  subtitle?: string;
}
