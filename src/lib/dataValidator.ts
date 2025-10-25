import { MedicineItem } from "@/types/medicine";
import { ColumnMapping, ValidationError, ProcessedData } from "@/types/abc";

export const cleanNumericValue = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    let cleaned = value.replace(/[R$\s]/g, "");
    cleaned = cleaned.replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const sanitizeString = (value: any): string => {
  if (typeof value === "string") {
    return value.trim().substring(0, 200);
  }
  return String(value || "").trim().substring(0, 200);
};

export const parseDate = (value: any): Date | null => {
  if (!value) return null;
  
  if (value instanceof Date) return value;
  
  const str = String(value).trim();
  
  // Formato DD/MM/YYYY
  const brFormat = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brFormat) {
    const [, day, month, year] = brFormat;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Formato YYYY-MM-DD
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) return isoDate;
  
  // Formato Excel (número serial)
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
};

export const parseBooleanValue = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  const str = String(value).toLowerCase().trim();
  return ["sim", "yes", "true", "1", "s", "y"].includes(str);
};

const mapCriticality = (value: string): "alta" | "média" | "baixa" => {
  const normalized = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (normalized.includes("alta") || normalized.includes("high") || normalized.includes("critica")) {
    return "alta";
  } else if (normalized.includes("baixa") || normalized.includes("low")) {
    return "baixa";
  }
  return "média";
};

