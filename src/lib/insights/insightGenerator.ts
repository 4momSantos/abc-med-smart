import { MedicineItem } from "@/components/MedicineForm";
import { AnomalyResult } from "@/types/ml";
import { DescriptiveStats } from "@/lib/statistics/descriptiveStats";

export interface Insight {
  id: string;
  type: "info" | "warning" | "success" | "alert";
  title: string;
  description: string;
  actionable: boolean;
  recommendation?: string;
}

export const generateInsights = (
  items: MedicineItem[],
  anomalies: AnomalyResult[],
  stats: DescriptiveStats
): Insight[] => {
  const insights: Insight[] = [];

  if (items.length === 0) return insights;

  // Insight sobre concentração Classe A
  const classA = items.filter(i => i.classification === "A");
  const classB = items.filter(i => i.classification === "B");
  const classC = items.filter(i => i.classification === "C");
  
  const totalValue = items.reduce((sum, i) => sum + i.totalValue, 0);
  const classAValue = classA.reduce((sum, i) => sum + i.totalValue, 0);
  const classAPercent = (classA.length / items.length) * 100;
  const classAValuePercent = (classAValue / totalValue) * 100;

  insights.push({
    id: "class-a-concentration",
    type: "info",
    title: "Concentração Classe A",
    description: `Classe A representa ${classAPercent.toFixed(1)}% dos itens (${classA.length}) mas ${classAValuePercent.toFixed(1)}% do valor total (R$ ${classAValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`,
    actionable: true,
    recommendation: "Foque esforços de gestão e controle nestes itens de maior impacto financeiro"
  });

  // Insight sobre itens críticos em Classe C
  const criticalInClassC = items.filter(
    i => i.classification === "C" && i.clinicalCriticality === "alta"
  );

  if (criticalInClassC.length > 0) {
    insights.push({
      id: "critical-low-value",
      type: "warning",
      title: "Itens Críticos em Classe C",
      description: `${criticalInClassC.length} itens com alta criticidade clínica estão na Classe C (baixo valor financeiro)`,
      actionable: true,
      recommendation: "Estes itens precisam de atenção especial no controle de estoque apesar do baixo custo"
    });
  }

  // Insight sobre anomalias
  const criticalAnomalies = anomalies.filter(a => a.isAnomaly && a.anomalyScore > 5);
  
  if (criticalAnomalies.length > 0) {
    insights.push({
      id: "anomalies-detected",
      type: "alert",
      title: "Anomalias Detectadas",
      description: `${criticalAnomalies.length} itens apresentam comportamento atípico que requer investigação`,
      actionable: true,
      recommendation: "Revisar urgentemente: " + criticalAnomalies.slice(0, 3).map(a => a.itemName).join(", ")
    });
  }

  // Insight sobre distribuição
  if (stats.coefficientOfVariation > 100) {
    insights.push({
      id: "high-variability",
      type: "warning",
      title: "Alta Variabilidade nos Valores",
      description: `Coeficiente de variação de ${stats.coefficientOfVariation.toFixed(1)}% indica grande dispersão nos valores`,
      actionable: true,
      recommendation: "Considere segmentar a análise por categorias ou grupos para melhor controle"
    });
  }

  // Insight sobre outliers
  if (stats.outliers.count > 0) {
    const outlierPercent = (stats.outliers.count / items.length) * 100;
    insights.push({
      id: "outliers-found",
      type: "info",
      title: "Valores Extremos Identificados",
      description: `${stats.outliers.count} itens (${outlierPercent.toFixed(1)}%) apresentam valores extremos em relação à distribuição`,
      actionable: true,
      recommendation: "Revisar se estes valores extremos são esperados ou indicam erros de cadastro"
    });
  }

  // Insight sobre top 5 itens
  const top5 = items.slice(0, 5);
  const top5Value = top5.reduce((sum, i) => sum + i.totalValue, 0);
  const top5Percent = (top5Value / totalValue) * 100;

  if (items.length >= 5) {
    insights.push({
      id: "top-5-concentration",
      type: "success",
      title: "Top 5 Itens Mais Valiosos",
      description: `Os 5 itens de maior valor representam ${top5Percent.toFixed(1)}% do valor total: ${top5.map(i => i.name).join(", ")}`,
      actionable: true,
      recommendation: "Priorize negociações e contratos para estes itens de maior impacto"
    });
  }

  // Insight sobre distribuição entre classes
  const balanceScore = Math.abs(classA.length - classB.length) + Math.abs(classB.length - classC.length);
  
  if (balanceScore > items.length * 0.5) {
    insights.push({
      id: "unbalanced-distribution",
      type: "info",
      title: "Distribuição Desbalanceada",
      description: `A distribuição entre as classes está desbalanceada: A=${classA.length}, B=${classB.length}, C=${classC.length}`,
      actionable: true,
      recommendation: "Revise os thresholds de classificação ABC se necessário para melhor segmentação"
    });
  }

  return insights;
};
