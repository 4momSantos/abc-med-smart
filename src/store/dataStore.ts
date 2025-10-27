import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MedicineItem } from '@/types/medicine';
import { ABCConfiguration } from '@/types/abc';
import { recalculateABCInPlace } from '@/lib/abcCalculator';

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
  recalculateABC: (config: ABCConfiguration) => void;
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
      
      recalculateABC: (config) => {
        const { items } = get();
        if (items.length === 0) return;
        
        const recalculatedItems = recalculateABCInPlace(items, config);
        set({ items: recalculatedItems, filteredItems: recalculatedItems });
        get().applyFilters();
      },
    }),
    {
      name: 'data-storage',
      // Não persistir filteredItems para economizar espaço no LocalStorage
      partialize: (state) => ({ 
        items: state.items,
        activeFilters: state.activeFilters,
      }),
      // Recalcular filteredItems ao carregar do LocalStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Inicializar filteredItems com todos os items
          state.filteredItems = state.items || [];
          
          // Reaplicar filtros se existirem
          if (state.activeFilters && Object.keys(state.activeFilters).length > 0) {
            let filtered = [...state.items];
            
            // Filtro por classe ABC
            if (state.activeFilters.classABC && state.activeFilters.classABC.length > 0) {
              filtered = filtered.filter((item) =>
                state.activeFilters.classABC!.includes(item.classification!)
              );
            }
            
            // Filtro por range de valor
            if (state.activeFilters.valueRange) {
              const [min, max] = state.activeFilters.valueRange;
              filtered = filtered.filter(
                (item) => item.totalValue >= min && item.totalValue <= max
              );
            }
            
            // Filtro de busca textual
            if (state.activeFilters.searchQuery) {
              const query = state.activeFilters.searchQuery.toLowerCase();
              filtered = filtered.filter(
                (item) =>
                  item.name.toLowerCase().includes(query) ||
                  (item.code && item.code.toLowerCase().includes(query)) ||
                  (item.supplier && item.supplier.toLowerCase().includes(query)) ||
                  item.id.toLowerCase().includes(query)
              );
            }
            
            // Filtro por categoria
            if (state.activeFilters.category) {
              filtered = filtered.filter(
                (item) => item.category === state.activeFilters.category
              );
            }
            
            // Filtro por fornecedor
            if (state.activeFilters.supplier) {
              filtered = filtered.filter(
                (item) => item.supplier === state.activeFilters.supplier
              );
            }
            
            // Filtro por setor
            if (state.activeFilters.sector) {
              filtered = filtered.filter(
                (item) => item.requestingSector === state.activeFilters.sector
              );
            }
            
            // Filtro por criticidade
            if (state.activeFilters.criticality) {
              filtered = filtered.filter(
                (item) => item.clinicalCriticality === state.activeFilters.criticality
              );
            }
            
            // Filtro por lead time
            if (state.activeFilters.leadTimeRange) {
              const [min, max] = state.activeFilters.leadTimeRange;
              filtered = filtered.filter(
                (item) => item.leadTime !== undefined && item.leadTime >= min && item.leadTime <= max
              );
            }
            
            // Filtro por status de estoque
            if (state.activeFilters.stockFilter) {
              if (state.activeFilters.stockFilter === 'needsReorder') {
                filtered = filtered.filter((item) => item.needsReorder === true);
              } else if (state.activeFilters.stockFilter === 'belowMin') {
                filtered = filtered.filter(
                  (item) => item.currentStock !== undefined && 
                           item.minStock !== undefined && 
                           item.currentStock < item.minStock
                );
              }
            }
            
            state.filteredItems = filtered;
          }
        }
      },
    }
  )
);
