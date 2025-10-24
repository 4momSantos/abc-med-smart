import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'text';
  chartType?: 'pareto' | 'pie' | 'bar' | 'scatter' | 'line' | 'heatmap';
  x: number;
  y: number;
  w: number;
  h: number;
  config: {
    title?: string;
    subtitle?: string;
    dataKey?: string;
    color?: string;
    [key: string]: any;
  };
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardState {
  layouts: DashboardLayout[];
  activeLayout: DashboardLayout | null;
  isEditMode: boolean;
  saveLayout: (name: string, widgets: DashboardWidget[]) => void;
  loadLayout: (id: string) => void;
  deleteLayout: (id: string) => void;
  updateLayout: (id: string, widgets: DashboardWidget[]) => void;
  setEditMode: (mode: boolean) => void;
  clearActiveLayout: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      layouts: [],
      activeLayout: null,
      isEditMode: false,
      
      saveLayout: (name, widgets) => {
        const newLayout: DashboardLayout = {
          id: Math.random().toString(36).slice(2),
          name,
          widgets,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          layouts: [...state.layouts, newLayout],
          activeLayout: newLayout,
        }));
      },
      
      loadLayout: (id) => {
        const layout = get().layouts.find((l) => l.id === id);
        if (layout) {
          set({ activeLayout: layout });
        }
      },
      
      deleteLayout: (id) => set((state) => ({
        layouts: state.layouts.filter((l) => l.id !== id),
        activeLayout: state.activeLayout?.id === id ? null : state.activeLayout,
      })),
      
      updateLayout: (id, widgets) => set((state) => ({
        layouts: state.layouts.map((l) =>
          l.id === id ? { ...l, widgets, updatedAt: new Date() } : l
        ),
        activeLayout: state.activeLayout?.id === id
          ? { ...state.activeLayout, widgets, updatedAt: new Date() }
          : state.activeLayout,
      })),
      
      setEditMode: (mode) => set({ isEditMode: mode }),
      
      clearActiveLayout: () => set({ activeLayout: null }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
