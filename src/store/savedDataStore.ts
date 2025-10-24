import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  addDataset: (dataset: Omit<SavedDataset, 'id' | 'importDate'>) => void;
  updateDataset: (id: string, updates: Partial<SavedDataset>) => void;
  deleteDataset: (id: string) => void;
  
  addConfig: (config: Omit<SavedConfig, 'id' | 'createdAt'>) => void;
  updateConfig: (id: string, updates: Partial<SavedConfig>) => void;
  deleteConfig: (id: string) => void;
  
  addHistory: (history: Omit<AnalysisHistory, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useSavedDataStore = create<SavedDataState>()(
  persist(
    (set) => ({
      datasets: [],
      configs: [],
      history: [],
      
      addDataset: (dataset) => set((state) => ({
        datasets: [
          {
            ...dataset,
            id: Math.random().toString(36).slice(2),
            importDate: new Date(),
          },
          ...state.datasets,
        ],
      })),
      
      updateDataset: (id, updates) => set((state) => ({
        datasets: state.datasets.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      })),
      
      deleteDataset: (id) => set((state) => ({
        datasets: state.datasets.filter((d) => d.id !== id),
      })),
      
      addConfig: (config) => set((state) => ({
        configs: [
          {
            ...config,
            id: Math.random().toString(36).slice(2),
            createdAt: new Date(),
          },
          ...state.configs,
        ],
      })),
      
      updateConfig: (id, updates) => set((state) => ({
        configs: state.configs.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      deleteConfig: (id) => set((state) => ({
        configs: state.configs.filter((c) => c.id !== id),
      })),
      
      addHistory: (history) => set((state) => ({
        history: [
          {
            ...history,
            id: Math.random().toString(36).slice(2),
            timestamp: new Date(),
          },
          ...state.history,
        ].slice(0, 100), // Keep only last 100
      })),
      
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'saved-data-storage',
    }
  )
);
