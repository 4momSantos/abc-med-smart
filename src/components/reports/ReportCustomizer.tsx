import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ReportTemplate } from '@/types/reports';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportCustomizerProps {
  template: ReportTemplate;
  onChange: (template: ReportTemplate) => void;
}

export function ReportCustomizer({ template, onChange }: ReportCustomizerProps) {
  const updateTemplate = (updates: Partial<ReportTemplate>) => {
    onChange({ ...template, ...updates });
  };

  const updateBranding = (updates: Partial<ReportTemplate['branding']>) => {
    onChange({
      ...template,
      branding: { ...template.branding, ...updates }
    });
  };

  const updateOptions = (updates: Partial<ReportTemplate['options']>) => {
    onChange({
      ...template,
      options: { ...template.options, ...updates }
    });
  };

  const updateFilters = (updates: Partial<ReportTemplate['filters']>) => {
    onChange({
      ...template,
      filters: { ...template.filters, ...updates }
    });
  };

  const toggleABCClass = (classType: 'A' | 'B' | 'C') => {
    const current = template.filters.abcClasses || [];
    const updated = current.includes(classType)
      ? current.filter(c => c !== classType)
      : [...current, classType];
    updateFilters({ abcClasses: updated });
  };

  return (
    <div className="space-y-6">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personalização</CardTitle>
          <CardDescription>Configure o visual do relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Relatório</Label>
            <Input
              id="title"
              value={template.branding.title}
              onChange={(e) => updateBranding({ title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={template.branding.subtitle || ''}
              onChange={(e) => updateBranding({ subtitle: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headerColor">Cor do Cabeçalho</Label>
              <Input
                id="headerColor"
                type="color"
                value={template.branding.headerColor}
                onChange={(e) => updateBranding({ headerColor: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <Input
                id="accentColor"
                type="color"
                value={template.branding.accentColor}
                onChange={(e) => updateBranding({ accentColor: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros de Dados</CardTitle>
          <CardDescription>Selecione quais dados incluir no relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Classes ABC</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="classA"
                  checked={template.filters.abcClasses?.includes('A') ?? true}
                  onCheckedChange={() => toggleABCClass('A')}
                />
                <Label htmlFor="classA" className="cursor-pointer">Classe A</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="classB"
                  checked={template.filters.abcClasses?.includes('B') ?? true}
                  onCheckedChange={() => toggleABCClass('B')}
                />
                <Label htmlFor="classB" className="cursor-pointer">Classe B</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="classC"
                  checked={template.filters.abcClasses?.includes('C') ?? true}
                  onCheckedChange={() => toggleABCClass('C')}
                />
                <Label htmlFor="classC" className="cursor-pointer">Classe C</Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Período (Opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {template.filters.dateRange?.start 
                      ? format(template.filters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Data inicial'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={template.filters.dateRange?.start}
                    onSelect={(date) => updateFilters({ 
                      dateRange: { 
                        ...template.filters.dateRange, 
                        start: date || new Date() 
                      } as any
                    })}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {template.filters.dateRange?.end 
                      ? format(template.filters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Data final'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={template.filters.dateRange?.end}
                    onSelect={(date) => updateFilters({ 
                      dateRange: { 
                        ...template.filters.dateRange, 
                        end: date || new Date() 
                      } as any
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opções de Layout</CardTitle>
          <CardDescription>Configure o formato do PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientação</Label>
              <Select
                value={template.layout.orientation}
                onValueChange={(value: 'portrait' | 'landscape') => 
                  onChange({ ...template, layout: { ...template.layout, orientation: value } })
                }
              >
                <SelectTrigger id="orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Retrato</SelectItem>
                  <SelectItem value="landscape">Paisagem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSize">Tamanho</Label>
              <Select
                value={template.layout.pageSize}
                onValueChange={(value: 'A4' | 'Letter') => 
                  onChange({ ...template, layout: { ...template.layout, pageSize: value } })
                }
              >
                <SelectTrigger id="pageSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opções do Relatório</CardTitle>
          <CardDescription>Configure elementos adicionais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pageNumbers" className="cursor-pointer">Incluir números de página</Label>
            <Switch
              id="pageNumbers"
              checked={template.options.includePageNumbers}
              onCheckedChange={(checked) => updateOptions({ includePageNumbers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="timestamp" className="cursor-pointer">Incluir data/hora de geração</Label>
            <Switch
              id="timestamp"
              checked={template.options.includeTimestamp}
              onCheckedChange={(checked) => updateOptions({ includeTimestamp: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="footer" className="cursor-pointer">Incluir rodapé</Label>
            <Switch
              id="footer"
              checked={template.options.includeFooter}
              onCheckedChange={(checked) => updateOptions({ includeFooter: checked })}
            />
          </div>

          {template.options.includeFooter && (
            <div className="space-y-2">
              <Label htmlFor="footerText">Texto do rodapé</Label>
              <Input
                id="footerText"
                value={template.options.footerText || ''}
                onChange={(e) => updateOptions({ footerText: e.target.value })}
                placeholder="Texto personalizado para o rodapé"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
