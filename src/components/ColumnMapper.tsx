import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Columns } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ColumnMapping, ImportedData } from "@/types/abc";
import { useState, useEffect } from "react";
import { detectColumns, isValidMapping } from "@/lib/columnDetector";

interface ColumnMapperProps {
  data: ImportedData;
  onMappingChange: (mapping: Partial<ColumnMapping>, isValid: boolean) => void;
}

interface FieldOption {
  value: string;
  label: string;
  required: boolean;
}

interface FieldGroup {
  group: string;
  icon: string;
  fields: FieldOption[];
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    group: "Campos Básicos",
    icon: "📦",
    fields: [
      { value: "code", label: "Código", required: false },
      { value: "name", label: "Nome", required: true },
      { value: "quantity", label: "Quantidade", required: true },
      { value: "unitPrice", label: "Preço Unitário", required: true },
      { value: "unit", label: "Unidade", required: false },
    ]
  },
  {
    group: "Campos Logísticos",
    icon: "🚚",
    fields: [
      { value: "category", label: "Categoria", required: false },
      { value: "subcategory", label: "Subcategoria", required: false },
      { value: "supplier", label: "Fornecedor", required: false },
      { value: "leadTime", label: "Lead Time (dias)", required: false },
      { value: "currentStock", label: "Estoque Atual", required: false },
      { value: "minStock", label: "Estoque Mínimo", required: false },
      { value: "reorderPoint", label: "Ponto de Reposição", required: false },
      { value: "batch", label: "Lote", required: false },
      { value: "expirationDate", label: "Validade", required: false },
    ]
  },
  {
    group: "Campos Temporais",
    icon: "📅",
    fields: [
      { value: "movementDate", label: "Data da Movimentação", required: false },
      { value: "month", label: "Mês", required: false },
      { value: "year", label: "Ano", required: false },
      { value: "lastPurchaseDate", label: "Última Compra", required: false },
      { value: "consumptionFrequency", label: "Frequência de Consumo", required: false },
    ]
  },
  {
    group: "Campos Clínicos",
    icon: "🏥",
    fields: [
      { value: "clinicalCriticality", label: "Criticidade Clínica", required: false },
      { value: "therapeuticIndication", label: "Indicação Terapêutica", required: false },
      { value: "activeIngredient", label: "Princípio Ativo", required: false },
      { value: "administrationRoute", label: "Via de Administração", required: false },
      { value: "specialControl", label: "Controle Especial", required: false },
      { value: "storageTemperature", label: "Temperatura de Armazenamento", required: false },
    ]
  },
  {
    group: "Campos Financeiros",
    icon: "💰",
    fields: [
      { value: "totalCost", label: "Custo Total", required: false },
      { value: "stockValue", label: "Valor do Estoque", required: false },
      { value: "profitMargin", label: "Margem de Lucro (%)", required: false },
      { value: "discount", label: "Desconto (%)", required: false },
      { value: "tax", label: "Imposto (%)", required: false },
    ]
  },
  {
    group: "Campos Operacionais",
    icon: "🔧",
    fields: [
      { value: "requestingSector", label: "Setor Solicitante", required: false },
      { value: "costCenter", label: "Centro de Custo", required: false },
      { value: "movementType", label: "Tipo de Movimento", required: false },
      { value: "invoiceNumber", label: "Número da Nota Fiscal", required: false },
      { value: "responsible", label: "Responsável", required: false },
    ]
  },
  {
    group: "Campos Analíticos",
    icon: "📊",
    fields: [
      { value: "seasonality", label: "Sazonalidade", required: false },
      { value: "trend", label: "Tendência", required: false },
      { value: "volatility", label: "Volatilidade", required: false },
      { value: "stockoutRate", label: "Taxa de Ruptura", required: false },
    ]
  }
];

const ALL_FIELDS = [
  { value: "none", label: "Não mapear", required: false },
  ...FIELD_GROUPS.flatMap(g => g.fields)
];

