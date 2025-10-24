import { MedicineItem } from "./MedicineForm";
import { Card } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign } from "lucide-react";

interface ABCSummaryProps {
  items: MedicineItem[];
}

export const ABCSummary = ({ items }: ABCSummaryProps) => {
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  
  const classA = items.filter((item) => item.classification === "A");
  const classB = items.filter((item) => item.classification === "B");
  const classC = items.filter((item) => item.classification === "C");

  const valueA = classA.reduce((sum, item) => sum + item.totalValue, 0);
  const valueB = classB.reduce((sum, item) => sum + item.totalValue, 0);
  const valueC = classC.reduce((sum, item) => sum + item.totalValue, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats = [
    {
      label: "Classe A",
      items: classA.length,
      value: valueA,
      percentage: totalValue > 0 ? (valueA / totalValue) * 100 : 0,
      color: "bg-[hsl(var(--class-a-light))] border-[hsl(var(--class-a))]",
      textColor: "text-[hsl(var(--class-a))]",
      icon: TrendingUp,
    },
    {
      label: "Classe B",
      items: classB.length,
      value: valueB,
      percentage: totalValue > 0 ? (valueB / totalValue) * 100 : 0,
      color: "bg-[hsl(var(--class-b-light))] border-[hsl(var(--class-b))]",
      textColor: "text-[hsl(var(--class-b))]",
      icon: Package,
    },
    {
      label: "Classe C",
      items: classC.length,
      value: valueC,
      percentage: totalValue > 0 ? (valueC / totalValue) * 100 : 0,
      color: "bg-[hsl(var(--class-c-light))] border-[hsl(var(--class-c))]",
      textColor: "text-[hsl(var(--class-c))]",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`p-6 border-l-4 ${stat.color} shadow-[var(--shadow-soft)]`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(stat.value)}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  {stat.items} {stat.items === 1 ? "item" : "itens"} ({((stat.items / items.length) * 100).toFixed(1)}%)
                </p>
                <p className={`text-sm font-semibold ${stat.textColor}`}>
                  {stat.percentage.toFixed(1)}% do valor total
                </p>
              </div>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.textColor} opacity-80`} />
          </div>
        </Card>
      ))}
    </div>
  );
};
