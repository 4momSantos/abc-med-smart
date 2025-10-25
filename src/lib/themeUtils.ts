import { VisualPreferences } from '@/store/settingsStore';

export function applyVisualPreferences(preferences: VisualPreferences) {
  const root = document.documentElement;

  // Apply primary color
  root.style.setProperty('--primary', preferences.primaryColor);
  root.style.setProperty('--ring', preferences.primaryColor);
  
  // Apply accent color
  root.style.setProperty('--accent', preferences.accentColor);

  // Apply border-radius
  root.style.setProperty('--radius', `${preferences.borderRadius / 16}rem`);

  // Apply density
  root.classList.remove('density-compact', 'density-spacious');
  if (preferences.density === 'compact') {
    root.classList.add('density-compact');
  } else if (preferences.density === 'spacious') {
    root.classList.add('density-spacious');
  }

  // Apply high contrast
  if (preferences.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Apply animations toggle
  if (!preferences.animationsEnabled) {
    root.classList.add('no-animations');
  } else {
    root.classList.remove('no-animations');
  }
}

export const PRIMARY_COLOR_PRESETS = [
  { name: 'Azul', value: '210 100% 45%' },
  { name: 'Verde', value: '142 76% 36%' },
  { name: 'Roxo', value: '271 91% 65%' },
  { name: 'Laranja', value: '25 95% 53%' },
  { name: 'Vermelho', value: '0 84% 60%' },
  { name: 'Ciano', value: '199 89% 48%' },
];

export const ACCENT_COLOR_PRESETS = [
  { name: 'Azul Claro', value: '210 100% 50%' },
  { name: 'Amarelo', value: '45 93% 47%' },
  { name: 'Rosa', value: '330 81% 60%' },
  { name: 'Teal', value: '173 80% 40%' },
  { name: 'Índigo', value: '243 75% 59%' },
  { name: 'Lima', value: '84 81% 44%' },
];
