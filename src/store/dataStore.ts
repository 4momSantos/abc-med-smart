import { create } from 'zustand';
import { MedicineItem } from '@/types/medicine';
import { ABCConfiguration } from '@/types/abc';
import { recalculateABCInPlace, calculateABCClassification } from '@/lib/abcCalculator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSettingsStore } from './settingsStore';

interface FilterConfig {
  classABC?: ('A' | 'B' | 'C')[];
  valueRange?: [number, number];
  category?: string;
  searchQuery?: string;
  supplier?: string;
  sector?: string;
  leadTimeRange?: [number, number];
  stockFilter?: 'needsReorder' | 'belowMin';
  criticality?: 'alta' | 'média' | 'baixa';
}

interface DataState {
  items: MedicineItem[];
  filteredItems: MedicineItem[];
  activeFilters: FilterConfig;
  isLoading: boolean;
  
  // CRUD operations
  fetchItems: () => Promise<void>;
  setItems: (items: MedicineItem[]) => void;
  addItem: (item: Omit<MedicineItem, 'id'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, item: Partial<MedicineItem>) => Promise<void>;
  
  // Filter operations
  setActiveFilters: (filters: FilterConfig) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  
  // ABC recalculation
  recalculateABC: (config: ABCConfiguration) => void;
}

const applyFilterLogic = (items: MedicineItem[], filters: FilterConfig): MedicineItem[] => {
  let filtered = [...items];
  
  if (filters.classABC && filters.classABC.length > 0) {
    filtered = filtered.filter((item) => filters.classABC!.includes(item.classification!));
  }
  
  if (filters.valueRange) {
    const [min, max] = filters.valueRange;
    filtered = filtered.filter((item) => item.totalValue >= min && item.totalValue <= max);
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.code && item.code.toLowerCase().includes(query)) ||
        (item.supplier && item.supplier.toLowerCase().includes(query)) ||
        item.id.toLowerCase().includes(query)
    );
  }
  
  if (filters.category) {
    filtered = filtered.filter((item) => item.category === filters.category);
  }
  
  if (filters.supplier) {
    filtered = filtered.filter((item) => item.supplier === filters.supplier);
  }
  
  if (filters.sector) {
    filtered = filtered.filter((item) => item.requestingSector === filters.sector);
  }
  
  if (filters.criticality) {
    filtered = filtered.filter((item) => item.clinicalCriticality === filters.criticality);
  }
  
  if (filters.leadTimeRange) {
    const [min, max] = filters.leadTimeRange;
    filtered = filtered.filter(
      (item) => item.leadTime !== undefined && item.leadTime >= min && item.leadTime <= max
    );
  }
  
  if (filters.stockFilter) {
    if (filters.stockFilter === 'needsReorder') {
      filtered = filtered.filter((item) => item.needsReorder === true);
    } else if (filters.stockFilter === 'belowMin') {
      filtered = filtered.filter(
        (item) =>
          item.currentStock !== undefined &&
          item.minStock !== undefined &&
          item.currentStock < item.minStock
      );
    }
  }
  
  return filtered;
};

