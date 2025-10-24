import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Insight } from "@/lib/insights/insightGenerator";
import { Info, AlertTriangle, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";

interface InsightsPanelProps {
  insights: Insight[];
}

export const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "alert":
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getVariant = (type: Insight["type"]) => {
    switch (type) {
      case "alert":
      case "warning":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="p-8 shadow-[var(--shadow-medium)]">
        <div className="text-center text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Adicione itens para gerar insights automáticos</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Insights Automáticos</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Análises e recomendações geradas automaticamente baseadas nos seus dados
        </p>

        <div className="space-y-4">
          {insights.map((insight) => (
            <Alert key={insight.id} variant={getVariant(insight.type)}>
              <div className="flex gap-3">
                {getIcon(insight.type)}
                <div className="flex-1">
                  <AlertTitle className="mb-2">{insight.title}</AlertTitle>
                  <AlertDescription className="text-sm">
                    {insight.description}
                  </AlertDescription>
                  {insight.actionable && insight.recommendation && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Recomendação:
                      </p>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {insight.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </Card>
    </div>
  );
};
