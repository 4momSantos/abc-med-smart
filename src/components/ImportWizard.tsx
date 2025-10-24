import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileImporter } from "./FileImporter";
import { ColumnMapper } from "./ColumnMapper";
import { WizardProgress } from "./WizardProgress";
import { ABCConfiguration } from "./ABCConfiguration";
import { PeriodSelector } from "./PeriodSelector";
import { ImportedData, ColumnMapping, ABCConfiguration as ABCConfig, AnalysisPeriod } from "@/types/abc";
import { MedicineItem } from "./MedicineForm";
import { processImportedData } from "@/lib/dataValidator";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WizardStep = "upload" | "mapping" | "configure" | "review";

interface ImportWizardProps {
  onImportComplete: (items: MedicineItem[]) => void;
  abcConfig: ABCConfig;
  onConfigChange: (config: ABCConfig) => void;
  period: AnalysisPeriod;
  onPeriodChange: (period: AnalysisPeriod) => void;
}

export const ImportWizard = ({ 
  onImportComplete, 
  abcConfig, 
  onConfigChange,
  period,
  onPeriodChange 
}: ImportWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [columnMapping, setColumnMapping] = useState<Partial<ColumnMapping>>({});
  const [isMappingValid, setIsMappingValid] = useState(false);
  const { toast } = useToast();

  const handleFileProcessed = (data: ImportedData) => {
    setImportedData(data);
    setCurrentStep("mapping");
  };

  const handleMappingChange = (mapping: Partial<ColumnMapping>, isValid: boolean) => {
    setColumnMapping(mapping);
    setIsMappingValid(isValid);
  };

  const handleNext = () => {
    if (currentStep === "upload" && importedData) {
      setCurrentStep("mapping");
    } else if (currentStep === "mapping" && isMappingValid) {
      setCurrentStep("configure");
    } else if (currentStep === "configure") {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "review") {
      setCurrentStep("configure");
    } else if (currentStep === "configure") {
      setCurrentStep("mapping");
    } else if (currentStep === "mapping") {
      setCurrentStep("upload");
    }
  };

  const handleConfirmImport = () => {
    if (!importedData || !isMappingValid) return;

    const result = processImportedData(importedData.rows, columnMapping as ColumnMapping);

    if (result.validItems.length === 0) {
      toast({
        title: "Nenhum item válido",
        description: "Não foi possível importar nenhum item. Verifique os erros abaixo.",
        variant: "destructive",
      });
      return;
    }

    onImportComplete(result.validItems);
    
    toast({
      title: "Importação concluída",
      description: `${result.validItems.length} item(ns) importado(s) com sucesso${result.errors.length > 0 ? `. ${result.errors.length} linha(s) com erro.` : ""}`,
    });
  };

  const processedResult = importedData && isMappingValid 
    ? processImportedData(importedData.rows, columnMapping as ColumnMapping)
    : null;

  return (
    <div className="space-y-6">
      <WizardProgress currentStep={currentStep} />

      {currentStep === "upload" && (
        <>
          <FileImporter onFileProcessed={handleFileProcessed} />
          {importedData && (
            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Próximo: Mapear Colunas <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {currentStep === "mapping" && importedData && (
        <>
          <ColumnMapper 
            data={importedData} 
            onMappingChange={handleMappingChange}
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button onClick={handleNext} disabled={!isMappingValid}>
              Próximo: Configurar Regras <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {currentStep === "configure" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ABCConfiguration config={abcConfig} onChange={onConfigChange} />
            <PeriodSelector period={period} onChange={onPeriodChange} />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button onClick={handleNext}>
              Próximo: Revisar Dados <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {currentStep === "review" && processedResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Revisão dos Dados</CardTitle>
              <CardDescription>
                Confira os dados antes de confirmar a importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Linhas</p>
                  <p className="text-2xl font-bold">{importedData?.rows.length || 0}</p>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">Válidas</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {processedResult.validItems.length}
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-muted-foreground">Com Erros</p>
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    {processedResult.errors.length}
                  </p>
                </div>
              </div>

              {processedResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Linhas com erro:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                      {processedResult.errors.slice(0, 10).map((error) => (
                        <div key={error.row}>
                          Linha {error.row}: {error.errors.join(", ")}
                        </div>
                      ))}
                      {processedResult.errors.length > 10 && (
                        <p className="text-muted-foreground">
                          ... e mais {processedResult.errors.length - 10} erros
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {processedResult.validItems.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">
                    Preview dos Dados Válidos (primeiras 20 linhas)
                  </h4>
                  <div className="border rounded-lg overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Criticidade</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedResult.validItems.slice(0, 20).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              {item.unitPrice.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-1 rounded ${
                                item.clinicalCriticality === "alta" 
                                  ? "bg-red-500/10 text-red-600"
                                  : item.clinicalCriticality === "média"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-green-500/10 text-green-600"
                              }`}>
                                {item.clinicalCriticality}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {item.totalValue.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {processedResult.validItems.length > 20 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ... e mais {processedResult.validItems.length - 20} itens
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={processedResult.validItems.length === 0}
            >
              <CheckCircle className="mr-2 w-4 h-4" />
              Confirmar Importação ({processedResult.validItems.length} itens)
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
