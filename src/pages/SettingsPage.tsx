import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { ThemeToggleCard } from '@/components/settings/ThemeToggleCard';
import { PRIMARY_COLOR_PRESETS, ACCENT_COLOR_PRESETS } from '@/lib/themeUtils';
import { applyVisualPreferences } from '@/lib/themeUtils';

export default function SettingsPage() {
  const {
    abcConfig,
    locale,
    currency,
    decimalPlaces,
    visualPreferences,
    updateABCConfig,
    setLocale,
    setCurrency,
    setDecimalPlaces,
    updateVisualPreferences,
    resetVisualPreferences,
  } = useSettingsStore();
  const { toast } = useToast();

  const handleSaveABCConfig = () => {
    toast({
      title: 'Configurações salvas',
      description: 'As configurações da Curva ABC foram atualizadas com sucesso.',
    });
  };

  const handleApplyVisualPreferences = () => {
    applyVisualPreferences(visualPreferences);
    toast({
      title: 'Preferências aplicadas',
      description: 'As preferências de visualização foram atualizadas.',
    });
  };

  const handleResetVisualPreferences = () => {
    resetVisualPreferences();
    setTimeout(() => {
      applyVisualPreferences(useSettingsStore.getState().visualPreferences);
    }, 0);
    toast({
      title: 'Preferências restauradas',
      description: 'As configurações padrão foram restauradas.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Personalize o sistema de acordo com suas necessidades
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Gerais</TabsTrigger>
          <TabsTrigger value="abc">Curva ABC</TabsTrigger>
          <TabsTrigger value="display">Visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure idioma, moeda e formatos numéricos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locale">Idioma</Label>
                <Select value={locale} onValueChange={(value: any) => setLocale(value)}>
                  <SelectTrigger id="locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimals">Casas Decimais</Label>
                <Input
                  id="decimals"
                  type="number"
                  min="0"
                  max="4"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros da Curva ABC</CardTitle>
              <CardDescription>
                Defina os percentuais para classificação ABC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classA">Limite Classe A (%)</Label>
                <Input
                  id="classA"
                  type="number"
                  min="0"
                  max="100"
                  value={abcConfig.classAThreshold}
                  onChange={(e) =>
                    updateABCConfig({ classAThreshold: parseFloat(e.target.value) })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Itens que representam até {abcConfig.classAThreshold}% do valor acumulado são
                  classificados como Classe A
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classB">Limite Classe B (%)</Label>
                <Input
                  id="classB"
                  type="number"
                  min="0"
                  max="100"
                  value={abcConfig.classBThreshold}
                  onChange={(e) =>
                    updateABCConfig({ classBThreshold: parseFloat(e.target.value) })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Itens entre {abcConfig.classAThreshold}% e {abcConfig.classBThreshold}% do
                  valor acumulado são Classe B. Acima de {abcConfig.classBThreshold}% são Classe
                  C.
                </p>
              </div>

              <Button onClick={handleSaveABCConfig} className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          {/* Card 1: Tema */}
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>
                Escolha entre modo claro, escuro ou automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ThemeToggleCard theme="light" />
                <ThemeToggleCard theme="dark" />
                <ThemeToggleCard theme="system" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Cores */}
          <Card>
            <CardHeader>
              <CardTitle>Paleta de Cores</CardTitle>
              <CardDescription>
                Personalize as cores principais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPicker
                label="Cor Primária"
                value={visualPreferences.primaryColor}
                onChange={(color) => {
                  updateVisualPreferences({ primaryColor: color });
                  applyVisualPreferences({ ...visualPreferences, primaryColor: color });
                }}
                presets={PRIMARY_COLOR_PRESETS}
              />
              <ColorPicker
                label="Cor de Acento"
                value={visualPreferences.accentColor}
                onChange={(color) => {
                  updateVisualPreferences({ accentColor: color });
                  applyVisualPreferences({ ...visualPreferences, accentColor: color });
                }}
                presets={ACCENT_COLOR_PRESETS}
              />
            </CardContent>
          </Card>

          {/* Card 3: Layout */}
          <Card>
            <CardHeader>
              <CardTitle>Layout e Espaçamento</CardTitle>
              <CardDescription>
                Ajuste a densidade e arredondamento dos elementos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Border Radius Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Arredondamento dos Cantos</Label>
                  <span className="text-sm text-muted-foreground">
                    {visualPreferences.borderRadius}px
                  </span>
                </div>
                <Slider
                  value={[visualPreferences.borderRadius]}
                  onValueChange={([value]) => {
                    updateVisualPreferences({ borderRadius: value });
                    applyVisualPreferences({ ...visualPreferences, borderRadius: value });
                  }}
                  min={0}
                  max={20}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Quadrado</span>
                  <span>Arredondado</span>
                </div>
              </div>

              {/* Densidade */}
              <div className="space-y-2">
                <Label htmlFor="density">Densidade</Label>
                <Select
                  value={visualPreferences.density}
                  onValueChange={(value: 'compact' | 'comfortable' | 'spacious') => {
                    updateVisualPreferences({ density: value });
                    applyVisualPreferences({ ...visualPreferences, density: value });
                  }}
                >
                  <SelectTrigger id="density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compacto - Mais conteúdo na tela</SelectItem>
                    <SelectItem value="comfortable">Confortável - Equilíbrio ideal</SelectItem>
                    <SelectItem value="spacious">Espaçoso - Mais espaço para respirar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Acessibilidade */}
          <Card>
            <CardHeader>
              <CardTitle>Acessibilidade</CardTitle>
              <CardDescription>
                Opções para melhorar a legibilidade e usabilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alto Contraste</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o contraste entre elementos para melhor legibilidade
                  </p>
                </div>
                <Switch
                  checked={visualPreferences.highContrast}
                  onCheckedChange={(checked) => {
                    updateVisualPreferences({ highContrast: checked });
                    applyVisualPreferences({ ...visualPreferences, highContrast: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animações</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative ou desative transições e animações visuais
                  </p>
                </div>
                <Switch
                  checked={visualPreferences.animationsEnabled}
                  onCheckedChange={(checked) => {
                    updateVisualPreferences({ animationsEnabled: checked });
                    applyVisualPreferences({ ...visualPreferences, animationsEnabled: checked });
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button onClick={handleApplyVisualPreferences} className="flex-1">
              Aplicar Todas as Mudanças
            </Button>
            <Button onClick={handleResetVisualPreferences} variant="outline">
              Restaurar Padrão
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