export const ColumnMapper = ({ data, onMappingChange }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [autoDetected, setAutoDetected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const detected = detectColumns(data.headers);
    setMapping(detected);
    
    const detectedFields = new Set<string>();
    Object.entries(detected).forEach(([field]) => {
      detectedFields.add(field);
    });
    setAutoDetected(detectedFields);
    
    onMappingChange(detected, isValidMapping(detected));
  }, [data.headers]);

  const handleColumnChange = (columnIndex: number, field: string) => {
    const newMapping = { ...mapping };
    
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key as keyof ColumnMapping] === columnIndex) {
        delete newMapping[key as keyof ColumnMapping];
      }
    });

    if (field !== "none") {
      newMapping[field as keyof ColumnMapping] = columnIndex;
    }

    setMapping(newMapping);
    onMappingChange(newMapping, isValidMapping(newMapping));
  };

  const getSelectedField = (columnIndex: number): string => {
    const entry = Object.entries(mapping).find(([, idx]) => idx === columnIndex);
    return entry ? entry[0] : "none";
  };

  const isMapped = (field: string): boolean => {
    return mapping[field as keyof ColumnMapping] !== undefined;
  };

  const previewRows = data.rows.slice(0, 5);
  const valid = isValidMapping(mapping);
  
  const requiredFields = ALL_FIELDS.filter(f => f.required);
  const mappedCount = Object.keys(mapping).filter(k => k !== 'none').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Columns className="w-5 h-5 text-primary" />
          <CardTitle>Mapeamento de Colunas</CardTitle>
        </div>
        <CardDescription>
          Configure como as colunas do arquivo devem ser interpretadas. 
          {mappedCount > 0 && (
            <span className="block mt-1 text-primary font-medium">
              {mappedCount} campos mapeados ({autoDetected.size} auto-detectados)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!valid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Os campos obrigatórios <strong>Nome</strong>, <strong>Quantidade</strong> e <strong>Preço Unitário</strong> devem ser mapeados
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h4 className="font-medium mb-3">Preview dos Dados (primeiras 5 linhas)</h4>
          <div className="border rounded-lg overflow-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {data.headers.map((header, idx) => (
                    <TableHead key={idx} className="whitespace-nowrap">
                      {header || `Coluna ${idx + 1}`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <TableCell key={cellIdx} className="whitespace-nowrap">
                        {String(cell || "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Mapeamento de Colunas</h4>
          <Accordion type="multiple" defaultValue={["basicos"]} className="space-y-2">
            {FIELD_GROUPS.map((group, groupIdx) => (
              <AccordionItem key={groupIdx} value={groupIdx === 0 ? "basicos" : `group-${groupIdx}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>{group.icon}</span>
                    <span className="font-medium">{group.group}</span>
                    <Badge variant="outline" className="ml-2">
                      {group.fields.filter(f => isMapped(f.value)).length}/{group.fields.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-3">
                  {data.headers.map((header, idx) => {
                    const selectedField = getSelectedField(idx);
                    const isInGroup = group.fields.some(f => f.value === selectedField);
                    
                    if (!isInGroup && selectedField !== "none") return null;
                    
                    const isAuto = autoDetected.has(selectedField);
                    
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {header || `Coluna ${idx + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Exemplo: {String(data.rows[0]?.[idx] || "").substring(0, 30)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedField}
                            onValueChange={(value) => handleColumnChange(idx, value)}
                          >
                            <SelectTrigger className="w-[220px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Não mapear</SelectItem>
                              {group.fields.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                  {option.required && <span className="text-destructive ml-1">*</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedField !== "none" && (
                            <div>
                              {isAuto ? (
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  Auto
                                </Badge>
                              ) : (
                                <Badge variant="outline">Manual</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <p className="font-medium text-sm">Status do Mapeamento:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {requiredFields.map(option => {
              const mapped = isMapped(option.value);
              return (
                <div key={option.value} className="flex items-center gap-2">
                  {mapped ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={mapped ? "text-foreground" : "text-destructive"}>
                    {option.label}
                    <span className="text-destructive ml-1">*</span>
                  </span>
                </div>
              );
            })}
          </div>
          {mappedCount > 3 && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Campos adicionais mapeados permitirão análises mais avançadas como clustering, previsões e análises temporais.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
