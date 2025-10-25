import { useState } from 'react';
import { HttpSyncConfig } from '@/types/httpSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MappingTabProps {
  config: HttpSyncConfig;
  onChange: (config: HttpSyncConfig) => void;
  apiResponse?: any;
}

export const MappingTab = ({ config, onChange, apiResponse }: MappingTabProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const updateFieldMapping = (internal: string, external: string) => {
    onChange({
      ...config,
      data_mapping: {
        ...config.data_mapping,
        fields: {
          ...config.data_mapping.fields,
          [internal]: external,
        },
      },
    });
  };

  const fieldMappings = [
    { internal: 'codigo', label: 'Código', required: true },
    { internal: 'nome', label: 'Nome', required: true },
    { internal: 'quantidade', label: 'Quantidade', required: true },
    { internal: 'preco', label: 'Preço', required: true },
    { internal: 'unidade', label: 'Unidade', required: false },
    { internal: 'categoria', label: 'Categoria', required: false },
    { internal: 'lote', label: 'Lote', required: false },
    { internal: 'data_validade', label: 'Data de Validade', required: false },
    { internal: 'fornecedor', label: 'Fornecedor', required: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="root_path">Caminho dos Dados na Resposta</Label>
        <Input
          id="root_path"
          type="text"
          value={config.data_mapping.root_path}
          onChange={(e) => onChange({
            ...config,
            data_mapping: {
              ...config.data_mapping,
              root_path: e.target.value,
            },
          })}
          placeholder="data.items"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Onde estão os dados no JSON? Ex: 'data', 'results', 'data.products' (deixe vazio se os dados estão na raiz)
        </p>
      </div>

      {apiResponse && (
        <div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
          >
            {showPreview ? 'Ocultar' : 'Mostrar'} Preview da Resposta
          </Button>
          {showPreview && (
            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-60 border">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div>
        <h3 className="font-semibold mb-4">Mapeamento de Campos</h3>
        <div className="space-y-3">
          {fieldMappings.map(({ internal, label, required }) => (
            <div key={internal} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="font-medium">
                {label} {required && <span className="text-destructive">*</span>}
              </div>
              <div className="text-center text-muted-foreground">⟷</div>
              <Input
                type="text"
                value={config.data_mapping.fields[internal] || ''}
                onChange={(e) => updateFieldMapping(internal, e.target.value)}
                placeholder="campo_api"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2">💡 Dica</h4>
        <p className="text-sm text-muted-foreground">
          Campos aninhados podem ser acessados usando ponto. Ex: <code className="bg-background px-1 py-0.5 rounded">user.profile.name</code>
        </p>
      </div>
    </div>
  );
};
