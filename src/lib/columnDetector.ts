import { ColumnMapping } from "@/types/abc";

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Básicos
const codeKeywords = ["codigo", "cod", "code", "id", "sku"];
const nameKeywords = ["nome", "medicamento", "material", "descricao", "name", "produto", "item"];
const quantityKeywords = ["quantidade", "qtd", "qty", "quantity", "consumo", "consumida"];
const priceKeywords = ["preco", "valor", "price", "unitario", "unit", "custo"];
const unitKeywords = ["unidade", "un", "unit", "medida", "embalagem"];
const criticalityKeywords = ["criticidade", "critico", "critical", "prioridade", "priority"];

// Logísticos
const categoryKeywords = ["categoria", "category", "grupo", "group", "classe", "family"];
const subcategoryKeywords = ["subcategoria", "subcategory", "subgrupo", "subgroup"];
const supplierKeywords = ["fornecedor", "supplier", "vendor", "fabricante", "manufacturer"];
const leadTimeKeywords = ["leadtime", "lead", "tempo", "prazo", "entrega", "delivery"];
const minStockKeywords = ["minimo", "min", "minimum", "estoque minimo", "stock min"];
const currentStockKeywords = ["estoque", "stock", "saldo", "atual", "current"];
const reorderPointKeywords = ["reposicao", "reorder", "ponto", "point"];
const batchKeywords = ["lote", "batch", "lot"];
const expirationKeywords = ["validade", "expiration", "vencimento", "expire"];

// Financeiros
const totalCostKeywords = ["custo total", "total cost", "custo", "cost"];
const stockValueKeywords = ["valor estoque", "stock value", "inventory value"];
const profitMarginKeywords = ["margem", "margin", "lucro", "profit"];
const discountKeywords = ["desconto", "discount"];
const taxKeywords = ["imposto", "tax", "tributo"];

// Temporais
const movementDateKeywords = ["data movimentacao", "data", "date", "movimento", "movement"];
const monthKeywords = ["mes", "month"];
const yearKeywords = ["ano", "year"];
const lastPurchaseKeywords = ["ultima compra", "last purchase", "data compra"];
const frequencyKeywords = ["frequencia", "frequency", "periodicidade"];

// Clínicos
const therapeuticKeywords = ["indicacao", "indication", "terapeutica", "therapeutic"];
const ingredientKeywords = ["principio ativo", "active ingredient", "ingrediente"];
const routeKeywords = ["via", "route", "administracao", "administration"];
const specialControlKeywords = ["controlado", "control", "especial", "special"];
const temperatureKeywords = ["temperatura", "temperature", "armazenamento", "storage"];

// Analíticos
const seasonalityKeywords = ["sazonalidade", "seasonality", "sazonal"];
const trendKeywords = ["tendencia", "trend"];
const volatilityKeywords = ["volatilidade", "volatility", "variacao"];
const stockoutKeywords = ["ruptura", "stockout", "falta"];

// Operacionais
const sectorKeywords = ["setor", "sector", "department", "departamento"];
const costCenterKeywords = ["centro custo", "cost center", "centro"];
const movementTypeKeywords = ["tipo movimento", "movement type", "tipo"];
const invoiceKeywords = ["nota fiscal", "invoice", "nf"];
const responsibleKeywords = ["responsavel", "responsible", "solicitante"];

