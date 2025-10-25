import { ReportTemplate } from '@/types/reports';

export const EXECUTIVE_TEMPLATE: ReportTemplate = {
  id: 'executive',
  name: 'Relatório Executivo',
  description: 'Visão geral com KPIs principais e gráficos resumidos',
  layout: {
    orientation: 'portrait',
    pageSize: 'A4',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  },
  branding: {
    title: 'Relatório Executivo - Análise ABC',
    subtitle: 'Gestão de Medicamentos e Materiais Hospitalares',
    headerColor: '#2563eb',
    accentColor: '#3b82f6'
  },
  sections: [
    { type: 'header', title: 'Resumo Executivo' },
    { type: 'kpis', columns: 4, selectedKpis: ['totalItems', 'totalValue', 'classA', 'classB'] },
    { type: 'abc_chart', height: 200, showLegend: true },
    { type: 'abc_table', maxRows: 10, columns: ['name', 'classification', 'totalValue', 'percentage'] },
    { type: 'insights', maxItems: 5 }
  ],
  filters: {
    abcClasses: ['A', 'B', 'C']
  },
  options: {
    includePageNumbers: true,
    includeTimestamp: true,
    includeFooter: true,
    footerText: 'Relatório gerado automaticamente pelo Sistema de Análise ABC'
  }
};

export const TECHNICAL_TEMPLATE: ReportTemplate = {
  id: 'technical',
  name: 'Relatório Técnico Completo',
  description: 'Análise detalhada com todas as métricas e estatísticas',
  layout: {
    orientation: 'landscape',
    pageSize: 'A4',
    margins: { top: 15, bottom: 15, left: 15, right: 15 }
  },
  branding: {
    title: 'Relatório Técnico - Análise Completa',
    subtitle: 'Análise Detalhada de Medicamentos e Materiais',
    headerColor: '#0ea5e9',
    accentColor: '#06b6d4'
  },
  sections: [
    { type: 'header', title: 'Análise Técnica Detalhada' },
    { type: 'kpis', columns: 6, selectedKpis: ['totalItems', 'totalValue', 'classA', 'classB', 'classC', 'avgValue'] },
    { type: 'abc_chart', height: 250, showLegend: true },
    { type: 'abc_table', columns: ['code', 'name', 'classification', 'quantity', 'unitPrice', 'totalValue', 'percentage', 'cumulativePercentage'] },
    { type: 'statistics', includeGraphs: true },
    { type: 'insights', maxItems: 10 }
  ],
  filters: {
    abcClasses: ['A', 'B', 'C']
  },
  options: {
    includePageNumbers: true,
    includeTimestamp: true,
    includeFooter: true,
    footerText: 'Relatório Técnico Completo - Sistema ABC'
  }
};

export const ANOMALIES_TEMPLATE: ReportTemplate = {
  id: 'anomalies',
  name: 'Relatório de Anomalias',
  description: 'Lista de itens com comportamento atípico detectado',
  layout: {
    orientation: 'portrait',
    pageSize: 'A4',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  },
  branding: {
    title: 'Relatório de Anomalias',
    subtitle: 'Itens com Comportamento Atípico',
    headerColor: '#ef4444',
    accentColor: '#f87171'
  },
  sections: [
    { type: 'header', title: 'Análise de Anomalias' },
    { type: 'text', content: 'Este relatório identifica itens com comportamento atípico baseado em análise estatística e machine learning.' },
    { type: 'anomalies', threshold: 0.8 },
    { type: 'insights', maxItems: 8 }
  ],
  filters: {
    abcClasses: ['A', 'B', 'C']
  },
  options: {
    includePageNumbers: true,
    includeTimestamp: true,
    includeFooter: true,
    footerText: 'Relatório de Anomalias - Requer Atenção Imediata'
  }
};

export const DEFAULT_TEMPLATES: ReportTemplate[] = [
  EXECUTIVE_TEMPLATE,
  TECHNICAL_TEMPLATE,
  ANOMALIES_TEMPLATE
];
