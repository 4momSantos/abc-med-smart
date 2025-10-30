import { useState } from "react";
import { MedicineItem, UNITS } from "./MedicineForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Download, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ABCConfiguration, AnalysisPeriod } from "@/types/abc";
import { format } from "date-fns";
import { ItemDetailDialog } from "./ItemDetailDialog";

interface ABCTableProps {
  items: MedicineItem[];
  onDeleteItem?: (id: string) => void;
  abcConfig: ABCConfiguration;
  period: AnalysisPeriod;
}

export const ABCTable = ({ items, onDeleteItem, abcConfig, period }: ABCTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MedicineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getClassBadge = (classification: "A" | "B" | "C") => {
    const variants = {
      A: "bg-[hsl(var(--class-a))] text-[hsl(var(--class-a-foreground))] hover:bg-[hsl(var(--class-a))]",
      B: "bg-[hsl(var(--class-b))] text-[hsl(var(--class-b-foreground))] hover:bg-[hsl(var(--class-b))]",
      C: "bg-[hsl(var(--class-c))] text-[hsl(var(--class-c-foreground))] hover:bg-[hsl(var(--class-c))]",
    };
    return variants[classification];
  };

  const getCriticalityBadge = (criticality: "alta" | "média" | "baixa") => {
    const variants = {
      alta: "bg-destructive/10 text-destructive border-destructive/20",
      média: "bg-[hsl(var(--class-b-light))] text-[hsl(var(--class-b))] border-[hsl(var(--class-b))]/20",
      baixa: "bg-muted text-muted-foreground border-border",
    };
    return variants[criticality];
  };

  const getUnitLabel = (unit: string) => {
    const unitObj = UNITS.find(u => u.value === unit);
    return unitObj?.label || unit;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0.00%';
    return `${value.toFixed(2)}%`;
  };

  // Filtrar itens baseado no termo de busca
  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(search) ||
      item.code?.toLowerCase().includes(search) ||
      item.classification.toLowerCase().includes(search) ||
      item.clinicalCriticality?.toLowerCase().includes(search)
    );
  });

  const exportToExcel = () => {
    // Aba 1: Dados Completos
    const data = items.map(item => ({
      Código: item.code,
      Nome: item.name,
      Unidade: getUnitLabel(item.unit),
      Quantidade: item.quantity,
      "Preço Unitário": formatCurrency(item.unitPrice),
      "Valor Total": formatCurrency(item.totalValue),
      "% Individual": formatPercentage(item.percentage),
      "% Acumulado": formatPercentage(item.accumulatedPercentage),
      Classificação: item.classification,
      "Criticidade Clínica": item.clinicalCriticality,
    }));

    const ws1 = XLSX.utils.json_to_sheet(data);

    // Aba 2: Resumo por Classe
    const classA = items.filter(item => item.classification === "A");
    const classB = items.filter(item => item.classification === "B");
    const classC = items.filter(item => item.classification === "C");
    
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const classAValue = classA.reduce((sum, item) => sum + item.totalValue, 0);
    const classBValue = classB.reduce((sum, item) => sum + item.totalValue, 0);
    const classCValue = classC.reduce((sum, item) => sum + item.totalValue, 0);

    const summary = [
      { 
        Classe: "A", 
        "Quantidade de Itens": classA.length,
        "% de Itens": `${((classA.length / items.length) * 100).toFixed(1)}%`,
        "Valor Total": formatCurrency(classAValue),
        "% do Valor": `${((classAValue / totalValue) * 100).toFixed(1)}%`
      },
      { 
        Classe: "B", 
        "Quantidade de Itens": classB.length,
        "% de Itens": `${((classB.length / items.length) * 100).toFixed(1)}%`,
        "Valor Total": formatCurrency(classBValue),
        "% do Valor": `${((classBValue / totalValue) * 100).toFixed(1)}%`
      },
      { 
        Classe: "C", 
        "Quantidade de Itens": classC.length,
        "% de Itens": `${((classC.length / items.length) * 100).toFixed(1)}%`,
        "Valor Total": formatCurrency(classCValue),
        "% do Valor": `${((classCValue / totalValue) * 100).toFixed(1)}%`
      },
    ];

    const ws2 = XLSX.utils.json_to_sheet(summary);

    // Aba 3: Top 10 Críticos
    const top10 = items.slice(0, 10).map((item, index) => ({
      Posição: index + 1,
      Código: item.code,
      Nome: item.name,
      "Valor Total": formatCurrency(item.totalValue),
      "% do Total": formatPercentage(item.percentage),
      "Criticidade Clínica": item.clinicalCriticality,
      Classificação: item.classification,
    }));

    const ws3 = XLSX.utils.json_to_sheet(top10);

    // Aba 4: Configurações
    const config = [
      { Parâmetro: "Período de Início", Valor: format(period.startDate, "dd/MM/yyyy") },
      { Parâmetro: "Período de Fim", Valor: format(period.endDate, "dd/MM/yyyy") },
      { Parâmetro: "Threshold Classe A (%)", Valor: abcConfig.classAThreshold },
      { Parâmetro: "Threshold Classe B (%)", Valor: abcConfig.classBThreshold },
      { Parâmetro: "Total de Itens Analisados", Valor: items.length },
      { Parâmetro: "Valor Total Investido", Valor: formatCurrency(totalValue) },
    ];

    const ws4 = XLSX.utils.json_to_sheet(config);

    // Criar workbook com todas as abas
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Dados Completos");
    XLSX.utils.book_append_sheet(wb, ws2, "Resumo por Classe");
    XLSX.utils.book_append_sheet(wb, ws3, "Top 10 Críticos");
    XLSX.utils.book_append_sheet(wb, ws4, "Configurações");

    const fileName = `Curva_ABC_${format(period.startDate, "yyyy-MM-dd")}_a_${format(period.endDate, "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <>
      <Card className="overflow-hidden shadow-[var(--shadow-medium)]">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Tabela Completa de Itens</h2>
              <p className="text-sm text-muted-foreground mt-1">Análise detalhada de todos os medicamentos e materiais</p>
            </div>
            {items.length > 0 && (
              <Button onClick={exportToExcel} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
            )}
          </div>
          {items.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código, classe ou criticidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Unidade</TableHead>
              <TableHead className="text-right font-semibold">Quantidade</TableHead>
              <TableHead className="text-right font-semibold">Preço Unit.</TableHead>
              <TableHead className="text-right font-semibold">Valor Total</TableHead>
              <TableHead className="text-right font-semibold">% Individual</TableHead>
              <TableHead className="text-right font-semibold">% Acumulado</TableHead>
              <TableHead className="text-center font-semibold">Classe</TableHead>
              <TableHead className="text-center font-semibold">Criticidade</TableHead>
              <TableHead className="text-center font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  Nenhum item cadastrado. Adicione itens para começar a análise ABC.
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  Nenhum item encontrado com "{searchTerm}".
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{getUnitLabel(item.unit)}</TableCell>
                  <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(item.percentage)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatPercentage(item.accumulatedPercentage)}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getClassBadge(item.classification)}>
                      {item.classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={getCriticalityBadge(item.clinicalCriticality)}>
                      {item.clinicalCriticality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onDeleteItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Excluir item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>

    <ItemDetailDialog 
      item={selectedItem}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
    </>
  );
};
