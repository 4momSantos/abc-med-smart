export interface ABCConfiguration {
  classAThreshold: number;
  classBThreshold: number;
}

export interface AnalysisPeriod {
  startDate: Date;
  endDate: Date;
}

export interface ColumnMapping {
  // Campos Básicos
  code?: number;
  name: number;
  quantity: number;
  unitPrice: number;
  unit?: number;
  clinicalCriticality?: number;
  
  // Campos Logísticos
  category?: number;
  subcategory?: number;
  supplier?: number;
  leadTime?: number;
  minStock?: number;
  currentStock?: number;
  reorderPoint?: number;
  batch?: number;
  expirationDate?: number;
  
  // Campos Financeiros
  totalCost?: number;
  stockValue?: number;
  profitMargin?: number;
  discount?: number;
  tax?: number;
  
  // Campos Temporais
  movementDate?: number;
  month?: number;
  year?: number;
  lastPurchaseDate?: number;
  consumptionFrequency?: number;
  
  // Campos Clínicos
  therapeuticIndication?: number;
  activeIngredient?: number;
  administrationRoute?: number;
  specialControl?: number;
  storageTemperature?: number;
  
  // Campos Analíticos
  seasonality?: number;
  trend?: number;
  volatility?: number;
  stockoutRate?: number;
  
  // Campos Operacionais
  requestingSector?: number;
  costCenter?: number;
  movementType?: number;
  invoiceNumber?: number;
  responsible?: number;
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
