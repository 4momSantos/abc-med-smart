import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MedicineItem } from '@/components/MedicineForm';

interface FilterConfig {
  classABC?: ('A' | 'B' | 'C')[];
  valueRange?: [number, number];
  category?: string[];
  searchQuery?: string;
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
        
        if (activeFilters.classABC && activeFilters.classABC.length > 0) {
          filtered = filtered.filter((item) =>
            activeFilters.classABC!.includes(item.classification)
          );
        }
        
        if (activeFilters.valueRange) {
          const [min, max] = activeFilters.valueRange;
          filtered = filtered.filter(
            (item) => item.totalValue >= min && item.totalValue <= max
          );
        }
        
        if (activeFilters.searchQuery) {
          const query = activeFilters.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              item.id.toLowerCase().includes(query)
          );
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
