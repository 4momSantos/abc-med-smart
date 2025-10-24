export interface ABCConfiguration {
  classAThreshold: number;
  classBThreshold: number;
}

export interface AnalysisPeriod {
  startDate: Date;
  endDate: Date;
}

export interface ColumnMapping {
  code?: number;
  name: number;
  quantity: number;
  unitPrice: number;
  unit?: number;
  clinicalCriticality?: number;
}

export interface ImportedData {
  headers: string[];
  rows: any[][];
}

export interface ValidationError {
  row: number;
  errors: string[];
}

export interface ProcessedData {
  validItems: any[];
  errors: ValidationError[];
}
