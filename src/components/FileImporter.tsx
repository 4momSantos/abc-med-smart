import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseFile } from "@/lib/fileParser";
import { ImportedData } from "@/types/abc";

interface FileImporterProps {
  onFileProcessed: (data: ImportedData) => void;
}

export const FileImporter = ({ onFileProcessed }: FileImporterProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ["xlsx", "xls", "csv"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const data = await parseFile(file);
      
      if (data.rows.length === 0) {
        toast({
          title: "Arquivo vazio",
          description: "O arquivo não contém dados para importar",
          variant: "destructive",
        });
        return;
      }

      onFileProcessed(data);
      toast({
        title: "Arquivo carregado com sucesso",
        description: `${data.rows.length} linha(s) encontrada(s)`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: (error as Error).message,
        variant: "destructive",
      });
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <CardTitle>Importar Arquivo</CardTitle>
        </div>
        <CardDescription>
          Faça upload de um arquivo Excel (.xlsx, .xls) ou CSV (.csv) com seus dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique no botão abaixo para selecionar
                </p>
              </div>

              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel (.xlsx, .xls)</span>
                <span>•</span>
                <FileText className="w-4 h-4" />
                <span>CSV (.csv)</span>
              </div>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={isProcessing}>
                  <span>Selecionar Arquivo</span>
                </Button>
              </label>

              <p className="text-xs text-muted-foreground">
                Tamanho máximo: 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {selectedFile.name.endsWith(".csv") ? (
                <FileText className="w-8 h-8 text-primary" />
              ) : (
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isProcessing && (
              <p className="text-sm text-muted-foreground text-center">
                Processando arquivo...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
