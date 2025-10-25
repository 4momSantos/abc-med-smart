import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MedicineItem } from '@/types/medicine';

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
  setItems: (items: MedicineItem[]) => void;
  addItem: (item: MedicineItem) => void;
  deleteItem: (id: string) => void;
  updateItem: (id: string, item: Partial<MedicineItem>) => void;
  setActiveFilters: (filters: FilterConfig) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      items: [],
      filteredItems: [],
      activeFilters: {},
      
      setItems: (items) => {
        set({ items, filteredItems: items });
        get().applyFilters();
      },
      
      addItem: (item) => {
        set((state) => {
          const newItems = [...state.items, item];
          return { items: newItems, filteredItems: newItems };
        });
        get().applyFilters();
      },
      
      deleteItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          return { items: newItems, filteredItems: newItems };
        });
        get().applyFilters();
      },
      
      updateItem: (id, updatedItem) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          );
          return { items: newItems, filteredItems: newItems };
        });
        get().applyFilters();
      },
      
      setActiveFilters: (filters) => {
        set({ activeFilters: filters });
        get().applyFilters();
      },
      
      applyFilters: () => {
        const { items, activeFilters } = get();
        let filtered = [...items];
        
        // Filtro por classe ABC
        if (activeFilters.classABC && activeFilters.classABC.length > 0) {
          filtered = filtered.filter((item) =>
            activeFilters.classABC!.includes(item.classification!)
          );
        }
        
        // Filtro por range de valor
        if (activeFilters.valueRange) {
          const [min, max] = activeFilters.valueRange;
          filtered = filtered.filter(
            (item) => item.totalValue >= min && item.totalValue <= max
          );
        }
        
        // Filtro de busca textual
        if (activeFilters.searchQuery) {
          const query = activeFilters.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              (item.code && item.code.toLowerCase().includes(query)) ||
              (item.supplier && item.supplier.toLowerCase().includes(query)) ||
              item.id.toLowerCase().includes(query)
          );
        }
        
        // Filtro por categoria
        if (activeFilters.category) {
          filtered = filtered.filter(
            (item) => item.category === activeFilters.category
          );
        }
        
        // Filtro por fornecedor
        if (activeFilters.supplier) {
          filtered = filtered.filter(
            (item) => item.supplier === activeFilters.supplier
          );
        }
        
        // Filtro por setor
        if (activeFilters.sector) {
          filtered = filtered.filter(
            (item) => item.requestingSector === activeFilters.sector
          );
        }
        
        // Filtro por criticidade
        if (activeFilters.criticality) {
          filtered = filtered.filter(
            (item) => item.clinicalCriticality === activeFilters.criticality
          );
        }
        
        // Filtro por lead time
        if (activeFilters.leadTimeRange) {
          const [min, max] = activeFilters.leadTimeRange;
          filtered = filtered.filter(
            (item) => item.leadTime !== undefined && item.leadTime >= min && item.leadTime <= max
          );
        }
        
        // Filtro por status de estoque
        if (activeFilters.stockFilter) {
          if (activeFilters.stockFilter === 'needsReorder') {
            filtered = filtered.filter((item) => item.needsReorder === true);
          } else if (activeFilters.stockFilter === 'belowMin') {
            filtered = filtered.filter(
              (item) => item.currentStock !== undefined && 
                       item.minStock !== undefined && 
                       item.currentStock < item.minStock
            );
          }
        }
        
        set({ filteredItems: filtered });
      },
      
      clearFilters: () => {
        set({ activeFilters: {}, filteredItems: get().items });
      },
    }),
    {
      name: 'data-storage',
    }
  )
);
