import { ColumnMapping } from "@/types/abc";

export interface ImportTemplate {
  name: string;
  description: string;
  mapping: Partial<ColumnMapping>;
  headers: string[];
  exampleRow: string[];
}

export const IMPORT_TEMPLATES: Record<string, ImportTemplate> = {
  basic: {
    name: "Template Básico",
    description: "Apenas campos obrigatórios para análise ABC",
    mapping: {
      name: 0,
      quantity: 1,
      unitPrice: 2,
    },
    headers: ["Nome", "Quantidade", "Preço Unitário"],
    exampleRow: ["Dipirona 500mg", "100", "2.50"],
  },
  
  standard: {
    name: "Template Padrão",
    description: "Campos básicos + informações logísticas essenciais",
    mapping: {
      code: 0,
      name: 1,
      category: 2,
      quantity: 3,
      unitPrice: 4,
      unit: 5,
      clinicalCriticality: 6,
    },
    headers: ["Código", "Nome", "Categoria", "Quantidade", "Preço Unitário", "Unidade", "Criticidade"],
    exampleRow: ["MED001", "Dipirona 500mg", "Analgésicos", "100", "2.50", "cx", "média"],
  },
  
  logistics: {
    name: "Template Logístico",
    description: "Foco em gestão de estoque e fornecedores",
    mapping: {
      code: 0,
      name: 1,
      category: 2,
      supplier: 3,
      quantity: 4,
      unitPrice: 5,
      currentStock: 6,
      minStock: 7,
      leadTime: 8,
      batch: 9,
      expirationDate: 10,
    },
    headers: [
      "Código", "Nome", "Categoria", "Fornecedor", "Quantidade",
      "Preço Unitário", "Estoque Atual", "Estoque Mínimo", "Lead Time (dias)",
      "Lote", "Validade"
    ],
    exampleRow: [
      "MED001", "Dipirona 500mg", "Analgésicos", "Fornecedor A", "100",
      "2.50", "500", "200", "15", "L2025001", "31/12/2025"
    ],
  },
  
  financial: {
    name: "Template Financeiro",
    description: "Análise detalhada de custos e valores",
    mapping: {
      code: 0,
      name: 1,
      quantity: 2,
      unitPrice: 3,
      discount: 4,
      tax: 5,
      totalCost: 6,
      profitMargin: 7,
      invoiceNumber: 8,
    },
    headers: [
      "Código", "Nome", "Quantidade", "Preço Unitário", "Desconto (%)",
      "Imposto (%)", "Custo Total", "Margem (%)", "Nota Fiscal"
    ],
    exampleRow: [
      "MED001", "Dipirona 500mg", "100", "2.50", "5", "18",
      "250.00", "35", "NF-2025-001"
    ],
  },
  
  temporal: {
    name: "Template Temporal",
    description: "Para análises de séries temporais e previsões",
    mapping: {
      code: 0,
      name: 1,
      movementDate: 2,
      month: 3,
      year: 4,
      quantity: 5,
      unitPrice: 6,
      movementType: 7,
    },
    headers: [
      "Código", "Nome", "Data Movimentação", "Mês", "Ano",
      "Quantidade", "Preço Unitário", "Tipo Movimento"
    ],
    exampleRow: [
      "MED001", "Dipirona 500mg", "15/01/2025", "1", "2025",
      "100", "2.50", "Saída"
    ],
  },
  
  clinical: {
    name: "Template Clínico",
    description: "Informações clínicas e farmacológicas detalhadas",
    mapping: {
      code: 0,
      name: 1,
      activeIngredient: 2,
      therapeuticIndication: 3,
      administrationRoute: 4,
      specialControl: 5,
      storageTemperature: 6,
      clinicalCriticality: 7,
      quantity: 8,
      unitPrice: 9,
    },
    headers: [
      "Código", "Nome", "Princípio Ativo", "Indicação Terapêutica",
      "Via Administração", "Controle Especial", "Temperatura Armazenamento",
      "Criticidade", "Quantidade", "Preço Unitário"
    ],
    exampleRow: [
      "MED001", "Dipirona 500mg", "Dipirona Sódica", "Analgésico/Antipirético",
      "Oral", "Não", "15-25°C", "média", "100", "2.50"
    ],
  },
  
  complete: {
    name: "Template Completo",
    description: "Todos os campos disponíveis no sistema",
    mapping: {
      code: 0,
      name: 1,
      category: 2,
      subcategory: 3,
      supplier: 4,
      quantity: 5,
      unitPrice: 6,
      unit: 7,
      currentStock: 8,
      minStock: 9,
      leadTime: 10,
      batch: 11,
      expirationDate: 12,
      clinicalCriticality: 13,
      therapeuticIndication: 14,
      activeIngredient: 15,
      movementDate: 16,
      requestingSector: 17,
      costCenter: 18,
    },
    headers: [
      "Código", "Nome", "Categoria", "Subcategoria", "Fornecedor",
      "Quantidade", "Preço Unitário", "Unidade", "Estoque Atual", "Estoque Mínimo",
      "Lead Time", "Lote", "Validade", "Criticidade", "Indicação Terapêutica",
      "Princípio Ativo", "Data Movimentação", "Setor Solicitante", "Centro de Custo"
    ],
    exampleRow: [
      "MED001", "Dipirona 500mg", "Medicamentos", "Analgésicos", "Fornecedor A",
      "100", "2.50", "cx", "500", "200", "15", "L2025001", "31/12/2025",
      "média", "Dor/Febre", "Dipirona Sódica", "15/01/2025", "Emergência", "CC-001"
    ],
  },
};