export const validateRow = (
  row: any[],
  mapping: ColumnMapping,
  rowIndex: number
): { isValid: boolean; errors: string[]; data?: Partial<MedicineItem> } => {
  const errors: string[] = [];

  // Validar campos obrigatórios
  const name = sanitizeString(row[mapping.name]);
  if (!name) {
    errors.push("Nome não pode estar vazio");
  }

  const quantity = cleanNumericValue(row[mapping.quantity]);
  if (quantity <= 0) {
    errors.push("Quantidade deve ser maior que zero");
  }

  const unitPrice = cleanNumericValue(row[mapping.unitPrice]);
  if (unitPrice <= 0) {
    errors.push("Preço unitário deve ser maior que zero");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const data: Partial<MedicineItem> = {
    // Básicos
    code: mapping.code !== undefined ? sanitizeString(row[mapping.code]) : `AUTO-${rowIndex}`,
    name,
    quantity,
    unitPrice,
    unit: mapping.unit !== undefined ? sanitizeString(row[mapping.unit]) : "un",
    clinicalCriticality: mapping.clinicalCriticality !== undefined 
      ? mapCriticality(sanitizeString(row[mapping.clinicalCriticality]))
      : "média",
  };

  // Logísticos
  if (mapping.category !== undefined) {
    data.category = sanitizeString(row[mapping.category]);
  }
  if (mapping.subcategory !== undefined) {
    data.subcategory = sanitizeString(row[mapping.subcategory]);
  }
  if (mapping.supplier !== undefined) {
    data.supplier = sanitizeString(row[mapping.supplier]);
  }
  if (mapping.leadTime !== undefined) {
    const leadTime = cleanNumericValue(row[mapping.leadTime]);
    if (leadTime < 0) {
      errors.push(`Lead time não pode ser negativo: ${leadTime}`);
    } else {
      data.leadTime = leadTime;
    }
  }
  if (mapping.minStock !== undefined) {
    data.minStock = cleanNumericValue(row[mapping.minStock]);
  }
  if (mapping.currentStock !== undefined) {
    data.currentStock = cleanNumericValue(row[mapping.currentStock]);
  }
  if (mapping.reorderPoint !== undefined) {
    data.reorderPoint = cleanNumericValue(row[mapping.reorderPoint]);
  }
  if (mapping.batch !== undefined) {
    data.batch = sanitizeString(row[mapping.batch]);
  }
  if (mapping.expirationDate !== undefined) {
    const expirationDate = parseDate(row[mapping.expirationDate]);
    if (expirationDate) {
      data.expirationDate = expirationDate;
    }
  }

  // Financeiros
  if (mapping.totalCost !== undefined) {
    data.totalCost = cleanNumericValue(row[mapping.totalCost]);
  }
  if (mapping.stockValue !== undefined) {
    data.stockValue = cleanNumericValue(row[mapping.stockValue]);
  }
  if (mapping.profitMargin !== undefined) {
    data.profitMargin = cleanNumericValue(row[mapping.profitMargin]);
  }
  if (mapping.discount !== undefined) {
    data.discount = cleanNumericValue(row[mapping.discount]);
  }
  if (mapping.tax !== undefined) {
    data.tax = cleanNumericValue(row[mapping.tax]);
  }

  // Temporais
  if (mapping.movementDate !== undefined) {
    const movementDate = parseDate(row[mapping.movementDate]);
    if (movementDate) {
      data.movementDate = movementDate;
      data.month = movementDate.getMonth() + 1;
      data.year = movementDate.getFullYear();
    }
  }
  if (mapping.month !== undefined && !data.month) {
    data.month = cleanNumericValue(row[mapping.month]);
  }
  if (mapping.year !== undefined && !data.year) {
    data.year = cleanNumericValue(row[mapping.year]);
  }
  if (mapping.lastPurchaseDate !== undefined) {
    const lastPurchaseDate = parseDate(row[mapping.lastPurchaseDate]);
    if (lastPurchaseDate) {
      data.lastPurchaseDate = lastPurchaseDate;
    }
  }
  if (mapping.consumptionFrequency !== undefined) {
    data.consumptionFrequency = sanitizeString(row[mapping.consumptionFrequency]);
  }

  // Clínicos
  if (mapping.therapeuticIndication !== undefined) {
    data.therapeuticIndication = sanitizeString(row[mapping.therapeuticIndication]);
  }
  if (mapping.activeIngredient !== undefined) {
    data.activeIngredient = sanitizeString(row[mapping.activeIngredient]);
  }
  if (mapping.administrationRoute !== undefined) {
    data.administrationRoute = sanitizeString(row[mapping.administrationRoute]);
  }
  if (mapping.specialControl !== undefined) {
    data.specialControl = parseBooleanValue(row[mapping.specialControl]);
  }
  if (mapping.storageTemperature !== undefined) {
    data.storageTemperature = sanitizeString(row[mapping.storageTemperature]);
  }

  // Analíticos
  if (mapping.seasonality !== undefined) {
    data.seasonality = sanitizeString(row[mapping.seasonality]);
  }
  if (mapping.trend !== undefined) {
    data.trend = sanitizeString(row[mapping.trend]);
  }
  if (mapping.volatility !== undefined) {
    data.volatility = cleanNumericValue(row[mapping.volatility]);
  }
  if (mapping.stockoutRate !== undefined) {
    data.stockoutRate = cleanNumericValue(row[mapping.stockoutRate]);
  }

  // Operacionais
  if (mapping.requestingSector !== undefined) {
    data.requestingSector = sanitizeString(row[mapping.requestingSector]);
  }
  if (mapping.costCenter !== undefined) {
    data.costCenter = sanitizeString(row[mapping.costCenter]);
  }
  if (mapping.movementType !== undefined) {
    data.movementType = sanitizeString(row[mapping.movementType]);
  }
  if (mapping.invoiceNumber !== undefined) {
    data.invoiceNumber = sanitizeString(row[mapping.invoiceNumber]);
  }
  if (mapping.responsible !== undefined) {
    data.responsible = sanitizeString(row[mapping.responsible]);
  }

  // Validações de negócio
  if (data.currentStock !== undefined && data.minStock !== undefined) {
    data.needsReorder = data.currentStock < data.minStock;
  }

  return { isValid: errors.length === 0, errors, data };
};

export const processImportedData = (
  rows: any[][],
  mapping: ColumnMapping
): ProcessedData => {
  const validItems: MedicineItem[] = [];
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const validation = validateRow(row, mapping, index + 2);
    
    if (validation.isValid && validation.data) {
      validItems.push({
        ...validation.data as MedicineItem,
        id: `imported-${Date.now()}-${index}`,
        totalValue: (validation.data.quantity || 0) * (validation.data.unitPrice || 0),
        percentage: 0,
        accumulatedPercentage: 0,
        classification: "C",
      });
    } else {
      errors.push({
        row: index + 2,
        errors: validation.errors,
      });
    }
  });

  return { validItems, errors };
};
