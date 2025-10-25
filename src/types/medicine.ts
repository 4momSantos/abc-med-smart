export interface MedicineItem {
  id: string;
  
  // Campos Básicos
  code?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  unit?: string;
  clinicalCriticality?: "alta" | "média" | "baixa";
  
  // Classificação ABC
  classification?: 'A' | 'B' | 'C';
  percentage?: number;
  accumulatedPercentage?: number;
  cumulativePercentage?: number;
  valuePercentage?: number;
  
  // Campos Logísticos
  category?: string;
  subcategory?: string;
  supplier?: string;
  leadTime?: number;
  minStock?: number;
  currentStock?: number;
  reorderPoint?: number;
  batch?: string;
  expirationDate?: Date;
  
  // Campos Financeiros
  totalCost?: number;
  stockValue?: number;
  profitMargin?: number;
  discount?: number;
  tax?: number;
  
  // Campos Temporais
  movementDate?: Date;
  month?: number;
  year?: number;
  lastPurchaseDate?: Date;
  consumptionFrequency?: string;
  
  // Campos Clínicos
  therapeuticIndication?: string;
  activeIngredient?: string;
  administrationRoute?: string;
  specialControl?: boolean;
  storageTemperature?: string;
  
  // Campos Analíticos
  seasonality?: string;
  trend?: string;
  volatility?: number;
  stockoutRate?: number;
  
  // Campos Operacionais
  requestingSector?: string;
  costCenter?: string;
  movementType?: string;
  invoiceNumber?: string;
  responsible?: string;
  
  // Campos Calculados
  needsReorder?: boolean;
}