export const detectColumns = (headers: string[]): Partial<ColumnMapping> => {
  const mapping: Partial<ColumnMapping> = {};

  headers.forEach((header, index) => {
    const normalized = normalizeText(header);

    // Básicos
    if (!mapping.code && codeKeywords.some(kw => normalized.includes(kw))) {
      mapping.code = index;
    } else if (!mapping.name && nameKeywords.some(kw => normalized.includes(kw))) {
      mapping.name = index;
    } else if (!mapping.quantity && quantityKeywords.some(kw => normalized.includes(kw))) {
      mapping.quantity = index;
    } else if (!mapping.unitPrice && priceKeywords.some(kw => normalized.includes(kw))) {
      mapping.unitPrice = index;
    } else if (!mapping.unit && unitKeywords.some(kw => normalized.includes(kw))) {
      mapping.unit = index;
    } else if (!mapping.clinicalCriticality && criticalityKeywords.some(kw => normalized.includes(kw))) {
      mapping.clinicalCriticality = index;
    }
    
    // Logísticos
    else if (!mapping.category && categoryKeywords.some(kw => normalized.includes(kw))) {
      mapping.category = index;
    } else if (!mapping.subcategory && subcategoryKeywords.some(kw => normalized.includes(kw))) {
      mapping.subcategory = index;
    } else if (!mapping.supplier && supplierKeywords.some(kw => normalized.includes(kw))) {
      mapping.supplier = index;
    } else if (!mapping.leadTime && leadTimeKeywords.some(kw => normalized.includes(kw))) {
      mapping.leadTime = index;
    } else if (!mapping.minStock && minStockKeywords.some(kw => normalized.includes(kw))) {
      mapping.minStock = index;
    } else if (!mapping.currentStock && currentStockKeywords.some(kw => normalized.includes(kw))) {
      mapping.currentStock = index;
    } else if (!mapping.reorderPoint && reorderPointKeywords.some(kw => normalized.includes(kw))) {
      mapping.reorderPoint = index;
    } else if (!mapping.batch && batchKeywords.some(kw => normalized.includes(kw))) {
      mapping.batch = index;
    } else if (!mapping.expirationDate && expirationKeywords.some(kw => normalized.includes(kw))) {
      mapping.expirationDate = index;
    }
    
    // Financeiros
    else if (!mapping.totalCost && totalCostKeywords.some(kw => normalized.includes(kw))) {
      mapping.totalCost = index;
    } else if (!mapping.stockValue && stockValueKeywords.some(kw => normalized.includes(kw))) {
      mapping.stockValue = index;
    } else if (!mapping.profitMargin && profitMarginKeywords.some(kw => normalized.includes(kw))) {
      mapping.profitMargin = index;
    } else if (!mapping.discount && discountKeywords.some(kw => normalized.includes(kw))) {
      mapping.discount = index;
    } else if (!mapping.tax && taxKeywords.some(kw => normalized.includes(kw))) {
      mapping.tax = index;
    }
    
    // Temporais
    else if (!mapping.movementDate && movementDateKeywords.some(kw => normalized.includes(kw))) {
      mapping.movementDate = index;
    } else if (!mapping.month && monthKeywords.some(kw => normalized.includes(kw))) {
      mapping.month = index;
    } else if (!mapping.year && yearKeywords.some(kw => normalized.includes(kw))) {
      mapping.year = index;
    } else if (!mapping.lastPurchaseDate && lastPurchaseKeywords.some(kw => normalized.includes(kw))) {
      mapping.lastPurchaseDate = index;
    } else if (!mapping.consumptionFrequency && frequencyKeywords.some(kw => normalized.includes(kw))) {
      mapping.consumptionFrequency = index;
    }
    
    // Clínicos
    else if (!mapping.therapeuticIndication && therapeuticKeywords.some(kw => normalized.includes(kw))) {
      mapping.therapeuticIndication = index;
    } else if (!mapping.activeIngredient && ingredientKeywords.some(kw => normalized.includes(kw))) {
      mapping.activeIngredient = index;
    } else if (!mapping.administrationRoute && routeKeywords.some(kw => normalized.includes(kw))) {
      mapping.administrationRoute = index;
    } else if (!mapping.specialControl && specialControlKeywords.some(kw => normalized.includes(kw))) {
      mapping.specialControl = index;
    } else if (!mapping.storageTemperature && temperatureKeywords.some(kw => normalized.includes(kw))) {
      mapping.storageTemperature = index;
    }
    
    // Analíticos
    else if (!mapping.seasonality && seasonalityKeywords.some(kw => normalized.includes(kw))) {
      mapping.seasonality = index;
    } else if (!mapping.trend && trendKeywords.some(kw => normalized.includes(kw))) {
      mapping.trend = index;
    } else if (!mapping.volatility && volatilityKeywords.some(kw => normalized.includes(kw))) {
      mapping.volatility = index;
    } else if (!mapping.stockoutRate && stockoutKeywords.some(kw => normalized.includes(kw))) {
      mapping.stockoutRate = index;
    }
    
    // Operacionais
    else if (!mapping.requestingSector && sectorKeywords.some(kw => normalized.includes(kw))) {
      mapping.requestingSector = index;
    } else if (!mapping.costCenter && costCenterKeywords.some(kw => normalized.includes(kw))) {
      mapping.costCenter = index;
    } else if (!mapping.movementType && movementTypeKeywords.some(kw => normalized.includes(kw))) {
      mapping.movementType = index;
    } else if (!mapping.invoiceNumber && invoiceKeywords.some(kw => normalized.includes(kw))) {
      mapping.invoiceNumber = index;
    } else if (!mapping.responsible && responsibleKeywords.some(kw => normalized.includes(kw))) {
      mapping.responsible = index;
    }
  });

  return mapping;
};

export const isValidMapping = (mapping: Partial<ColumnMapping>): mapping is ColumnMapping => {
  return (
    mapping.name !== undefined &&
    mapping.quantity !== undefined &&
    mapping.unitPrice !== undefined
  );
};
