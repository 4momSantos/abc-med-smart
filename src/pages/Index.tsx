import { useState } from "react";
import { MedicineForm, MedicineItem } from "@/components/MedicineForm";
import { ABCTable } from "@/components/ABCTable";
import { ABCChart } from "@/components/ABCChart";
import { ABCSummary } from "@/components/ABCSummary";
import { ABCAnalysis } from "@/components/ABCAnalysis";
import { StrategicRecommendations } from "@/components/StrategicRecommendations";
import { ImportWizard } from "@/components/ImportWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity } from "lucide-react";
import { ABCConfiguration as ABCConfig, AnalysisPeriod } from "@/types/abc";

const Index = () => {
  const [items, setItems] = useState<MedicineItem[]>([]);
  const [abcConfig, setAbcConfig] = useState<ABCConfig>({
    classAThreshold: 80,
    classBThreshold: 95,
  });
  const [period, setPeriod] = useState<AnalysisPeriod>({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const calculateABC = (newItems: MedicineItem[], config: ABCConfig = abcConfig) => {
    const sortedItems = [...newItems].sort((a, b) => b.totalValue - a.totalValue);
    
    const totalValue = sortedItems.reduce((sum, item) => sum + item.totalValue, 0);
    
    let accumulated = 0;
    const itemsWithPercentages = sortedItems.map((item) => {
      const percentage = totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;
      accumulated += percentage;
      
      let classification: "A" | "B" | "C";
      if (accumulated <= config.classAThreshold) {
        classification = "A";
      } else if (accumulated <= config.classBThreshold) {
        classification = "B";
      } else {
        classification = "C";
      }
      
      return {
        ...item,
        percentage,
        accumulatedPercentage: accumulated,
        classification,
      };
    });
    
    return itemsWithPercentages;
  };

  const handleAddItem = (newItem: Omit<MedicineItem, "id" | "totalValue" | "percentage" | "accumulatedPercentage" | "classification">) => {
    const item: MedicineItem = {
      ...newItem,
      id: Date.now().toString(),
      totalValue: newItem.quantity * newItem.unitPrice,
      percentage: 0,
      accumulatedPercentage: 0,
      classification: "C",
    };
    
    const updatedItems = calculateABC([...items, item]);
    setItems(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = calculateABC(items.filter(item => item.id !== id));
    setItems(updatedItems);
  };

  const handleImportComplete = (importedItems: MedicineItem[]) => {
    const updatedItems = calculateABC(importedItems);
    setItems(updatedItems);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Curva ABC</h1>
              <p className="text-muted-foreground">Análise de Medicamentos e Materiais</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
            <TabsTrigger value="import">Importar Arquivo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-6 mt-6">
            <MedicineForm onAddItem={handleAddItem} />
          </TabsContent>
          
          <TabsContent value="import" className="space-y-6 mt-6">
            <ImportWizard 
              onImportComplete={handleImportComplete}
              abcConfig={abcConfig}
              onConfigChange={setAbcConfig}
              period={period}
              onPeriodChange={setPeriod}
            />
          </TabsContent>
        </Tabs>
        
        {items.length > 0 && (
          <>
            <ABCSummary items={items} />
            <ABCAnalysis items={items} />
            <StrategicRecommendations items={items} />
            <ABCChart items={items} />
          </>
        )}
        
        <ABCTable 
          items={items} 
          onDeleteItem={handleDeleteItem}
          abcConfig={abcConfig}
          period={period}
        />
      </main>
    </div>
  );
};

export default Index;
