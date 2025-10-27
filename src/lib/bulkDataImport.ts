import { supabase } from '@/integrations/supabase/client';
import { MedicineItem } from '@/types/medicine';

export async function bulkInsertMedicines(items: MedicineItem[]): Promise<{
  success: boolean;
  inserted: number;
  errors: number;
}> {
  try {
    // Obter usuário e organização ativa
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { data: orgId } = await supabase
      .rpc('get_user_active_org', { _user_id: userData.user.id });

    if (!orgId) throw new Error('Nenhuma organização ativa');

    // Preparar dados para inserção
    const medicinesData = items.map(item => ({
      code: item.code,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_value: item.totalValue,
      unit: item.unit,
      category: item.category,
      subcategory: item.subcategory,
      supplier: item.supplier,
      batch: item.batch,
      expiration_date: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : null,
      classification: item.classification,
      percentage: item.percentage,
      accumulated_percentage: item.accumulatedPercentage,
      cumulative_percentage: item.cumulativePercentage,
      value_percentage: item.valuePercentage,
      clinical_criticality: item.clinicalCriticality,
      requesting_sector: item.requestingSector,
      lead_time: item.leadTime,
      min_stock: item.minStock,
      current_stock: item.currentStock,
      reorder_point: item.reorderPoint,
      total_cost: item.totalCost,
      stock_value: item.stockValue,
      profit_margin: item.profitMargin,
      discount: item.discount,
      tax: item.tax,
      movement_date: item.movementDate ? new Date(item.movementDate).toISOString() : null,
      month: item.month,
      year: item.year,
      last_purchase_date: item.lastPurchaseDate ? new Date(item.lastPurchaseDate).toISOString().split('T')[0] : null,
      consumption_frequency: item.consumptionFrequency,
      therapeutic_indication: item.therapeuticIndication,
      active_ingredient: item.activeIngredient,
      administration_route: item.administrationRoute,
      special_control: item.specialControl,
      storage_temperature: item.storageTemperature,
      seasonality: item.seasonality,
      trend: item.trend,
      volatility: item.volatility,
      stockout_rate: item.stockoutRate,
      cost_center: item.costCenter,
      movement_type: item.movementType,
      invoice_number: item.invoiceNumber,
      responsible: item.responsible,
      needs_reorder: item.needsReorder,
      user_id: userData.user.id,
      organization_id: orgId,
    }));

    // Inserir em lotes de 500 (limite do Supabase)
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < medicinesData.length; i += BATCH_SIZE) {
      const batch = medicinesData.slice(i, i + BATCH_SIZE);
      
      try {
        const { data, error } = await supabase
          .from('medicines')
          .insert(batch)
          .select();

        if (error) {
          console.error(`Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
          totalErrors += batch.length;
        } else {
          totalInserted += data?.length || 0;
          console.log(`Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${data?.length} inseridos`);
        }
        
      } catch (error) {
        console.error(`Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
        totalErrors += batch.length;
      }
    }

    return {
      success: totalInserted > 0,
      inserted: totalInserted,
      errors: totalErrors,
    };

  } catch (error: any) {
    console.error('Erro no bulk insert:', error);
    throw error;
  }
}
