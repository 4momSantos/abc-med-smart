import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDataStore } from '@/store/dataStore';

export const FilterBar = () => {
  const { activeFilters, setActiveFilters, clearFilters, items, filteredItems } = useDataStore();
  const [searchQuery, setSearchQuery] = useState(activeFilters.searchQuery || '');

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

  const hasActiveFilters =
    activeFilters.classABC ||
    activeFilters.valueRange ||
    activeFilters.searchQuery;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            type="search"
            placeholder="Buscar por nome ou ID..."
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