export const useDataStore = create<DataState>((set, get) => ({
  items: [],
  filteredItems: [],
  activeFilters: {},
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ items: [], filteredItems: [], isLoading: false });
        toast.error('Usuário não autenticado');
        return;
      }

      // Obter organização ativa do usuário
      const { data: orgId, error: orgError } = await supabase
        .rpc('get_user_active_org', { _user_id: user.id });

      console.log('🔍 Fetching items for organization:', orgId);

      if (orgError || !orgId) {
        console.warn('⚠️ No active organization found');
        toast.error('Nenhuma organização ativa. Selecione uma organização.');
        set({ items: [], filteredItems: [], isLoading: false });
        return;
      }

      // Buscar medicamentos com filtro de organização
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 Found items:', data?.length || 0);

      if (!data || data.length === 0) {
        toast.info('Nenhum medicamento encontrado nesta organização');
      }

      // Log detalhado dos dados reais
      console.log('=== DADOS REAIS DO BANCO ===');
      console.log('Total de itens:', data?.length || 0);
      const realTotalValue = (data || []).reduce((sum, item) => sum + Number(item.total_value), 0);
      console.log('Valor Total Real:', realTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      const realClassA = (data || []).filter(item => item.classification === 'A').length;
      const realClassB = (data || []).filter(item => item.classification === 'B').length;
      const realClassC = (data || []).filter(item => item.classification === 'C').length;
      console.log('Classe A:', realClassA, 'Classe B:', realClassB, 'Classe C:', realClassC);
      console.log('Organization ID:', orgId);
      console.log('===========================');

      // Desempacotar estrutura híbrida (campos principais + extra_data JSONB)
      const items = (data || []).map((row) => {
        const extra = (row.extra_data as any) || {};
        return {
          id: row.id,
          code: row.code,
          name: row.name,
          quantity: Number(row.quantity),
          unitPrice: Number(row.unit_price),
          totalValue: Number(row.total_value),
          classification: row.classification as 'A' | 'B' | 'C',
          // Desempacotar extra_data
          unit: extra.unit,
          category: extra.category,
          subcategory: extra.subcategory,
          supplier: extra.supplier,
          batch: extra.batch,
          expirationDate: extra.expiration_date ? new Date(extra.expiration_date) : undefined,
          percentage: extra.percentage,
          accumulatedPercentage: extra.accumulated_percentage,
          cumulativePercentage: extra.cumulative_percentage,
          valuePercentage: extra.value_percentage,
          clinicalCriticality: extra.clinical_criticality,
          requestingSector: extra.requesting_sector,
          leadTime: extra.lead_time,
          minStock: extra.min_stock,
          currentStock: extra.current_stock,
          reorderPoint: extra.reorder_point,
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
          costCenter: extra.cost_center,
          movementType: extra.movement_type,
          invoiceNumber: extra.invoice_number,
          responsible: extra.responsible,
          needsReorder: extra.needs_reorder,
        } as MedicineItem;
      });

      // IMPORTANTE: Recalcular ABC dinamicamente com a config atual
      const { abcConfig } = useSettingsStore.getState();
      const classifiedItems = calculateABCClassification(items, abcConfig);

      set({ items: classifiedItems, filteredItems: classifiedItems });
      get().applyFilters();
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Erro ao carregar medicamentos');
    } finally {
      set({ isLoading: false });
    }
  },

  setItems: (items) => {
    set({ items, filteredItems: items });
    get().applyFilters();
  },

  addItem: async (item) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Get user's active organization
      const { data: orgId } = await supabase
        .rpc('get_user_active_org', { _user_id: userData.user.id });

      if (!orgId) throw new Error('No active organization');

      const { data, error } = await supabase
        .from('medicines')
        .insert([{
          code: item.code,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_value: item.totalValue,
          classification: item.classification,
          user_id: userData.user.id,
          organization_id: orgId,
          extra_data: {
            unit: item.unit,
            category: item.category,
            subcategory: item.subcategory,
            supplier: item.supplier,
            batch: item.batch,
            expiration_date: item.expirationDate?.toISOString().split('T')[0],
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
            movement_date: item.movementDate?.toISOString(),
            month: item.month,
            year: item.year,
            last_purchase_date: item.lastPurchaseDate?.toISOString().split('T')[0],
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
          },
        }])
        .select()
        .single();

      if (error) throw error;

      const extra = (data.extra_data as any) || {};
      const newItem = {
        id: data.id,
        code: data.code,
        name: data.name,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unit_price),
        totalValue: Number(data.total_value),
        classification: data.classification as 'A' | 'B' | 'C',
        unit: extra.unit,
        category: extra.category,
        clinicalCriticality: extra.clinical_criticality,
        // ... outros campos do extra_data
      } as MedicineItem;

      set((state) => ({
        items: [newItem, ...state.items],
        filteredItems: [newItem, ...state.items],
      }));
      get().applyFilters();
      toast.success('Medicamento adicionado com sucesso');
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error('Erro ao adicionar medicamento');
    }
  },

  deleteItem: async (id) => {
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);

      if (error) throw error;

      set((state) => {
        const newItems = state.items.filter((item) => item.id !== id);
        return { items: newItems, filteredItems: newItems };
      });
      get().applyFilters();
      toast.success('Medicamento removido com sucesso');
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error('Erro ao remover medicamento');
    }
  },

  updateItem: async (id, updatedItem) => {
    try {
      // Separar campos principais de extra_data
      const updateData: any = {};
      
      // Campos principais
      if (updatedItem.code !== undefined) updateData.code = updatedItem.code;
      if (updatedItem.name !== undefined) updateData.name = updatedItem.name;
      if (updatedItem.quantity !== undefined) updateData.quantity = updatedItem.quantity;
      if (updatedItem.unitPrice !== undefined) updateData.unit_price = updatedItem.unitPrice;
      if (updatedItem.totalValue !== undefined) updateData.total_value = updatedItem.totalValue;
      if (updatedItem.classification !== undefined) updateData.classification = updatedItem.classification;
      
      // Atualizar extra_data apenas se houver campos extras
      const extraFields: any = {};
      if (updatedItem.unit !== undefined) extraFields.unit = updatedItem.unit;
      if (updatedItem.category !== undefined) extraFields.category = updatedItem.category;
      if (updatedItem.supplier !== undefined) extraFields.supplier = updatedItem.supplier;
      if (updatedItem.clinicalCriticality !== undefined) extraFields.clinical_criticality = updatedItem.clinicalCriticality;
      if (updatedItem.expirationDate !== undefined) extraFields.expiration_date = updatedItem.expirationDate?.toISOString().split('T')[0];
      
      if (Object.keys(extraFields).length > 0) {
        // Buscar extra_data atual e fazer merge
        const { data: current } = await supabase.from('medicines').select('extra_data').eq('id', id).single();
        updateData.extra_data = { ...(current?.extra_data as any || {}), ...extraFields };
      }
      
      const { data, error } = await supabase
        .from('medicines')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const extra = (data.extra_data as any) || {};
      const updated = {
        id: data.id,
        code: data.code,
        name: data.name,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unit_price),
        totalValue: Number(data.total_value),
        classification: data.classification as 'A' | 'B' | 'C',
        unit: extra.unit,
        category: extra.category,
        clinicalCriticality: extra.clinical_criticality,
        // ... outros campos
      } as MedicineItem;

      set((state) => {
        const newItems = state.items.map((item) => (item.id === id ? updated : item));
        return { items: newItems, filteredItems: newItems };
      });
      get().applyFilters();
      toast.success('Medicamento atualizado com sucesso');
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Erro ao atualizar medicamento');
    }
  },

  setActiveFilters: (filters) => {
    set({ activeFilters: filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { items, activeFilters } = get();
    const filtered = applyFilterLogic(items, activeFilters);
    set({ filteredItems: filtered });
  },

  clearFilters: () => {
    set({ activeFilters: {}, filteredItems: get().items });
  },

  recalculateABC: (config) => {
    const { items } = get();
    if (items.length === 0) return;

    const recalculatedItems = recalculateABCInPlace(items, config);
    set({ items: recalculatedItems, filteredItems: recalculatedItems });
    get().applyFilters();
  },
}));
