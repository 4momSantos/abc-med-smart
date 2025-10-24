import { create } from 'zustand';
import { AnomalyResult, ClusterResult } from '@/types/ml';

interface MLState {
  anomalies: AnomalyResult[];
  clusters: ClusterResult[];
  isTraining: boolean;
  setAnomalies: (anomalies: AnomalyResult[]) => void;
  setClusters: (clusters: ClusterResult[]) => void;
  setIsTraining: (training: boolean) => void;
  clearResults: () => void;
}

export const useMLStore = create<MLState>((set) => ({
  anomalies: [],
  clusters: [],
  isTraining: false,
  
  setAnomalies: (anomalies) => set({ anomalies }),
  setClusters: (clusters) => set({ clusters }),
  setIsTraining: (training) => set({ isTraining: training }),
  
  clearResults: () => set({ anomalies: [], clusters: [] }),
}));
