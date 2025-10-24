import { MedicineItem } from "@/components/MedicineForm";
import { AnomalyResult } from "@/types/ml";
import { mean, standardDeviation } from "simple-statistics";

export class AnomalyDetector {
  private threshold: number;
  
  constructor(threshold: number = 3) {
    this.threshold = threshold;
  }
  
  detect(items: MedicineItem[]): AnomalyResult[] {
    if (items.length < 3) {
      return items.map(item => ({
        itemId: item.id,
        itemName: item.name,
        anomalyScore: 0,
        isAnomaly: false,
        reasons: []
      }));
    }

    const values = items.map(i => i.totalValue);
    const quantities = items.map(i => i.quantity);
    const prices = items.map(i => i.unitPrice);
    
    const valueMean = mean(values);
    const valueStd = standardDeviation(values);
    const qtyMean = mean(quantities);
    const qtyStd = standardDeviation(quantities);
    const priceMean = mean(prices);
    const priceStd = standardDeviation(prices);
    
    return items.map(item => {
      const valueZScore = valueStd > 0 ? Math.abs((item.totalValue - valueMean) / valueStd) : 0;
      const qtyZScore = qtyStd > 0 ? Math.abs((item.quantity - qtyMean) / qtyStd) : 0;
      const priceZScore = priceStd > 0 ? Math.abs((item.unitPrice - priceMean) / priceStd) : 0;
      
      const reasons: string[] = [];
      let anomalyScore = 0;
      
      if (valueZScore > this.threshold) {
        reasons.push(`Valor total ${valueZScore.toFixed(1)}σ acima do padrão`);
        anomalyScore += valueZScore;
      }
      
      if (qtyZScore > this.threshold) {
        reasons.push(`Quantidade ${qtyZScore.toFixed(1)}σ fora do padrão`);
        anomalyScore += qtyZScore;
      }
      
      if (priceZScore > this.threshold) {
        reasons.push(`Preço unitário ${priceZScore.toFixed(1)}σ fora do padrão`);
        anomalyScore += priceZScore;
      }
      
      // Verificar criticidade vs valor
      if (item.clinicalCriticality === 'alta' && item.classification === 'C') {
        reasons.push('Alta criticidade clínica mas baixo valor financeiro');
        anomalyScore += 2;
      }
      
      // Verificar baixa criticidade com alto valor
      if (item.clinicalCriticality === 'baixa' && item.classification === 'A') {
        reasons.push('Baixa criticidade clínica mas alto valor financeiro');
        anomalyScore += 1.5;
      }
      
      return {
        itemId: item.id,
        itemName: item.name,
        anomalyScore,
        isAnomaly: anomalyScore > this.threshold,
        reasons
      };
    });
  }
}
