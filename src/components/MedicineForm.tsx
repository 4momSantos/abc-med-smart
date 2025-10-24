import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export interface MedicineItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  percentage: number;
  accumulatedPercentage: number;
  classification: "A" | "B" | "C";
}

interface MedicineFormProps {
  onAddItem: (item: Omit<MedicineItem, "id" | "totalValue" | "percentage" | "accumulatedPercentage" | "classification">) => void;
}

export const MedicineForm = ({ onAddItem }: MedicineFormProps) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !name || !quantity || !unitPrice) {
      toast.error("Preencha todos os campos");
      return;
    }

    onAddItem({
      code,
      name,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
    });

    setCode("");
    setName("");
    setQuantity("");
    setUnitPrice("");
    toast.success("Item adicionado com sucesso");
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Adicionar Medicamento/Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </form>
    </Card>
  );
};
