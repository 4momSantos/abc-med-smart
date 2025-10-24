import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportWizard } from '@/components/ImportWizard';
import { useDataStore } from '@/store/dataStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNavigate } from 'react-router-dom';

export default function ImportPage() {
  const { setItems } = useDataStore();
  const { abcConfig, updateABCConfig, period, setPeriod } = useSettingsStore();
  const navigate = useNavigate();

  const handleImportComplete = (items: any[]) => {
    setItems(items);
    navigate('/');
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importar Dados</h1>
        <p className="text-muted-foreground mt-2">
          Importe seus dados de medicamentos e materiais hospitalares
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            Suportamos arquivos Excel (.xlsx, .xls) e CSV. O arquivo deve conter informações sobre
            medicamentos incluindo nome, quantidade, valor unitário e criticidade clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportWizard 
            onImportComplete={handleImportComplete}
            abcConfig={abcConfig}
            onConfigChange={updateABCConfig}
            period={period}
            onPeriodChange={setPeriod}
          />
        </CardContent>
      </Card>
    </div>
  );
}
