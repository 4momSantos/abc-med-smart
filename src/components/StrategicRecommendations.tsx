import { MedicineItem } from "./MedicineForm";
import { Card } from "@/components/ui/card";
import { Lightbulb, ShieldCheck, Clock, DollarSign, AlertCircle } from "lucide-react";

interface StrategicRecommendationsProps {
  items: MedicineItem[];
}

export const StrategicRecommendations = ({ items }: StrategicRecommendationsProps) => {
  const classA = items.filter(item => item.classification === "A");
  const classB = items.filter(item => item.classification === "B");
  const classC = items.filter(item => item.classification === "C");

  const recommendations = [
    {
      title: "Classe A - Alta Prioridade",
      icon: ShieldCheck,
      color: "text-[hsl(var(--class-a))]",
      bgColor: "bg-[hsl(var(--class-a-light))]",
      borderColor: "border-[hsl(var(--class-a))]/20",
      items: classA.length,
      suggestions: [
        {
          icon: Clock,
          title: "Política de Estoque",
          description: "Manter estoque de segurança para 2-3 meses. Revisar níveis semanalmente.",
        },
        {
          icon: DollarSign,
          title: "Oportunidades de Negociação",
          description: "Negociar contratos anuais com fornecedores. Considerar compra centralizada para obter melhores preços.",
        },
        {
          icon: AlertCircle,
          title: "Controle Rigoroso",
          description: "Implementar controle de lote, validade e fornecedor. Monitorar tendências de preço mensalmente.",
        },
      ],
    },
    {
      title: "Classe B - Média Prioridade",
      icon: Clock,
      color: "text-[hsl(var(--class-b))]",
      bgColor: "bg-[hsl(var(--class-b-light))]",
      borderColor: "border-[hsl(var(--class-b))]/20",
      items: classB.length,
      suggestions: [
        {
          icon: Clock,
          title: "Política de Estoque",
          description: "Manter estoque para 1-2 meses. Revisar níveis quinzenalmente.",
        },
        {
          icon: DollarSign,
          title: "Consolidação de Compras",
          description: "Agrupar itens similares para negociações trimestrais. Buscar padronização quando possível.",
        },
        {
          icon: AlertCircle,
          title: "Controle Intermediário",
          description: "Monitorar consumo mensal e ajustar pedidos conforme necessário.",
        },
      ],
    },
    {
      title: "Classe C - Baixa Prioridade",
      icon: DollarSign,
      color: "text-[hsl(var(--class-c))]",
      bgColor: "bg-[hsl(var(--class-c-light))]",
      borderColor: "border-[hsl(var(--class-c))]/20",
      items: classC.length,
      suggestions: [
        {
          icon: Clock,
          title: "Política de Estoque",
          description: "Sistema de pedido sob demanda ou estoque mínimo. Revisar níveis mensalmente.",
        },
        {
          icon: DollarSign,
          title: "Simplificação de Processos",
          description: "Reduzir burocracia nas compras. Considerar fornecedores locais para entregas rápidas.",
        },
        {
          icon: AlertCircle,
          title: "Padronização",
          description: "Avaliar possibilidade de padronizar itens similares para reduzir variedade de estoque.",
        },
      ],
    },
  ];

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Recomendações Estratégicas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Diretrizes de gestão personalizadas para cada classe de itens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className={`p-5 rounded-lg border ${rec.borderColor} ${rec.bgColor}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-card`}>
                  <Icon className={`w-5 h-5 ${rec.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.items} itens</p>
                </div>
              </div>

              <div className="space-y-4">
                {rec.suggestions.map((suggestion, idx) => {
                  const SuggestionIcon = suggestion.icon;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <SuggestionIcon className={`w-4 h-4 ${rec.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground mb-1">
                          {suggestion.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dicas Gerais */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Dicas Adicionais de Gestão
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Realize auditorias periódicas para validar a classificação ABC e ajustar conforme mudanças no consumo.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Utilize indicadores de desempenho (KPIs) como ruptura de estoque e giro de inventário para monitorar a eficiência.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Considere a sazonalidade e eventos especiais ao planejar estoques de itens Classe A.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Mantenha relacionamento próximo com fornecedores de itens Classe A para garantir fornecimento contínuo.</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};
