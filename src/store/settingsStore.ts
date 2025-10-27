import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ABCConfiguration, AnalysisPeriod } from '@/types/abc';
import { useDataStore } from './dataStore';

export interface VisualPreferences {
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  density: 'compact' | 'comfortable' | 'spacious';
  highContrast: boolean;
  animationsEnabled: boolean;
}

interface SettingsState {
  abcConfig: ABCConfiguration;
  period: AnalysisPeriod;
  locale: 'pt-BR' | 'en-US' | 'es-ES';
  currency: string;
  decimalPlaces: number;
  visualPreferences: VisualPreferences;
  updateABCConfig: (config: Partial<ABCConfiguration>) => void;
  setPeriod: (period: AnalysisPeriod) => void;
  setLocale: (locale: 'pt-BR' | 'en-US' | 'es-ES') => void;
  setCurrency: (currency: string) => void;
  setDecimalPlaces: (places: number) => void;
  updateVisualPreferences: (prefs: Partial<VisualPreferences>) => void;
  resetVisualPreferences: () => void;
}

const defaultVisualPreferences: VisualPreferences = {
  primaryColor: '210 100% 45%',
  accentColor: '210 100% 50%',
  borderRadius: 12,
  density: 'comfortable',
  highContrast: false,
  animationsEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      abcConfig: {
        classAThreshold: 80,
        classBThreshold: 95,
      },
      period: {
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(),
      },
      locale: 'pt-BR',
      currency: 'BRL',
      decimalPlaces: 2,
      visualPreferences: defaultVisualPreferences,
      
      updateABCConfig: (config) => {
        set((state) => {
          const newConfig = { ...state.abcConfig, ...config };
          
          // Recalcular ABC em todos os itens do dataStore
          setTimeout(() => {
            useDataStore.getState().recalculateABC(newConfig);
          }, 0);
          
          return { abcConfig: newConfig };
        });
      },
      
      setPeriod: (period) => set({ period }),
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setDecimalPlaces: (places) => set({ decimalPlaces: places }),
      
      updateVisualPreferences: (prefs) =>
        set((state) => ({
          visualPreferences: { ...state.visualPreferences, ...prefs },
        })),
      
      resetVisualPreferences: () =>
        set({ visualPreferences: defaultVisualPreferences }),
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.period) {
          try {
            const startDate = state.period.startDate instanceof Date 
              ? state.period.startDate 
              : new Date(state.period.startDate);
            
            const endDate = state.period.endDate instanceof Date 
              ? state.period.endDate 
              : new Date(state.period.endDate);
            
            // Validar se as datas são válidas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              // Fallback para datas padrão do ano atual
              const now = new Date();
              state.period = {
                startDate: new Date(now.getFullYear(), 0, 1),
                endDate: now,
              };
            } else {
              state.period = { startDate, endDate };
            }
          } catch (error) {
            // Em caso de erro, usar datas padrão do ano atual
            const now = new Date();
            state.period = {
              startDate: new Date(now.getFullYear(), 0, 1),
              endDate: now,
            };
          }
        }
      },
    }
  )
);
