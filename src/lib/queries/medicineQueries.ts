// ============================================
// src/lib/queries/medicineQueries.ts
// Camada de dados otimizada com React Query
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { MedicineItem } from '@/types/medicine'
import { toast } from 'sonner'
import { calculateABCClassification } from '@/lib/abcCalculator'

// ============================================
// TYPES
// ============================================

interface DBMedicine {
  id: string
  organization_id: string
  user_id: string
  code: string | null
  name: string
  description?: string | null
  quantity: number
  unit_price: number
  total_value: number
  classification: 'A' | 'B' | 'C' | null
  percentage?: number
  accumulated_percentage?: number
  extra_data: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface MedicineKPIs {
  total_items: number
  class_a_count: number
  class_b_count: number
  class_c_count: number
  total_value: number
  class_a_value: number
  class_b_value: number
  class_c_value: number
  avg_price: number
  max_price: number
  min_price: number
  median_price: number
  last_updated: string
}

// ============================================
// MAPPERS (DB ↔ Frontend)
// ============================================

function mapDBToMedicine(db: any): MedicineItem {
  const extra = db.extra_data || {};
  
  return {
    id: db.id,
    code: db.code || undefined,
    name: db.name,
    quantity: db.quantity,
    unitPrice: db.unit_price,
    totalValue: db.total_value,
    classification: db.classification || undefined,
    percentage: db.percentage,
    accumulatedPercentage: db.accumulated_percentage,
    cumulativePercentage: db.accumulated_percentage,
    valuePercentage: db.percentage,
    
    // Desempacotar extra_data
    unit: extra.unit,
    clinicalCriticality: extra.clinical_criticality,
    category: extra.category,
    subcategory: extra.subcategory,
    supplier: extra.supplier,
    leadTime: extra.lead_time,
    minStock: extra.min_stock,
    currentStock: extra.current_stock,
    reorderPoint: extra.reorder_point,
    batch: extra.batch,
    expirationDate: extra.expiration_date ? new Date(extra.expiration_date) : undefined,
    totalCost: extra.total_cost,
    stockValue: extra.stock_value,
    profitMargin: extra.profit_margin,
    discount: extra.discount,
    tax: extra.tax,
    movementDate: extra.movement_date ? new Date(extra.movement_date) : undefined,
    month: extra.month,
    year: extra.year,
    lastPurchaseDate: extra.last_purchase_date ? new Date(extra.last_purchase_date) : undefined,
    consumptionFrequency: extra.consumption_frequency,
    therapeuticIndication: extra.therapeutic_indication,
    activeIngredient: extra.active_ingredient,
    administrationRoute: extra.administration_route,
    specialControl: extra.special_control,
    storageTemperature: extra.storage_temperature,
    seasonality: extra.seasonality,
    trend: extra.trend,
    volatility: extra.volatility,
    stockoutRate: extra.stockout_rate,
    requestingSector: extra.requesting_sector,
    costCenter: extra.cost_center,
    movementType: extra.movement_type,
    invoiceNumber: extra.invoice_number,
    responsible: extra.responsible,
    needsReorder: extra.needs_reorder,
  };
}

function mapMedicineToDB(
  medicine: Partial<MedicineItem>, 
  orgId: string, 
  userId: string
): any {
  return {
    organization_id: orgId,
    user_id: userId,
    code: medicine.code,
    name: medicine.name!,
    quantity: medicine.quantity!,
    unit_price: medicine.unitPrice!,
    
    // Empacotar extra_data
    extra_data: {
      unit: medicine.unit,
      clinical_criticality: medicine.clinicalCriticality,
      category: medicine.category,
      subcategory: medicine.subcategory,
      supplier: medicine.supplier,
      lead_time: medicine.leadTime,
      min_stock: medicine.minStock,
      current_stock: medicine.currentStock,
      reorder_point: medicine.reorderPoint,
      batch: medicine.batch,
      expiration_date: medicine.expirationDate?.toISOString().split('T')[0],
      total_cost: medicine.totalCost,
      stock_value: medicine.stockValue,
      profit_margin: medicine.profitMargin,
      discount: medicine.discount,
      tax: medicine.tax,
      movement_date: medicine.movementDate?.toISOString(),
      month: medicine.month,
      year: medicine.year,
      last_purchase_date: medicine.lastPurchaseDate?.toISOString().split('T')[0],
      consumption_frequency: medicine.consumptionFrequency,
      therapeutic_indication: medicine.therapeuticIndication,
      active_ingredient: medicine.activeIngredient,
      administration_route: medicine.administrationRoute,
      special_control: medicine.specialControl,
      storage_temperature: medicine.storageTemperature,
      seasonality: medicine.seasonality,
      trend: medicine.trend,
      volatility: medicine.volatility,
      stockout_rate: medicine.stockoutRate,
      requesting_sector: medicine.requestingSector,
      cost_center: medicine.costCenter,
      movement_type: medicine.movementType,
      invoice_number: medicine.invoiceNumber,
      responsible: medicine.responsible,
      needs_reorder: medicine.needsReorder,
    }
  };
}

// ============================================
// QUERY KEYS (Centralizados)
// ============================================

export const medicineKeys = {
  all: ['medicines'] as const,
  lists: () => [...medicineKeys.all, 'list'] as const,
  list: (orgId: string, filters?: any) => [...medicineKeys.lists(), orgId, filters] as const,
  details: () => [...medicineKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicineKeys.details(), id] as const,
  kpis: (orgId: string) => [...medicineKeys.all, 'kpis', orgId] as const,
  search: (orgId: string, term: string) => [...medicineKeys.all, 'search', orgId, term] as const
}

// ============================================
// HOOKS: QUERIES
// ============================================

/**
 * Busca todos os medicamentos de uma organização
 * Cache: 2 minutos | Persiste no localStorage
 */
export function useMedicines(organizationId: string | undefined) {
  return useQuery({
    queryKey: medicineKeys.list(organizationId || ''),
    queryFn: async () => {
      if (!organizationId) return []

      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('total_value', { ascending: false })

      if (error) throw error

      return data.map(mapDBToMedicine)
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    enabled: !!organizationId
  })
}

/**
 * Busca KPIs pré-calculados (ultra rápido)
 * Cache: 1 minuto | Auto-refresh
 */
export function useMedicineKPIs(organizationId: string | undefined) {
  return useQuery({
    queryKey: medicineKeys.kpis(organizationId || ''),
    queryFn: async () => {
      if (!organizationId) return null

      const { data, error } = await supabase
        .from('medicine_kpis')
        .select('*')
        .eq('organization_id', organizationId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            total_items: 0,
            class_a_count: 0,
            class_b_count: 0,
            class_c_count: 0,
            total_value: 0,
            class_a_value: 0,
            class_b_value: 0,
            class_c_value: 0,
            avg_price: 0,
            max_price: 0,
            min_price: 0,
            median_price: 0,
            last_updated: new Date().toISOString()
          } as MedicineKPIs
        }
        throw error
      }

      return data as MedicineKPIs
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: !!organizationId
  })
}

/**
 * Busca inteligente com full-text search
 * Cache: 30 segundos | Debounced
 */
export function useSearchMedicines(organizationId: string | undefined, searchTerm: string) {
  return useQuery({
    queryKey: medicineKeys.search(organizationId || '', searchTerm),
    queryFn: async () => {
      if (!organizationId || !searchTerm || searchTerm.length < 2) {
        return []
      }

      const { data, error } = await supabase
        .rpc('search_medicines', {
          org_id: organizationId,
          search_term: searchTerm,
          limit_results: 50
        })

      if (error) throw error

      return data.map(mapDBToMedicine)
    },
    staleTime: 30 * 1000,
    enabled: !!organizationId && searchTerm.length >= 2
  })
}

// ============================================
// HOOKS: MUTATIONS
// ============================================

/**
 * Adiciona um novo medicamento
 * Com atualização otimista
 */
export function useAddMedicine(organizationId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (medicine: Partial<MedicineItem>) => {
      if (!organizationId) throw new Error('Organização não definida')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('medicines')
        .insert([mapMedicineToDB(medicine, organizationId, user.id)])
        .select()
        .single()

      if (error) throw error

      return mapDBToMedicine(data)
    },

    onSuccess: () => {
      toast.success('Medicamento adicionado!')
    },

    onError: () => {
      toast.error('Erro ao adicionar medicamento')
    },

    onSettled: () => {
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: medicineKeys.list(organizationId) })
        queryClient.invalidateQueries({ queryKey: medicineKeys.kpis(organizationId) })
      }
    }
  })
}

