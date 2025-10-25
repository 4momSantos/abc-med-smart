import { useState } from 'react';
import { TestTube, Save, Loader2 } from 'lucide-react';
import { HttpSyncConfig } from '@/types/httpSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectionTabProps {
  config: HttpSyncConfig;
  onChange: (config: HttpSyncConfig) => void;
  onSave: () => Promise<boolean>;
  onTest: () => Promise<any>;
  loading: boolean;
}

export const ConnectionTab = ({ config, onChange, onSave, onTest, loading }: ConnectionTabProps) => {
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest();
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      alert('Configuração salva com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="api_url">URL da API *</Label>
        <Input
          id="api_url"
          type="text"
          value={config.api_url}
          onChange={(e) => onChange({ ...config, api_url: e.target.value })}
          placeholder="https://api.empresa.com/produtos"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Endpoint completo da API que retorna os dados
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="method">Método HTTP</Label>
          <Select
            value={config.method}
            onValueChange={(value: 'GET' | 'POST' | 'PUT') => onChange({ ...config, method: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            value={config.timeout_ms}
            onChange={(e) => onChange({ ...config, timeout_ms: parseInt(e.target.value) })}
            className="mt-2"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Usuário (Basic Auth) *</Label>
          <Input
            id="username"
            type="text"
            value={config.auth.username}
            onChange={(e) => onChange({ 
              ...config, 
              auth: { ...config.auth, username: e.target.value }
            })}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Senha (Basic Auth) *</Label>
          <Input
            id="password"
            type="password"
            value={config.auth.password}
            onChange={(e) => onChange({ 
              ...config, 
              auth: { ...config.auth, password: e.target.value }
            })}
            className="mt-2"
          />
        </div>
      </div>

      {config.method !== 'GET' && (
        <div>
          <Label htmlFor="body">Body da Requisição (JSON)</Label>
          <Textarea
            id="body"
            value={config.body ? JSON.stringify(config.body, null, 2) : '{}'}
            onChange={(e) => {
              try {
                const body = JSON.parse(e.target.value);
                onChange({ ...config, body });
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="mt-2 font-mono"
            rows={6}
          />
        </div>
      )}
      
      <div className="flex gap-4">
        <Button
          onClick={handleTest}
          variant="secondary"
          disabled={testing || loading}
        >
          {testing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TestTube className="mr-2 h-4 w-4" />
          )}
          Testar Conexão
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={loading}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Configuração
        </Button>
      </div>
      
      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <AlertDescription>
            <p className="font-semibold">{testResult.message}</p>
            {testResult.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Ver resposta</summary>
                <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
