import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPreset {
  name: string;
  value: string;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hsl: string) => void;
  presets: ColorPreset[];
}

export function ColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div 
          className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
          style={{ backgroundColor: `hsl(${value})` }}
          title="Cor atual"
        />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {presets.map((preset) => {
          const isActive = value === preset.value;
          return (
            <Button
              key={preset.value}
              variant="outline"
              className={cn(
                "h-auto flex flex-col items-center gap-2 p-3 transition-all hover:scale-105",
                isActive && "ring-2 ring-primary ring-offset-2 border-primary"
              )}
              onClick={() => onChange(preset.value)}
            >
              <div
                className="w-full h-10 rounded border-2"
                style={{ backgroundColor: `hsl(${preset.value})` }}
              />
              {isActive && (
                <Check className="w-4 h-4 text-primary" />
              )}
              <span className="text-xs text-center font-medium">{preset.name}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Estas cores afetam apenas botões e elementos de interface. 
        As cores dos gráficos e classificações ABC são fixas para garantir clareza visual.
      </p>
    </div>
  );
}
