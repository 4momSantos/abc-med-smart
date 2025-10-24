import { MedicineItem } from "./MedicineForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ABCTableProps {
  items: MedicineItem[];
}

export const ABCTable = ({ items }: ABCTableProps) => {
  const getClassBadge = (classification: "A" | "B" | "C") => {
    const variants = {
      A: "bg-[hsl(var(--class-a))] text-[hsl(var(--class-a-foreground))] hover:bg-[hsl(var(--class-a))]",
      B: "bg-[hsl(var(--class-b))] text-[hsl(var(--class-b-foreground))] hover:bg-[hsl(var(--class-b))]",
      C: "bg-[hsl(var(--class-c))] text-[hsl(var(--class-c-foreground))] hover:bg-[hsl(var(--class-c))]",
    };
    return variants[classification];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-medium)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="text-right font-semibold">Quantidade</TableHead>
              <TableHead className="text-right font-semibold">Preço Unit.</TableHead>
              <TableHead className="text-right font-semibold">Valor Total</TableHead>
              <TableHead className="text-right font-semibold">% Individual</TableHead>
              <TableHead className="text-right font-semibold">% Acumulado</TableHead>
              <TableHead className="text-center font-semibold">Classe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum item cadastrado. Adicione itens para começar a análise ABC.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
