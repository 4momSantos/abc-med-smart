import { MedicineItem } from "@/types/medicine";
import { ABCConfiguration } from "@/types/abc";

/**
 * Calcula a classificação ABC (Curva ABC) dos itens baseado no valor total
 * 
 * Regras:
 * - Classe A: 0% até classAThreshold (padrão 80%) - Itens mais valiosos
 * - Classe B: classAThreshold até classBThreshold (padrão 95%)
 * - Classe C: classBThreshold até 100% - Itens menos valiosos
 * 
 * @param items Array de itens a serem classificados
 * @param config Configuração dos thresholds ABC
 * @returns Array de itens com classificação ABC calculada
 */
export function calculateABCClassification(
  items: MedicineItem[],
  config: ABCConfiguration
): MedicineItem[] {
  // Se não houver itens, retornar array vazio
  if (!items || items.length === 0) {
    console.log('[ABC] Nenhum item para classificar');
    return [];
  }

  console.log('[ABC] Iniciando classificação de', items.length, 'itens');
  console.log('[ABC] Config:', config);

  // 1. Ordenar itens por valor total (decrescente)
  const sortedItems = [...items].sort((a, b) => b.totalValue - a.totalValue);

  // 2. Calcular valor total geral
  const totalValue = sortedItems.reduce((sum, item) => sum + item.totalValue, 0);
  console.log('[ABC] Valor total:', totalValue);

  // Se o valor total for zero, retornar itens sem classificação
  if (totalValue === 0) {
    return sortedItems.map(item => ({
      ...item,
      percentage: 0,
      accumulatedPercentage: 0,
      cumulativePercentage: 0,
      valuePercentage: 0,
      classification: 'C' as const
    }));
  }

  // 3. Calcular percentuais e classificações
  let accumulatedValue = 0;
  
  const classifiedItems = sortedItems.map((item) => {
    // Percentual individual do item em relação ao total
    const percentage = (item.totalValue / totalValue) * 100;
    
    // Adicionar ao valor acumulado
    accumulatedValue += item.totalValue;
    
    // Percentual acumulado
    const accumulatedPercentage = (accumulatedValue / totalValue) * 100;

    // Determinar classificação baseada nos thresholds
    let classification: 'A' | 'B' | 'C';
    if (accumulatedPercentage <= config.classAThreshold) {
      classification = 'A';
    } else if (accumulatedPercentage <= config.classBThreshold) {
      classification = 'B';
    } else {
      classification = 'C';
    }

    return {
      ...item,
      percentage,
      accumulatedPercentage,
      cumulativePercentage: accumulatedPercentage, // Alias para compatibilidade
      valuePercentage: percentage, // Alias para compatibilidade
      classification,
    };
  });

  const classACounts = classifiedItems.filter(i => i.classification === 'A').length;
  const classBCounts = classifiedItems.filter(i => i.classification === 'B').length;
  const classCCounts = classifiedItems.filter(i => i.classification === 'C').length;
  
  console.log('[ABC] Classificação concluída:');
  console.log('  - Classe A:', classACounts, 'itens');
  console.log('  - Classe B:', classBCounts, 'itens');
  console.log('  - Classe C:', classCCounts, 'itens');

  return classifiedItems;
}

/**
 * Recalcula a classificação ABC mantendo a ordem original dos itens
 * (útil quando não queremos reordenar a lista, apenas atualizar as classificações)
 */
export function recalculateABCInPlace(
  items: MedicineItem[],
  config: ABCConfiguration
): MedicineItem[] {
  // Calcular classificações
  const classified = calculateABCClassification(items, config);
  
  // Criar mapa de classificações por ID
  const classificationMap = new Map(
    classified.map(item => [item.id, {
      percentage: item.percentage,
      accumulatedPercentage: item.accumulatedPercentage,
      cumulativePercentage: item.cumulativePercentage,
      valuePercentage: item.valuePercentage,
      classification: item.classification,
    }])
  );
  
  // Aplicar classificações mantendo ordem original
  return items.map(item => ({
    ...item,
    ...(classificationMap.get(item.id) || {
      percentage: 0,
      accumulatedPercentage: 0,
      cumulativePercentage: 0,
      valuePercentage: 0,
      classification: 'C' as const,
    })
  }));
}
