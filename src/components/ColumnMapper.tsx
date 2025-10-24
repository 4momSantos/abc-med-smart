import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Columns } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColumnMapping, ImportedData } from "@/types/abc";
import { useState, useEffect } from "react";
import { detectColumns, isValidMapping } from "@/lib/columnDetector";

interface ColumnMapperProps {
  data: ImportedData;
  onMappingChange: (mapping: Partial<ColumnMapping>, isValid: boolean) => void;
}

const FIELD_OPTIONS = [
  { value: "none", label: "Não mapear", required: false },
  { value: "code", label: "Código", required: false },
  { value: "name", label: "Nome", required: true },
  { value: "quantity", label: "Quantidade", required: true },
  { value: "unitPrice", label: "Preço Unitário", required: true },
  { value: "unit", label: "Unidade", required: false },
  { value: "clinicalCriticality", label: "Criticidade Clínica", required: false },
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Columns className="w-5 h-5 text-primary" />
          <CardTitle>Mapeamento de Colunas</CardTitle>
        </div>
        <CardDescription>
          Configure como as colunas do arquivo devem ser interpretadas
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
          <div className="space-y-3">
            {data.headers.map((header, idx) => {
              const selectedField = getSelectedField(idx);
              const isAuto = autoDetected.has(selectedField);
              const fieldOption = FIELD_OPTIONS.find(opt => opt.value === selectedField);
              
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
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map(option => (
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
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="font-medium text-sm">Status do Mapeamento:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {FIELD_OPTIONS.filter(opt => opt.value !== "none").map(option => {
              const mapped = isMapped(option.value);
              return (
                <div key={option.value} className="flex items-center gap-2">
                  {mapped ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={mapped ? "text-foreground" : "text-muted-foreground"}>
                    {option.label}
                    {option.required && <span className="text-destructive ml-1">*</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