/**
 * Atualiza um medicamento existente
 */
export function useUpdateMedicine(organizationId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MedicineItem> }) => {
      if (!organizationId) throw new Error('Organização não definida')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('medicines')
        .update(mapMedicineToDB(updates, organizationId, user.id))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return mapDBToMedicine(data)
    },

    onSuccess: () => {
      toast.success('Medicamento atualizado!')
    },

    onError: () => {
      toast.error('Erro ao atualizar medicamento')
    },

    onSettled: () => {
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: medicineKeys.list(organizationId) })
        queryClient.invalidateQueries({ queryKey: medicineKeys.kpis(organizationId) })
      }
    }
  })
}

/**
 * Remove medicamento (soft delete)
 */
export function useDeleteMedicine(organizationId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('soft_delete_medicine', { medicine_id: id })
      if (error) throw error
    },

    onSuccess: () => {
      toast.success('Medicamento removido!')
    },

    onError: () => {
      toast.error('Erro ao remover medicamento')
    },

    onSettled: () => {
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: medicineKeys.list(organizationId) })
        queryClient.invalidateQueries({ queryKey: medicineKeys.kpis(organizationId) })
      }
    }
  })
}

/**
 * Importação em massa (otimizada)
 */
export function useBulkImport(organizationId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (medicines: Partial<MedicineItem>[]) => {
      if (!organizationId) throw new Error('Organização não definida')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // Dividir em batches de 500
      const BATCH_SIZE = 500
      const batches: any[][] = []

      for (let i = 0; i < medicines.length; i += BATCH_SIZE) {
        batches.push(
          medicines
            .slice(i, i + BATCH_SIZE)
            .map(m => mapMedicineToDB(m, organizationId, user.id))
        )
      }

      // Processar batches em paralelo (máx 3 simultâneos)
      let totalInserted = 0

      for (let i = 0; i < batches.length; i += 3) {
        const batchGroup = batches.slice(i, i + 3)
        
        const results = await Promise.all(
          batchGroup.map(async (batch) => {
            const { data, error } = await supabase
              .from('medicines')
              .insert(batch)
              .select()

            if (error) throw error
            return data.length
          })
        )

        totalInserted += results.reduce((sum, count) => sum + count, 0)
      }

      return { totalInserted }
    },

    onSuccess: (result) => {
      toast.success(`${result.totalInserted} medicamentos importados!`)
    },

    onError: () => {
      toast.error('Erro na importação em massa')
    },

    onSettled: () => {
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: medicineKeys.list(organizationId) })
        queryClient.invalidateQueries({ queryKey: medicineKeys.kpis(organizationId) })
      }
    }
  })
}

// ============================================
// HOOK DE CONVENIÊNCIA
// ============================================

/**
 * Hook all-in-one para facilitar uso nos componentes
 */
export function useMedicineOperations(organizationId: string | undefined) {
  const medicines = useMedicines(organizationId)
  const kpis = useMedicineKPIs(organizationId)
  const addMedicine = useAddMedicine(organizationId)
  const updateMedicine = useUpdateMedicine(organizationId)
  const deleteMedicine = useDeleteMedicine(organizationId)
  const bulkImport = useBulkImport(organizationId)

  return {
    // Queries
    medicines: medicines.data ?? [],
    kpis: kpis.data,
    isLoading: medicines.isLoading || kpis.isLoading,
    error: medicines.error || kpis.error,

    // Mutations
    addMedicine: addMedicine.mutateAsync,
    updateMedicine: updateMedicine.mutateAsync,
    deleteMedicine: deleteMedicine.mutateAsync,
    bulkImport: bulkImport.mutateAsync,

    // Estados de loading
    isAdding: addMedicine.isPending,
    isUpdating: updateMedicine.isPending,
    isDeleting: deleteMedicine.isPending,
    isImporting: bulkImport.isPending
  }
}
