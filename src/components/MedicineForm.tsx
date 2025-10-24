import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export interface MedicineItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  percentage: number;
  accumulatedPercentage: number;
  classification: "A" | "B" | "C";
  clinicalCriticality: "alta" | "média" | "baixa";
}

interface MedicineFormProps {
  onAddItem: (item: Omit<MedicineItem, "id" | "totalValue" | "percentage" | "accumulatedPercentage" | "classification">) => void;
}

export const UNITS = [
  { value: "un", label: "Unidade" },
  { value: "cx", label: "Caixa" },
  { value: "fr", label: "Frasco" },
  { value: "amp", label: "Ampola" },
  { value: "comp", label: "Comprimido" },
  { value: "caps", label: "Cápsula" },
  { value: "env", label: "Envelope" },
  { value: "tubo", label: "Tubo" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "g", label: "Grama" },
  { value: "kg", label: "Kilograma" },
];

export const CRITICALITIES = [
  { value: "alta", label: "Alta" },
  { value: "média", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

export const MedicineForm = ({ onAddItem }: MedicineFormProps) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("un");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [clinicalCriticality, setClinicalCriticality] = useState<"alta" | "média" | "baixa">("média");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !name || !quantity || !unitPrice) {
      toast.error("Preencha todos os campos");
      return;
    }

    onAddItem({
      code,
      name,
      unit,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      clinicalCriticality,
    });

    setCode("");
    setName("");
    setUnit("un");
    setQuantity("");
    setUnitPrice("");
    setClinicalCriticality("média");
    toast.success("Item adicionado com sucesso");
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Adicionar Medicamento/Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: MED001"
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Paracetamol 500mg"
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="unit">Unidade de Medida</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger id="unit" className="bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="criticality">Criticidade Clínica</Label>
            <Select value={clinicalCriticality} onValueChange={(value) => setClinicalCriticality(value as "alta" | "média" | "baixa")}>
              <SelectTrigger id="criticality" className="bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CRITICALITIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </form>
    </Card>
  );
};
