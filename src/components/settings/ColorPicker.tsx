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
      <Label>{label}</Label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {presets.map((preset) => {
          const isActive = value === preset.value;
          return (
            <Button
              key={preset.value}
              variant="outline"
              className={cn(
                "h-auto flex flex-col items-center gap-2 p-3 transition-all",
                isActive && "border-primary border-2 bg-primary/5"
              )}
              onClick={() => onChange(preset.value)}
            >
              <div
                className="w-full h-8 rounded border"
                style={{ backgroundColor: `hsl(${preset.value})` }}
              />
              {isActive && (
                <Check className="w-4 h-4 text-primary" />
              )}
              <span className="text-xs text-center">{preset.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
