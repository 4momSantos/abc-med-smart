import { ColumnMapping } from "@/types/abc";

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const codeKeywords = ["codigo", "cod", "code", "id", "sku"];
const nameKeywords = ["nome", "medicamento", "material", "descricao", "name", "produto", "item"];
const quantityKeywords = ["quantidade", "qtd", "qty", "quantity", "consumo", "consumida"];
const priceKeywords = ["preco", "valor", "price", "unitario", "unit", "custo"];
const unitKeywords = ["unidade", "un", "unit", "medida", "embalagem"];
const criticalityKeywords = ["criticidade", "critico", "critical", "prioridade", "priority"];

export const detectColumns = (headers: string[]): Partial<ColumnMapping> => {
  const mapping: Partial<ColumnMapping> = {};

  headers.forEach((header, index) => {
    const normalized = normalizeText(header);

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
