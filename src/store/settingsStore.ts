import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ABCConfiguration, AnalysisPeriod } from '@/types/abc';

interface SettingsState {
  abcConfig: ABCConfiguration;
  period: AnalysisPeriod;
  locale: 'pt-BR' | 'en-US' | 'es-ES';
  currency: string;
  decimalPlaces: number;
  updateABCConfig: (config: Partial<ABCConfiguration>) => void;
  setPeriod: (period: AnalysisPeriod) => void;
  setLocale: (locale: 'pt-BR' | 'en-US' | 'es-ES') => void;
  setCurrency: (currency: string) => void;
  setDecimalPlaces: (places: number) => void;
}

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
      
      updateABCConfig: (config) =>
        set((state) => ({
          abcConfig: { ...state.abcConfig, ...config },
        })),
      
      setPeriod: (period) => set({ period }),
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setDecimalPlaces: (places) => set({ decimalPlaces: places }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
