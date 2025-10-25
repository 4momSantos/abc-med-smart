import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTemplate } from '@/types/reports';
import { FileText, CheckCircle2 } from 'lucide-react';

interface TemplateSelectorProps {
  templates: ReportTemplate[];
  selectedTemplate: ReportTemplate | null;
  onSelect: (template: ReportTemplate) => void;
}

export function TemplateSelector({ templates, selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const isSelected = selectedTemplate?.id === template.id;
        
        return (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all ${
              isSelected 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelect(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: template.branding.headerColor }} />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Orientação:</span>
                  <span className="font-medium">{template.layout.orientation === 'portrait' ? 'Retrato' : 'Paisagem'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seções:</span>
                  <span className="font-medium">{template.sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Formato:</span>
                  <span className="font-medium">{template.layout.pageSize}</span>
                </div>
              </div>
              
              {isSelected && (
                <Button className="w-full mt-4" size="sm">
                  Selecionado
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
