import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { HttpSyncConfig, Transformation, TransformationType } from '@/types/httpSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TransformationsTabProps {
  config: HttpSyncConfig;
  onChange: (config: HttpSyncConfig) => void;
}

export const TransformationsTab = ({ config, onChange }: TransformationsTabProps) => {
  const [newTransformation, setNewTransformation] = useState<Partial<Transformation>>({
    field: '',
    type: 'uppercase',
    description: '',
    params: {},
  });

  const transformationTypes: { value: TransformationType; label: string; needsParams: boolean }[] = [
    { value: 'uppercase', label: 'Maiúsculas', needsParams: false },
    { value: 'lowercase', label: 'Minúsculas', needsParams: false },
    { value: 'trim', label: 'Remover Espaços', needsParams: false },
    { value: 'parse_number', label: 'Converter para Número', needsParams: false },
    { value: 'parse_date', label: 'Converter para Data', needsParams: false },
    { value: 'multiply', label: 'Multiplicar', needsParams: true },
    { value: 'divide', label: 'Dividir', needsParams: true },
    { value: 'replace', label: 'Substituir Texto', needsParams: true },
    { value: 'concat', label: 'Concatenar', needsParams: true },
    { value: 'prefix', label: 'Adicionar Prefixo', needsParams: true },
    { value: 'format_currency', label: 'Formatar Moeda', needsParams: false },
  ];

  const addTransformation = () => {
    if (!newTransformation.field || !newTransformation.type) return;

    onChange({
      ...config,
      transformations: [
        ...config.transformations,
        newTransformation as Transformation,
      ],
    });

    setNewTransformation({
      field: '',
      type: 'uppercase',
      description: '',
      params: {},
    });
  };

  const removeTransformation = (index: number) => {
    onChange({
      ...config,
      transformations: config.transformations.filter((_, i) => i !== index),
    });
  };

  const selectedType = transformationTypes.find(t => t.value === newTransformation.type);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Transformações Aplicadas</h3>
        {config.transformations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma transformação configurada</p>
        ) : (
          <div className="space-y-2">
            {config.transformations.map((transformation, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-background">
                <div className="flex-1">
                  <p className="font-medium">{transformation.field}</p>
                  <p className="text-sm text-muted-foreground">
                    {transformationTypes.find(t => t.value === transformation.type)?.label}
                    {transformation.description && ` - ${transformation.description}`}
                  </p>
                  {transformation.params && Object.keys(transformation.params).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Params: {JSON.stringify(transformation.params)}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => removeTransformation(index)}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Adicionar Nova Transformação</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trans_field">Campo</Label>
              <Input
                id="trans_field"
                value={newTransformation.field}
                onChange={(e) => setNewTransformation({ ...newTransformation, field: e.target.value })}
                placeholder="nome_do_campo"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="trans_type">Tipo de Transformação</Label>
              <Select
                value={newTransformation.type}
                onValueChange={(value: TransformationType) => setNewTransformation({ ...newTransformation, type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transformationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="trans_desc">Descrição (opcional)</Label>
            <Input
              id="trans_desc"
              value={newTransformation.description}
              onChange={(e) => setNewTransformation({ ...newTransformation, description: e.target.value })}
              placeholder="Descreva o propósito desta transformação"
              className="mt-2"
            />
          </div>

          {selectedType?.needsParams && (
            <div>
              <Label htmlFor="trans_params">Parâmetros (JSON)</Label>
              <Textarea
                id="trans_params"
                value={JSON.stringify(newTransformation.params || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const params = JSON.parse(e.target.value);
                    setNewTransformation({ ...newTransformation, params });
                  } catch {
                    // Invalid JSON
                  }
                }}
                placeholder='{"factor": 100} ou {"search": "texto", "replace": "novo"}'
                className="mt-2 font-mono"
                rows={3}
              />
            </div>
          )}

          <Button onClick={addTransformation} disabled={!newTransformation.field}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Transformação
          </Button>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2">📚 Exemplos de Parâmetros</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Multiplicar:</strong> <code className="bg-background px-1 py-0.5 rounded">{`{"factor": 100}`}</code></li>
          <li><strong>Dividir:</strong> <code className="bg-background px-1 py-0.5 rounded">{`{"divisor": 100}`}</code></li>
          <li><strong>Substituir:</strong> <code className="bg-background px-1 py-0.5 rounded">{`{"search": "texto", "replace": "novo"}`}</code></li>
          <li><strong>Prefixo:</strong> <code className="bg-background px-1 py-0.5 rounded">{`{"prefix": "ABC-"}`}</code></li>
          <li><strong>Sufixo:</strong> <code className="bg-background px-1 py-0.5 rounded">{`{"suffix": "-XYZ"}`}</code></li>
        </ul>
      </div>
    </div>
  );
};
