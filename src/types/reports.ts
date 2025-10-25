import { MedicineItem } from './medicine';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  author?: string;
  created_at?: string;
  
  layout: {
    orientation: 'portrait' | 'landscape';
    pageSize: 'A4' | 'Letter';
    margins: { top: number; bottom: number; left: number; right: number };
  };
  
  branding: {
    logo?: string;
    title: string;
    subtitle?: string;
    headerColor: string;
    accentColor: string;
  };
  
  sections: ReportSection[];
  
  filters: {
    dateRange?: { start: Date; end: Date };
    abcClasses?: ('A' | 'B' | 'C')[];
    categories?: string[];
    suppliers?: string[];
    minValue?: number;
  };
  
  options: {
    includePageNumbers: boolean;
    includeTimestamp: boolean;
    includeFooter: boolean;
    footerText?: string;
  };
}

export type ReportSection = 
  | { type: 'header'; title: string; subtitle?: string }
  | { type: 'kpis'; columns: number; selectedKpis: string[] }
  | { type: 'abc_chart'; height: number; showLegend: boolean }
  | { type: 'abc_table'; maxRows?: number; columns: string[] }
  | { type: 'chart'; chartType: 'bar' | 'line' | 'pie'; dataSource: string }
  | { type: 'table'; dataSource: string; columns: string[]; maxRows?: number }
  | { type: 'statistics'; includeGraphs: boolean }
  | { type: 'insights'; maxItems: number }
  | { type: 'anomalies'; threshold: number }
  | { type: 'text'; content: string }
  | { type: 'page_break' };

export interface ReportData {
  items: MedicineItem[];
  kpis: {
    totalItems: number;
    totalValue: number;
    classA: { count: number; percentage: number };
    classB: { count: number; percentage: number };
    classC: { count: number; percentage: number };
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface ReportCustomization {
  template: ReportTemplate;
  data: ReportData;
}
