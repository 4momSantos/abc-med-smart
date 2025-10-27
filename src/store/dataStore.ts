import { create } from 'zustand';
import { MedicineItem } from '@/types/medicine';
import { ABCConfiguration } from '@/types/abc';
import { recalculateABCInPlace } from '@/lib/abcCalculator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (data || []).map((item) => ({
        ...item,
        unitPrice: Number(item.unit_price),
        totalValue: Number(item.total_value),
        expirationDate: item.expiration_date ? new Date(item.expiration_date) : undefined,
        movementDate: item.movement_date ? new Date(item.movement_date) : undefined,
        lastPurchaseDate: item.last_purchase_date ? new Date(item.last_purchase_date) : undefined,
      })) as MedicineItem[];

      set({ items, filteredItems: items });
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

      const { data, error } = await supabase
        .from('medicines')
        .insert([{
          ...item,
          user_id: userData.user.id,
          unit_price: item.unitPrice,
          total_value: item.totalValue,
          expiration_date: item.expirationDate?.toISOString().split('T')[0],
          movement_date: item.movementDate?.toISOString(),
          last_purchase_date: item.lastPurchaseDate?.toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;

      const newItem = {
        ...data,
        unitPrice: Number(data.unit_price),
        totalValue: Number(data.total_value),
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        movementDate: data.movement_date ? new Date(data.movement_date) : undefined,
        lastPurchaseDate: data.last_purchase_date ? new Date(data.last_purchase_date) : undefined,
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
      const updateData: any = { ...updatedItem };
      
      if (updatedItem.unitPrice !== undefined) updateData.unit_price = updatedItem.unitPrice;
      if (updatedItem.totalValue !== undefined) updateData.total_value = updatedItem.totalValue;
      if (updatedItem.expirationDate !== undefined) updateData.expiration_date = updatedItem.expirationDate?.toISOString().split('T')[0];
      if (updatedItem.movementDate !== undefined) updateData.movement_date = updatedItem.movementDate?.toISOString();
      if (updatedItem.lastPurchaseDate !== undefined) updateData.last_purchase_date = updatedItem.lastPurchaseDate?.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('medicines')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updated = {
        ...data,
        unitPrice: Number(data.unit_price),
        totalValue: Number(data.total_value),
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        movementDate: data.movement_date ? new Date(data.movement_date) : undefined,
        lastPurchaseDate: data.last_purchase_date ? new Date(data.last_purchase_date) : undefined,
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
