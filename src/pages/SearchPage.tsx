import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { ABCTable } from '@/components/ABCTable';
import { useSettingsStore } from '@/store/settingsStore';

export default function SearchPage() {
  const { items } = useDataStore();
  const { abcConfig, period } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilters, setClassFilters] = useState<Set<string>>(new Set());
  const [criticalityFilters, setCriticalityFilters] = useState<Set<string>>(new Set());
  const [valueRange, setValueRange] = useState<[number, number]>([0, 100000]);
  const [quantityRange, setQuantityRange] = useState<[number, number]>([0, 10000]);

  const maxValue = useMemo(() => Math.max(...items.map(i => i.totalValue), 100000), [items]);
  const maxQuantity = useMemo(() => Math.max(...items.map(i => i.quantity), 10000), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search query
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.code?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Class filters
      if (classFilters.size > 0 && !classFilters.has(item.classification)) {
        return false;
      }

      // Criticality filters
      if (criticalityFilters.size > 0 && !criticalityFilters.has(item.clinicalCriticality)) {
        return false;
      }

      // Value range
      if (item.totalValue < valueRange[0] || item.totalValue > valueRange[1]) {
        return false;
      }

      // Quantity range
      if (item.quantity < quantityRange[0] || item.quantity > quantityRange[1]) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, classFilters, criticalityFilters, valueRange, quantityRange]);

  const toggleClassFilter = (className: string) => {
    const newFilters = new Set(classFilters);
    if (newFilters.has(className)) {
      newFilters.delete(className);
    } else {
      newFilters.add(className);
    }
    setClassFilters(newFilters);
  };

  const toggleCriticalityFilter = (criticality: string) => {
    const newFilters = new Set(criticalityFilters);
    if (newFilters.has(criticality)) {
      newFilters.delete(criticality);
    } else {
      newFilters.add(criticality);
    }
    setCriticalityFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setClassFilters(new Set());
    setCriticalityFilters(new Set());
    setValueRange([0, maxValue]);
    setQuantityRange([0, maxQuantity]);
  };

  const hasActiveFilters = searchQuery || classFilters.size > 0 || criticalityFilters.size > 0 ||
    valueRange[0] !== 0 || valueRange[1] !== maxValue ||
    quantityRange[0] !== 0 || quantityRange[1] !== maxQuantity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Busca Avançada</h1>
        <p className="text-muted-foreground mt-2">
          Pesquise e filtre itens com precisão
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class ABC */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Classe ABC</Label>
              <div className="space-y-2">
                {['A', 'B', 'C'].map((cls) => (
                  <div key={cls} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cls}`}
                      checked={classFilters.has(cls)}
                      onCheckedChange={() => toggleClassFilter(cls)}
                    />
                    <Label htmlFor={`class-${cls}`} className="text-sm font-normal cursor-pointer">
                      Classe {cls}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Criticality */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Criticidade Clínica</Label>
              <div className="space-y-2">
                {['alta', 'média', 'baixa'].map((crit) => (
                  <div key={crit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`crit-${crit}`}
                      checked={criticalityFilters.has(crit)}
                      onCheckedChange={() => toggleCriticalityFilter(crit)}
                    />
                    <Label htmlFor={`crit-${crit}`} className="text-sm font-normal cursor-pointer capitalize">
                      {crit}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Valor Total: R$ {valueRange[0].toFixed(0)} - R$ {valueRange[1].toFixed(0)}
              </Label>
              <Slider
                value={valueRange}
                onValueChange={(value) => setValueRange(value as [number, number])}
                max={maxValue}
                step={100}
                className="w-full"
              />
            </div>

            {/* Quantity Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quantidade: {quantityRange[0]} - {quantityRange[1]}
              </Label>
              <Slider
                value={quantityRange}
                onValueChange={(value) => setQuantityRange(value as [number, number])}
                max={maxQuantity}
                step={10}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} de {items.length} itens
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ABCTable
                items={filteredItems}
                onDelete={() => {}}
                abcConfig={abcConfig}
                period={period}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
