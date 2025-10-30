import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MedicineItem } from "@/types/medicine";
import {
  Package,
  Building2,
  DollarSign,
  Stethoscope,
  Archive,
  Briefcase,
  TrendingUp,
  Calendar,
  X,
  FileEdit,
  FileDown,
  Copy,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ItemDetailDialogProps {
  item: MedicineItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date?: Date) => {
  if (!date) return "Não informado";
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
};

const formatPercentage = (value?: number) => {
  if (value === undefined || value === null) return "Não informado";
  return `${value.toFixed(2)}%`;
};

const getValidityStatus = (expirationDate?: Date) => {
  if (!expirationDate) return { status: "unknown", label: "Não informado", color: "bg-muted" };
  
  const today = new Date();
  const expiry = new Date(expirationDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return { status: "expired", label: "Vencido", color: "bg-destructive" };
  if (daysUntilExpiry <= 30) return { status: "critical", label: "Crítico (≤30 dias)", color: "bg-destructive" };
  if (daysUntilExpiry <= 90) return { status: "warning", label: "Atenção (≤90 dias)", color: "bg-warning" };
  if (daysUntilExpiry <= 180) return { status: "caution", label: "Observação (≤180 dias)", color: "bg-accent" };
  return { status: "valid", label: "Válido", color: "bg-success" };
};

const getCriticalityBadge = (criticality?: string) => {
  if (!criticality) return null;
  
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
    alta: { variant: "destructive", className: "bg-destructive" },
    média: { variant: "default", className: "bg-warning" },
    baixa: { variant: "secondary", className: "bg-success" },
  };
  
  const config = variants[criticality.toLowerCase()] || { variant: "outline" as const, className: "" };
  return <Badge variant={config.variant} className={config.className}>{criticality}</Badge>;
};

const getABCBadge = (classification?: string) => {
  if (!classification) return null;
  
  const colors: Record<string, string> = {
    A: "bg-class-a text-white",
    B: "bg-class-b text-white",
    C: "bg-class-c text-white",
  };
  
  return <Badge className={colors[classification] || ""}>{classification}</Badge>;
};

export function ItemDetailDialog({ item, open, onOpenChange }: ItemDetailDialogProps) {
  if (!item) return null;

  const validityStatus = getValidityStatus(item.expirationDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {item.code ? `Código: ${item.code}` : "Sem código"}
              </p>
            </div>
            <div className="flex gap-2">
              {getABCBadge(item.classification)}
              {getCriticalityBadge(item.clinicalCriticality)}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            {/* Informações Principais */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5" />
                Informações Principais
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">{item.category || "Não informado"}</span>
                </div>
                {item.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subcategoria:</span>
                    <span className="font-medium">{item.subcategory}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidade:</span>
                  <span className="font-medium">{item.unit || "Não informado"}</span>
                </div>
                {item.movementDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data de Movimentação:</span>
                    <span className="font-medium">{formatDate(item.movementDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Fornecedor */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Informações do Fornecedor
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fornecedor:</span>
                  <span className="font-medium">{item.supplier || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead Time:</span>
                  <span className="font-medium">
                    {item.leadTime ? `${item.leadTime} dias` : "Não informado"}
                  </span>
                </div>
                {item.lastPurchaseDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última Compra:</span>
                    <span className="font-medium">{formatDate(item.lastPurchaseDate)}</span>
                  </div>
                )}
                {item.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nota Fiscal:</span>
                    <span className="font-medium">{item.invoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Valores e Estoque */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5" />
                Valores e Estoque
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">{item.quantity.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Unitário:</span>
                  <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="font-medium font-bold">{formatCurrency(item.totalValue)}</span>
                </div>
                {item.totalCost !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo Total:</span>
                    <span className="font-medium">{formatCurrency(item.totalCost)}</span>
                  </div>
                )}
                {item.profitMargin !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margem de Lucro:</span>
                    <span className="font-medium">{formatPercentage(item.profitMargin)}</span>
                  </div>
                )}
                {item.discount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span className="font-medium">{formatPercentage(item.discount)}</span>
                  </div>
                )}
                {item.tax !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impostos:</span>
                    <span className="font-medium">{formatPercentage(item.tax)}</span>
                  </div>
                )}
                {item.stockValue !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor em Estoque:</span>
                    <span className="font-medium">{formatCurrency(item.stockValue)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Informações Clínicas */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5" />
                Informações Clínicas
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Criticidade Clínica:</span>
                  {getCriticalityBadge(item.clinicalCriticality) || (
                    <span className="text-muted-foreground">Não informado</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Indicação Terapêutica:</span>
                  <span className="font-medium">{item.therapeuticIndication || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Princípio Ativo:</span>
                  <span className="font-medium">{item.activeIngredient || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Via de Administração:</span>
                  <span className="font-medium">{item.administrationRoute || "Não informado"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Controle Especial:</span>
                  <div className="flex items-center gap-1">
                    {item.specialControl ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-medium">Sim</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Não</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controle Logístico */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Archive className="h-5 w-5" />
                Controle Logístico
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                {item.currentStock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estoque Atual:</span>
                    <span className="font-medium">{item.currentStock}</span>
                  </div>
                )}
                {item.minStock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estoque Mínimo:</span>
                    <span className="font-medium">{item.minStock}</span>
                  </div>
                )}
                {item.reorderPoint !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ponto de Reposição:</span>
                    <span className="font-medium">{item.reorderPoint}</span>
                  </div>
                )}
                {item.needsReorder !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Necessita Reposição:</span>
                    <div className="flex items-center gap-1">
                      {item.needsReorder ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="font-medium text-destructive">Sim</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="font-medium">Não</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {item.batch && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="font-medium">{item.batch}</span>
                  </div>
                )}
                {item.expirationDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Data de Validade:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatDate(item.expirationDate)}</span>
                      <Badge className={validityStatus.color}>{validityStatus.label}</Badge>
                    </div>
                  </div>
                )}
                {item.storageTemperature && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura de Armazenamento:</span>
                    <span className="font-medium">{item.storageTemperature}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dados Operacionais */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="h-5 w-5" />
                Dados Operacionais
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setor Solicitante:</span>
                  <span className="font-medium">{item.requestingSector || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Centro de Custo:</span>
                  <span className="font-medium">{item.costCenter || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Movimentação:</span>
                  <span className="font-medium">{item.movementType || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responsável:</span>
                  <span className="font-medium">{item.responsible || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequência de Consumo:</span>
                  <span className="font-medium">{item.consumptionFrequency || "Não informado"}</span>
                </div>
              </div>
            </div>

            {/* Análise e Tendências */}
            {(item.seasonality || item.trend || item.volatility !== undefined || item.stockoutRate !== undefined) && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Análise e Tendências
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  {item.seasonality && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sazonalidade:</span>
                      <span className="font-medium">{item.seasonality}</span>
                    </div>
                  )}
                  {item.trend && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tendência:</span>
                      <span className="font-medium">{item.trend}</span>
                    </div>
                  )}
                  {item.volatility !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volatilidade:</span>
                      <span className="font-medium">{item.volatility.toFixed(2)}</span>
                    </div>
                  )}
                  {item.stockoutRate !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de Ruptura:</span>
                      <span className="font-medium">{formatPercentage(item.stockoutRate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline de Datas Importantes */}
        <div className="border rounded-lg p-4 space-y-3 mt-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Timeline de Datas Importantes
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            {item.movementDate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Movimentação</p>
                  <p className="font-medium">{formatDate(item.movementDate)}</p>
                </div>
              </div>
            )}
            {item.expirationDate && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Validade</p>
                  <p className="font-medium">{formatDate(item.expirationDate)}</p>
                </div>
              </div>
            )}
            {item.lastPurchaseDate && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Última Compra</p>
                  <p className="font-medium">{formatDate(item.lastPurchaseDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="flex flex-wrap gap-2 justify-end mt-6 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="default" size="sm">
            <FileEdit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
