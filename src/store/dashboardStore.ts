import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  isLoading: boolean;

  fetchLayouts: () => Promise<void>;
  saveLayout: (name: string, widgets: DashboardWidget[]) => Promise<void>;
  loadLayout: (id: string) => void;
  deleteLayout: (id: string) => Promise<void>;
  updateLayout: (id: string, widgets: DashboardWidget[]) => Promise<void>;
  setEditMode: (mode: boolean) => void;
  clearActiveLayout: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  layouts: [],
  activeLayout: null,
  isEditMode: false,
  isLoading: false,

  fetchLayouts: async () => {
    set({ isLoading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ layouts: [] });
        return;
      }

      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const layouts = (data || []).map((layout) => ({
        id: layout.id,
        name: layout.name,
        widgets: (layout.widgets as any) as DashboardWidget[],
        createdAt: new Date(layout.created_at),
        updatedAt: new Date(layout.updated_at),
      }));

      set({ layouts });
    } catch (error) {
      console.error('Error fetching layouts:', error);
      toast.error('Erro ao carregar layouts');
    } finally {
      set({ isLoading: false });
    }
  },

  saveLayout: async (name, widgets) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Get user's active organization
      const { data: orgId } = await supabase
        .rpc('get_user_active_org', { _user_id: userData.user.id });

      if (!orgId) throw new Error('No active organization');

      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert([
          {
            user_id: userData.user.id,
            organization_id: orgId,
            name,
            widgets: widgets as any,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newLayout: DashboardLayout = {
        id: data.id,
        name: data.name,
        widgets: (data.widgets as any) as DashboardWidget[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set((state) => ({
        layouts: [newLayout, ...state.layouts],
        activeLayout: newLayout,
      }));

      toast.success('Layout salvo com sucesso');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Erro ao salvar layout');
    }
  },

  loadLayout: (id) => {
    const layout = get().layouts.find((l) => l.id === id);
    if (layout) {
      set({ activeLayout: layout });
    }
  },

  deleteLayout: async (id) => {
    try {
      const { error } = await supabase.from('dashboard_layouts').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        layouts: state.layouts.filter((l) => l.id !== id),
        activeLayout: state.activeLayout?.id === id ? null : state.activeLayout,
      }));

      toast.success('Layout removido com sucesso');
    } catch (error) {
      console.error('Error deleting layout:', error);
      toast.error('Erro ao remover layout');
    }
  },

  updateLayout: async (id, widgets) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .update({ widgets: widgets as any })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updated: DashboardLayout = {
        id: data.id,
        name: data.name,
        widgets: (data.widgets as any) as DashboardWidget[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set((state) => ({
        layouts: state.layouts.map((l) => (l.id === id ? updated : l)),
        activeLayout: state.activeLayout?.id === id ? updated : state.activeLayout,
      }));

      toast.success('Layout atualizado com sucesso');
    } catch (error) {
      console.error('Error updating layout:', error);
      toast.error('Erro ao atualizar layout');
    }
  },

  setEditMode: (mode) => set({ isEditMode: mode }),

  clearActiveLayout: () => set({ activeLayout: null }),
}));
