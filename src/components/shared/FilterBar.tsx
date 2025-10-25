import { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDataStore } from '@/store/dataStore';

export const FilterBar = () => {
  const { activeFilters, setActiveFilters, clearFilters, items, filteredItems } = useDataStore();
  const [searchQuery, setSearchQuery] = useState(activeFilters.searchQuery || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extrair valores únicos para os selects
  const uniqueCategories = useMemo(() => 
    Array.from(new Set(items.map(item => item.category).filter(Boolean))),
    [items]
  );

  const uniqueSuppliers = useMemo(() => 
    Array.from(new Set(items.map(item => item.supplier).filter(Boolean))),
    [items]
  );

  const uniqueSectors = useMemo(() => 
    Array.from(new Set(items.map(item => item.requestingSector).filter(Boolean))),
    [items]
  );

  const handleClassFilter = (classValue: 'A' | 'B' | 'C') => {
    const currentClasses = activeFilters.classABC || [];
    const newClasses = currentClasses.includes(classValue)
      ? currentClasses.filter((c) => c !== classValue)
      : [...currentClasses, classValue];
    
    setActiveFilters({
      ...activeFilters,
      classABC: newClasses.length > 0 ? newClasses : undefined,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setActiveFilters({
      ...activeFilters,
      searchQuery: value || undefined,
    });
  };

  const handleCategoryFilter = (value: string) => {
    setActiveFilters({
      ...activeFilters,
      category: value === 'all' ? undefined : value,
    });
  };

  const handleSupplierFilter = (value: string) => {
    setActiveFilters({
      ...activeFilters,
      supplier: value === 'all' ? undefined : value,
    });
  };

  const handleSectorFilter = (value: string) => {
    setActiveFilters({
      ...activeFilters,
      sector: value === 'all' ? undefined : value,
    });
  };

  const handleLeadTimeChange = (value: number[]) => {
    setActiveFilters({
      ...activeFilters,
      leadTimeRange: value[0] === 0 && value[1] === 180 ? undefined : [value[0], value[1]],
    });
  };

  const handleStockFilter = (stockFilter: 'all' | 'needsReorder' | 'belowMin') => {
    setActiveFilters({
      ...activeFilters,
      stockFilter: stockFilter === 'all' ? undefined : stockFilter,
    });
  };

  const handleCriticalityFilter = (value: string) => {
    setActiveFilters({
      ...activeFilters,
      criticality: value === 'all' ? undefined : value as 'alta' | 'média' | 'baixa',
    });
  };

  const hasActiveFilters =
    activeFilters.classABC ||
    activeFilters.valueRange ||
    activeFilters.searchQuery ||
    activeFilters.category ||
    activeFilters.supplier ||
    activeFilters.sector ||
    activeFilters.leadTimeRange ||
    activeFilters.stockFilter ||
    activeFilters.criticality;

  const leadTimeRange = activeFilters.leadTimeRange || [0, 180];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            type="search"
            placeholder="Buscar por nome, código ou fornecedor..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Class ABC Filter */}
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Classe:</span>
          {(['A', 'B', 'C'] as const).map((classValue) => {
            const isActive = activeFilters.classABC?.includes(classValue);
            return (
              <Badge
                key={classValue}
                variant={isActive ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleClassFilter(classValue)}
              >
                {classValue}
              </Badge>
            );
          })}
        </div>

        {/* Advanced Filters Toggle */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(activeFilters).length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtros Avançados</h4>

              {/* Category */}
              {uniqueCategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={activeFilters.category || 'all'}
                    onValueChange={handleCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueCategories.map((cat) => (
                        <SelectItem key={cat} value={cat!}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Supplier */}
              {uniqueSuppliers.length > 0 && (
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select
                    value={activeFilters.supplier || 'all'}
                    onValueChange={handleSupplierFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os fornecedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueSuppliers.map((sup) => (
                        <SelectItem key={sup} value={sup!}>
                          {sup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sector */}
              {uniqueSectors.length > 0 && (
                <div className="space-y-2">
                  <Label>Setor</Label>
                  <Select
                    value={activeFilters.sector || 'all'}
                    onValueChange={handleSectorFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os setores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueSectors.map((sector) => (
                        <SelectItem key={sector} value={sector!}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Criticality */}
              <div className="space-y-2">
                <Label>Criticidade Clínica</Label>
                <Select
                  value={activeFilters.criticality || 'all'}
                  onValueChange={handleCriticalityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="média">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                <Label>Status do Estoque</Label>
                <Select
                  value={activeFilters.stockFilter || 'all'}
                  onValueChange={(v) => handleStockFilter(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="needsReorder">Precisa Reposição</SelectItem>
                    <SelectItem value="belowMin">Abaixo do Mínimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Time Range */}
              <div className="space-y-2">
                <Label>Lead Time (dias): {leadTimeRange[0]} - {leadTimeRange[1]}</Label>
                <Slider
                  min={0}
                  max={180}
                  step={5}
                  value={leadTimeRange}
                  onValueChange={handleLeadTimeChange}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-3 text-sm text-muted-foreground">
        Exibindo <span className="font-medium text-foreground">{filteredItems.length}</span> de{' '}
        <span className="font-medium text-foreground">{items.length}</span> itens
      </div>
    </div>
  );
};
