import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleCardProps {
  theme: 'light' | 'dark' | 'system';
}

export function ThemeToggleCard({ theme }: ThemeToggleCardProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const isActive = currentTheme === theme;

  const config = {
    light: {
      icon: Sun,
      label: 'Claro',
      description: 'Tema claro',
    },
    dark: {
      icon: Moon,
      label: 'Escuro',
      description: 'Tema escuro',
    },
    system: {
      icon: Monitor,
      label: 'Automático',
      description: 'Segue o sistema',
    },
  };

  const { icon: Icon, label, description } = config[theme];

  return (
    <button
      onClick={() => setTheme(theme)}
      className={cn(
        "flex-1 flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary/50",
        isActive
          ? "border-primary bg-primary/5"
          : "border-border"
      )}
    >
      <Icon className={cn("w-8 h-8", isActive && "text-primary")} />
      <div className="text-center">
        <div className={cn("text-sm font-medium", isActive && "text-primary")}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {description}
        </div>
      </div>
    </button>
  );
}
