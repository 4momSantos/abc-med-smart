import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";
import { ABCConfiguration as ABCConfig } from "@/types/abc";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ABCConfigurationProps {
  config: ABCConfig;
  onChange: (config: ABCConfig) => void;
}

export const ABCConfiguration = ({ config, onChange }: ABCConfigurationProps) => {
  const handleClassAChange = (value: number[]) => {
    const newValue = value[0];
    if (newValue < config.classBThreshold) {
      onChange({ ...config, classAThreshold: newValue });
    }
  };

  const handleClassBChange = (value: number[]) => {
    const newValue = value[0];
    if (newValue > config.classAThreshold && newValue < 100) {
      onChange({ ...config, classBThreshold: newValue });
    }
  };

  const handleReset = () => {
    onChange({ classAThreshold: 80, classBThreshold: 95 });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>Configuração da Curva ABC</CardTitle>
        </div>
        <CardDescription>
          Personalize os percentuais acumulados para classificação dos itens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="classA" className="text-sm font-medium">
                  Classe A (Alta Prioridade)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Itens que representam até este percentual acumulado do valor total</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {config.classAThreshold}%
              </span>
            </div>
            <Slider
              id="classA"
              value={[config.classAThreshold]}
              onValueChange={handleClassAChange}
              min={50}
              max={config.classBThreshold - 1}
              step={1}
              className="[&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-green-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="classB" className="text-sm font-medium">
                  Classe B (Média Prioridade)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Itens entre Classe A e este percentual acumulado</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {config.classBThreshold}%
              </span>
            </div>
            <Slider
              id="classB"
              value={[config.classBThreshold]}
              onValueChange={handleClassBChange}
              min={config.classAThreshold + 1}
              max={99}
              step={1}
              className="[&_[role=slider]]:bg-yellow-600 [&_[role=slider]]:border-yellow-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  Classe C (Baixa Prioridade)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Itens restantes até 100% do valor total</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                100%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-600 dark:bg-red-400" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="w-full">
            Resetar para Padrão (80/95)
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
          <p className="font-medium">Distribuição Atual:</p>
          <p className="text-muted-foreground">
            • Classe A: 0% - {config.classAThreshold}%
          </p>
          <p className="text-muted-foreground">
            • Classe B: {config.classAThreshold}% - {config.classBThreshold}%
          </p>
          <p className="text-muted-foreground">
            • Classe C: {config.classBThreshold}% - 100%
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
