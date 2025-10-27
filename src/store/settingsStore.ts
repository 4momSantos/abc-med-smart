import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ABCConfiguration, AnalysisPeriod } from '@/types/abc';
import { useDataStore } from './dataStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  isLoadingConfig: boolean;
  
  fetchABCConfig: () => Promise<void>;
  updateABCConfig: (config: Partial<ABCConfiguration>) => Promise<void>;
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

const defaultABCConfig: ABCConfiguration = {
  classAThreshold: 80,
  classBThreshold: 95,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      abcConfig: defaultABCConfig,
      period: {
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(),
      },
      locale: 'pt-BR',
      currency: 'BRL',
      decimalPlaces: 2,
      visualPreferences: defaultVisualPreferences,
      isLoadingConfig: false,

      fetchABCConfig: async () => {
        set({ isLoadingConfig: true });
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) {
            set({ abcConfig: defaultABCConfig });
            return;
          }

          const { data, error } = await supabase
            .from('abc_configurations')
            .select('*')
            .eq('user_id', userData.user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') throw error;

          if (data) {
            set({
              abcConfig: {
                classAThreshold: Number(data.class_a_threshold),
                classBThreshold: Number(data.class_b_threshold),
              },
            });
          } else {
            // Get user's active organization
            const { data: orgId } = await supabase
              .rpc('get_user_active_org', { _user_id: userData.user.id });

            if (!orgId) throw new Error('No active organization');

            // Create default config for user
            const { error: insertError } = await supabase
              .from('abc_configurations')
              .insert([{
                user_id: userData.user.id,
                organization_id: orgId,
                class_a_threshold: defaultABCConfig.classAThreshold,
                class_b_threshold: defaultABCConfig.classBThreshold,
              }]);

            if (insertError) throw insertError;
            set({ abcConfig: defaultABCConfig });
          }
        } catch (error) {
          console.error('Error fetching ABC config:', error);
          set({ abcConfig: defaultABCConfig });
        } finally {
          set({ isLoadingConfig: false });
        }
      },

      updateABCConfig: async (config) => {
        const newConfig = { ...get().abcConfig, ...config };
        
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) throw new Error('User not authenticated');

          // Get user's active organization
          const { data: orgId } = await supabase
            .rpc('get_user_active_org', { _user_id: userData.user.id });

          if (!orgId) throw new Error('No active organization');

          const { error } = await supabase
            .from('abc_configurations')
            .upsert({
              user_id: userData.user.id,
              organization_id: orgId,
              class_a_threshold: newConfig.classAThreshold,
              class_b_threshold: newConfig.classBThreshold,
            })
            .eq('user_id', userData.user.id)
            .eq('organization_id', orgId);

          if (error) throw error;

          set({ abcConfig: newConfig });
          
          // Recalculate ABC for all items
          setTimeout(() => {
            useDataStore.getState().recalculateABC(newConfig);
          }, 0);

          toast.success('Configuração ABC atualizada');
        } catch (error) {
          console.error('Error updating ABC config:', error);
          toast.error('Erro ao atualizar configuração ABC');
        }
      },

      setPeriod: (period) => set({ period }),
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setDecimalPlaces: (places) => set({ decimalPlaces: places }),

      updateVisualPreferences: (prefs) =>
        set((state) => ({
          visualPreferences: { ...state.visualPreferences, ...prefs },
        })),

      resetVisualPreferences: () => set({ visualPreferences: defaultVisualPreferences }),
    }),
    {
      name: 'settings-storage',
      // Only persist visual preferences and period
      partialize: (state) => ({
        period: state.period,
        locale: state.locale,
        currency: state.currency,
        decimalPlaces: state.decimalPlaces,
        visualPreferences: state.visualPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.period) {
          try {
            const startDate =
              state.period.startDate instanceof Date
                ? state.period.startDate
                : new Date(state.period.startDate);

            const endDate =
              state.period.endDate instanceof Date
                ? state.period.endDate
                : new Date(state.period.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              const now = new Date();
              state.period = {
                startDate: new Date(now.getFullYear(), 0, 1),
                endDate: now,
              };
            } else {
              state.period = { startDate, endDate };
            }
          } catch (error) {
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
