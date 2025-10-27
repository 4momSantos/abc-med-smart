import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavedDataset {
  id: string;
  name: string;
  fileName: string;
  importDate: Date;
  recordCount: number;
  status: 'active' | 'archived';
  size: number;
  data?: any[];
}

export interface SavedConfig {
  id: string;
  type: 'mapping' | 'abc_rules' | 'filters' | 'ml_params';
  name: string;
  description?: string;
  createdAt: Date;
  config: any;
}

export interface AnalysisHistory {
  id: string;
  type: 'abc' | 'ml_clustering' | 'ml_anomaly' | 'statistics';
  timestamp: Date;
  itemCount: number;
  results: any;
}

interface SavedDataState {
  datasets: SavedDataset[];
  configs: SavedConfig[];
  history: AnalysisHistory[];
  isLoading: boolean;

  fetchDatasets: () => Promise<void>;
  addDataset: (dataset: Omit<SavedDataset, 'id' | 'importDate'>) => Promise<void>;
  updateDataset: (id: string, updates: Partial<SavedDataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;

  addConfig: (config: Omit<SavedConfig, 'id' | 'createdAt'>) => void;
  updateConfig: (id: string, updates: Partial<SavedConfig>) => void;
  deleteConfig: (id: string) => void;

  fetchHistory: () => Promise<void>;
  addHistory: (history: Omit<AnalysisHistory, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => void;
}

export const useSavedDataStore = create<SavedDataState>((set, get) => ({
  datasets: [],
  configs: [],
  history: [],
  isLoading: false,

  fetchDatasets: async () => {
    set({ isLoading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ datasets: [] });
        return;
      }

      const { data, error } = await supabase
        .from('saved_datasets')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const datasets = (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        fileName: d.file_name,
        importDate: new Date(d.import_date),
        recordCount: d.record_count,
        status: d.status as 'active' | 'archived',
        size: Number(d.size_bytes) || 0,
      }));

      set({ datasets });
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast.error('Erro ao carregar datasets');
    } finally {
      set({ isLoading: false });
    }
  },

  addDataset: async (dataset) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_datasets')
        .insert([
          {
            user_id: userData.user.id,
            name: dataset.name,
            file_name: dataset.fileName,
            record_count: dataset.recordCount,
            status: dataset.status,
            size_bytes: dataset.size,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newDataset: SavedDataset = {
        id: data.id,
        name: data.name,
        fileName: data.file_name,
        importDate: new Date(data.import_date),
        recordCount: data.record_count,
        status: data.status as 'active' | 'archived',
        size: Number(data.size_bytes) || 0,
      };

      set((state) => ({
        datasets: [newDataset, ...state.datasets],
      }));

      toast.success('Dataset salvo com sucesso');
    } catch (error) {
      console.error('Error adding dataset:', error);
      toast.error('Erro ao salvar dataset');
    }
  },

  updateDataset: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('saved_datasets')
        .update({
          name: updates.name,
          status: updates.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updated: SavedDataset = {
        id: data.id,
        name: data.name,
        fileName: data.file_name,
        importDate: new Date(data.import_date),
        recordCount: data.record_count,
        status: data.status as 'active' | 'archived',
        size: Number(data.size_bytes) || 0,
      };

      set((state) => ({
        datasets: state.datasets.map((d) => (d.id === id ? updated : d)),
      }));

      toast.success('Dataset atualizado com sucesso');
    } catch (error) {
      console.error('Error updating dataset:', error);
      toast.error('Erro ao atualizar dataset');
    }
  },

  deleteDataset: async (id) => {
    try {
      const { error } = await supabase.from('saved_datasets').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        datasets: state.datasets.filter((d) => d.id !== id),
      }));

      toast.success('Dataset removido com sucesso');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast.error('Erro ao remover dataset');
    }
  },

  // Configs stay in localStorage (UI preferences)
  addConfig: (config) =>
    set((state) => ({
      configs: [
        {
          ...config,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        },
        ...state.configs,
      ],
    })),

  updateConfig: (id, updates) =>
    set((state) => ({
      configs: state.configs.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteConfig: (id) =>
    set((state) => ({
      configs: state.configs.filter((c) => c.id !== id),
    })),

  fetchHistory: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ history: [] });
        return;
      }

      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const history = (data || []).map((h) => ({
        id: h.id,
        type: h.type as 'abc' | 'ml_clustering' | 'ml_anomaly' | 'statistics',
        timestamp: new Date(h.created_at),
        itemCount: h.item_count,
        results: h.results,
      }));

      set({ history });
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Erro ao carregar histórico');
    }
  },

  addHistory: async (history) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('analysis_history')
        .insert([
          {
            user_id: userData.user.id,
            type: history.type,
            item_count: history.itemCount,
            results: history.results,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newHistory: AnalysisHistory = {
        id: data.id,
        type: data.type as 'abc' | 'ml_clustering' | 'ml_anomaly' | 'statistics',
        timestamp: new Date(data.created_at),
        itemCount: data.item_count,
        results: data.results,
      };

      set((state) => ({
        history: [newHistory, ...state.history].slice(0, 100),
      }));
    } catch (error) {
      console.error('Error adding history:', error);
    }
  },

  clearHistory: () => set({ history: [] }),
}));
