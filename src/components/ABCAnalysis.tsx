import { MedicineItem } from "./MedicineForm";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, AlertTriangle } from "lucide-react";

interface ABCAnalysisProps {
  items: MedicineItem[];
}

export const ABCAnalysis = ({ items }: ABCAnalysisProps) => {
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  
  const classA = items.filter(item => item.classification === "A");
  const classB = items.filter(item => item.classification === "B");
  const classC = items.filter(item => item.classification === "C");
  
  const classAValue = classA.reduce((sum, item) => sum + item.totalValue, 0);
  const classBValue = classB.reduce((sum, item) => sum + item.totalValue, 0);
  const classCValue = classC.reduce((sum, item) => sum + item.totalValue, 0);

  const top10Items = [...items].sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);

  const criticalLowValue = items.filter(
    item => item.clinicalCriticality === "alta" && item.classification === "C"
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${((value / totalValue) * 100).toFixed(2)}%`;
  };

  const classData = [
    {
      class: "A",
      items: classA.length,
      itemsPercent: ((classA.length / items.length) * 100).toFixed(1),
      value: classAValue,
      valuePercent: ((classAValue / totalValue) * 100).toFixed(1),
      color: "bg-[hsl(var(--class-a))]",
    },
    {
      class: "B",
      items: classB.length,
      itemsPercent: ((classB.length / items.length) * 100).toFixed(1),
      value: classBValue,
      valuePercent: ((classBValue / totalValue) * 100).toFixed(1),
      color: "bg-[hsl(var(--class-b))]",
    },
    {
      class: "C",
      items: classC.length,
      itemsPercent: ((classC.length / items.length) * 100).toFixed(1),
      value: classCValue,
      valuePercent: ((classCValue / totalValue) * 100).toFixed(1),
      color: "bg-[hsl(var(--class-c))]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Resumo Estatístico */}
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Análise Detalhada por Classe</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Classe</TableHead>
                <TableHead className="text-right font-semibold">Qtd. Itens</TableHead>
                <TableHead className="text-right font-semibold">% Itens</TableHead>
                <TableHead className="text-right font-semibold">Valor Total</TableHead>
                <TableHead className="text-right font-semibold">% Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classData.map((row) => (
                <TableRow key={row.class}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${row.color}`} />
                      <span className="font-semibold">Classe {row.class}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{row.items}</TableCell>
                  <TableCell className="text-right">{row.itemsPercent}%</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.value)}</TableCell>
                  <TableCell className="text-right font-semibold">{row.valuePercent}%</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell>Total Geral</TableCell>
                <TableCell className="text-right">{items.length}</TableCell>
                <TableCell className="text-right">100%</TableCell>
                <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top 10 Itens Críticos */}
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Top 10 Itens Mais Críticos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="text-right font-semibold">Valor Total</TableHead>
                <TableHead className="text-right font-semibold">% do Total</TableHead>
                <TableHead className="text-center font-semibold">Criticidade</TableHead>
                <TableHead className="text-center font-semibold">Classe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top10Items.map((item, index) => (
                <TableRow key={item.id} className={index < 3 ? "bg-[hsl(var(--class-a-light))]" : ""}>
                  <TableCell className="font-semibold">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(item.totalValue)}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={
                        item.clinicalCriticality === "alta" 
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : item.clinicalCriticality === "média"
                          ? "bg-[hsl(var(--class-b-light))] text-[hsl(var(--class-b))] border-[hsl(var(--class-b))]/20"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {item.clinicalCriticality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={
                        item.classification === "A"
                          ? "bg-[hsl(var(--class-a))] text-[hsl(var(--class-a-foreground))]"
                          : item.classification === "B"
                          ? "bg-[hsl(var(--class-b))] text-[hsl(var(--class-b-foreground))]"
                          : "bg-[hsl(var(--class-c))] text-[hsl(var(--class-c-foreground))]"
                      }
                    >
                      {item.classification}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Alertas de Itens Críticos de Baixo Valor */}
      {criticalLowValue.length > 0 && (
        <Card className="p-6 shadow-[var(--shadow-medium)] border-destructive/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold text-foreground">
              Alertas: Itens de Alta Criticidade Clínica com Baixo Valor Financeiro
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Estes itens possuem baixo valor financeiro (Classe C) mas alta importância clínica. 
            Requerem atenção especial para evitar rupturas de estoque.
          </p>
          <div className="space-y-2">
            {criticalLowValue.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Código: {item.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(item.totalValue)}</p>
                  <p className="text-sm text-muted-foreground">{formatPercentage(item.totalValue)} do total</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
