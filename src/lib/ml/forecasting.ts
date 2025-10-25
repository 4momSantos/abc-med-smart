import { MedicineItem } from "@/types/medicine";

export interface TimeSeriesPoint {
  date: Date;
  value: number;
}

export interface ForecastResult {
  itemId: string;
  itemName: string;
  historicalData: TimeSeriesPoint[];
  predictions: TimeSeriesPoint[];
  confidence: {
    lower: number[];
    upper: number[];
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
}

/**
 * Previsão de demanda usando média móvel exponencial (EMA)
 * Para previsões mais sofisticadas, pode-se integrar bibliotecas como TensorFlow.js
 */
export class DemandForecasting {
  
  /**
   * Previsão para múltiplos itens
   */
  forecastMultiple(items: MedicineItem[], periodsAhead: number = 12): ForecastResult[] {
    const groupedByItem = this.groupByItem(items);
    
    return Array.from(groupedByItem.entries()).map(([itemId, itemData]) => {
      return this.forecastSingle(itemId, itemData, periodsAhead);
    });
  }
  
  /**
   * Previsão para um único item
   */
  private forecastSingle(
    itemId: string,
    items: MedicineItem[],
    periodsAhead: number
  ): ForecastResult {
    const sortedItems = items
      .filter(item => item.movementDate)
      .sort((a, b) => a.movementDate!.getTime() - b.movementDate!.getTime());
    
    if (sortedItems.length === 0) {
      return this.emptyForecast(itemId, items[0]?.name || 'Unknown');
    }
    
    const historicalData: TimeSeriesPoint[] = sortedItems.map(item => ({
      date: item.movementDate!,
      value: item.quantity
    }));
    
    // Calcular tendência
    const trend = this.calculateTrend(historicalData);
    
    // Detectar sazonalidade
    const seasonality = this.detectSeasonality(historicalData);
    
    // Gerar previsões usando EMA
    const predictions = this.generatePredictions(historicalData, periodsAhead);
    
    // Calcular intervalos de confiança (±20%)
    const confidence = {
      lower: predictions.map(p => p.value * 0.8),
      upper: predictions.map(p => p.value * 1.2)
    };
    
    return {
      itemId,
      itemName: sortedItems[0].name,
      historicalData,
      predictions,
      confidence,
      trend,
      seasonality
    };
  }
  
  /**
   * Agrupar itens por ID/nome
   */
  private groupByItem(items: MedicineItem[]): Map<string, MedicineItem[]> {
    const grouped = new Map<string, MedicineItem[]>();
    
    items.forEach(item => {
      const key = item.code || item.name;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });
    
    return grouped;
  }
  
  /**
   * Calcular tendência usando regressão linear simples
   */
  private calculateTrend(data: TimeSeriesPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, p) => sum + p.value, 0);
    const sumXY = data.reduce((sum, p, i) => sum + i * p.value, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.05) return 'increasing';
    if (slope < -0.05) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Detectar sazonalidade (simples - verifica variação cíclica)
   */
  private detectSeasonality(data: TimeSeriesPoint[]): boolean {
    if (data.length < 12) return false;
    
    // Calcular autocorrelação com lag de 12 meses
    const values = data.map(p => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 12; i < values.length; i++) {
      numerator += (values[i] - mean) * (values[i - 12] - mean);
    }
    
    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    const autocorr = numerator / denominator;
    
    // Se autocorrelação > 0.5, há forte sazonalidade
    return autocorr > 0.5;
  }
  
  /**
   * Gerar previsões usando Média Móvel Exponencial (EMA)
   */
  private generatePredictions(
    historicalData: TimeSeriesPoint[],
    periodsAhead: number
  ): TimeSeriesPoint[] {
    const alpha = 0.3; // Fator de suavização
    const predictions: TimeSeriesPoint[] = [];
    
    // Calcular EMA dos dados históricos
    let ema = historicalData[0].value;
    for (let i = 1; i < historicalData.length; i++) {
      ema = alpha * historicalData[i].value + (1 - alpha) * ema;
    }
    
    // Gerar previsões futuras
    const lastDate = historicalData[historicalData.length - 1].date;
    
    for (let i = 1; i <= periodsAhead; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      predictions.push({
        date: futureDate,
        value: Math.round(ema) // Manter o último EMA como previsão
      });
    }
    
    return predictions;
  }
  
  /**
   * Retornar previsão vazia quando não há dados
   */
  private emptyForecast(itemId: string, itemName: string): ForecastResult {
    return {
      itemId,
      itemName,
      historicalData: [],
      predictions: [],
      confidence: { lower: [], upper: [] },
      trend: 'stable',
      seasonality: false
    };
  }
  
  /**
   * Calcular métricas de acurácia (MAPE - Mean Absolute Percentage Error)
   */
  calculateAccuracy(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length || actual.length === 0) return 0;
    
    let sumPercentageError = 0;
    let count = 0;
    
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== 0) {
        sumPercentageError += Math.abs((actual[i] - predicted[i]) / actual[i]);
        count++;
      }
    }
    
    const mape = (sumPercentageError / count) * 100;
    return 100 - mape; // Retornar como % de acurácia
  }
}
