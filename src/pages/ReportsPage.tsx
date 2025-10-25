import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateSelector } from '@/components/reports/TemplateSelector';
import { ReportCustomizer } from '@/components/reports/ReportCustomizer';
import { Download, FileText, Loader2, Settings } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '@/lib/reports/reportTemplates';
import { PDFReportGenerator } from '@/lib/reports/pdfGenerator';
import { ReportTemplate, ReportData } from '@/types/reports';
import { useDataStore } from '@/store/dataStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(DEFAULT_TEMPLATES[0]);
  const [customTemplate, setCustomTemplate] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('select');

  const { items } = useDataStore();
  const { period } = useSettingsStore();

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setCustomTemplate(JSON.parse(JSON.stringify(template))); // Deep clone
    setActiveTab('customize');
  };

  const handleCustomizeTemplate = (template: ReportTemplate) => {
    setCustomTemplate(template);
  };

  const calculateKPIs = () => {
    const classA = items.filter(item => item.classification === 'A');
    const classB = items.filter(item => item.classification === 'B');
    const classC = items.filter(item => item.classification === 'C');
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

    return {
      totalItems: items.length,
      totalValue,
      classA: {
        count: classA.length,
        percentage: (classA.length / items.length) * 100
      },
      classB: {
        count: classB.length,
        percentage: (classB.length / items.length) * 100
      },
      classC: {
        count: classC.length,
        percentage: (classC.length / items.length) * 100
      }
    };
  };

  const handleGenerateReport = async () => {
    if (!customTemplate) {
      toast.error('Selecione um template primeiro');
      return;
    }

    if (items.length === 0) {
      toast.error('Não há dados para gerar o relatório. Importe dados primeiro.');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare report data
      const reportData: ReportData = {
        items: items.filter(item => {
          // Apply filters
          if (customTemplate.filters.abcClasses && customTemplate.filters.abcClasses.length > 0) {
            if (!customTemplate.filters.abcClasses.includes(item.classification!)) {
              return false;
            }
          }
          return true;
        }),
        kpis: calculateKPIs(),
        period: {
          start: period.startDate,
          end: period.endDate
        }
      };

      // Generate PDF
      const generator = new PDFReportGenerator(customTemplate, reportData);
      const pdf = await generator.generate();

      // Download
      const filename = `${customTemplate.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      generator.download(filename);

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Gere relatórios PDF personalizados com análises e insights
          </p>
        </div>
        
        {customTemplate && (
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating || items.length === 0}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Gerar PDF
              </>
            )}
          </Button>
        )}
      </div>

      {items.length === 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Você precisa importar dados antes de gerar relatórios. Vá para a página de{' '}
                <a href="/import" className="underline font-medium">Importar Dados</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select" className="gap-2">
            <FileText className="w-4 h-4" />
            Selecionar Template
          </TabsTrigger>
          <TabsTrigger value="customize" className="gap-2" disabled={!selectedTemplate}>
            <Settings className="w-4 h-4" />
            Personalizar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Templates Disponíveis</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha um template pré-configurado para começar
              </p>
            </div>
            <TemplateSelector
              templates={DEFAULT_TEMPLATES}
              selectedTemplate={selectedTemplate}
              onSelect={handleSelectTemplate}
            />
          </div>
        </TabsContent>

        <TabsContent value="customize" className="mt-6">
          {customTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReportCustomizer
                  template={customTemplate}
                  onChange={handleCustomizeTemplate}
                />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preview</CardTitle>
                    <CardDescription>Informações do relatório</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template:</span>
                        <span className="font-medium">{customTemplate.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seções:</span>
                        <span className="font-medium">{customTemplate.sections.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Orientação:</span>
                        <span className="font-medium">
                          {customTemplate.layout.orientation === 'portrait' ? 'Retrato' : 'Paisagem'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Formato:</span>
                        <span className="font-medium">{customTemplate.layout.pageSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Itens:</span>
                        <span className="font-medium">{items.length}</span>
                      </div>
                    </div>

                    {/* Hidden chart container for PDF generation */}
                    <div id="abc-chart-container" className="hidden">
                      {/* Chart will be rendered here when generating PDF */}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Personalize cores e título para combinar com sua marca</li>
                      <li>• Use filtros para focar em dados específicos</li>
                      <li>• Modo paisagem oferece mais espaço para tabelas</li>
                      <li>• PDFs são gerados instantaneamente</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
