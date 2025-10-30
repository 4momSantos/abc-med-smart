import { useMemo } from 'react';
import { AlertCircle, Activity } from 'lucide-react';
import { MedicineItem } from '@/types/medicine';

interface StockAlertsWidgetProps {
  items: MedicineItem[];
}

export const StockAlertsWidget = ({ items }: StockAlertsWidgetProps) => {
  const alerts = useMemo(() => {
    // Calcular métricas de alerta apenas com dados reais
    const itemsWithValidData = items
      .filter(item => item.leadTime && item.leadTime > 0 && item.currentStock && item.currentStock > 0)
      .map(item => {
        const estoqueDias = item.leadTime!;
        const rotatividade = (item.quantity / item.currentStock!) * 12;
        
        return { ...item, estoqueDias, rotatividade };
      });

    const rupturaIminente = itemsWithValidData.filter(
      d => d.estoqueDias < 15 && d.classification === 'A'
    ).length;

    const estoqueAlto = itemsWithValidData.filter(
      d => d.estoqueDias > 60
    ).length;

    const giroBaixo = itemsWithValidData.filter(
      d => d.rotatividade < 6
    ).length;

    return { rupturaIminente, estoqueAlto, giroBaixo };
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="font-semibold text-red-900 dark:text-red-100">Ruptura Iminente</span>
        </div>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {alerts.rupturaIminente}
        </p>
        <p className="text-sm text-red-700 dark:text-red-300">Itens Classe A com menos de 15 dias</p>
      </div>

      <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
          <span className="font-semibold text-yellow-900 dark:text-yellow-100">Estoque Alto</span>
        </div>
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {alerts.estoqueAlto}
        </p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">Itens com mais de 60 dias (risco obsolescência)</p>
      </div>

      <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 p-4 rounded">
        <div className="flex items-center mb-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="font-semibold text-blue-900 dark:text-blue-100">Giro Baixo</span>
        </div>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {alerts.giroBaixo}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300">Itens com menos de 6 giros por ano</p>
      </div>
    </div>
  );
};
