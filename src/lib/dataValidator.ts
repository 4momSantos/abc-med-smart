import { MedicineItem } from "@/components/MedicineForm";
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
    code: mapping.code !== undefined ? sanitizeString(row[mapping.code]) : `AUTO-${rowIndex}`,
    name,
    quantity,
    unitPrice,
    unit: mapping.unit !== undefined ? sanitizeString(row[mapping.unit]) : "un",
    clinicalCriticality: mapping.clinicalCriticality !== undefined 
      ? mapCriticality(sanitizeString(row[mapping.clinicalCriticality]))
      : "média",
  };

  return { isValid: true, errors: [], data };
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
        ...validation.data as Omit<MedicineItem, "id" | "totalValue" | "percentage" | "accumulatedPercentage" | "classification">,
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
