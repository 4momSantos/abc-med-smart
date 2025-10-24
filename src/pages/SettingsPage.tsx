import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const {
    abcConfig,
    locale,
    currency,
    decimalPlaces,
    updateABCConfig,
    setLocale,
    setCurrency,
    setDecimalPlaces,
  } = useSettingsStore();
  const { toast } = useToast();

  const handleSaveABCConfig = () => {
    toast({
      title: 'Configurações salvas',
      description: 'As configurações da Curva ABC foram atualizadas com sucesso.',
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
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Visualização</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema (em breve)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurações de tema e paleta de cores estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
