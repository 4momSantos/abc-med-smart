import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Home, FileInput, BarChart3, Brain, TrendingUp, Settings, 
  FileText, HelpCircle, Search, Package, FileSpreadsheet 
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { items } = useDataStore();
  const [search, setSearch] = useState('');

  const pages = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Importar Dados', path: '/import', icon: FileInput },
    { name: 'Visualizações', path: '/visualizations', icon: BarChart3 },
    { name: 'Machine Learning', path: '/ml', icon: Brain },
    { name: 'Estatísticas', path: '/statistics', icon: TrendingUp },
    { name: 'Relatórios', path: '/reports', icon: FileText },
    { name: 'Dados Salvos', path: '/saved-data', icon: FileSpreadsheet },
    { name: 'Busca Avançada', path: '/search', icon: Search },
    { name: 'Configurações', path: '/settings', icon: Settings },
    { name: 'Ajuda', path: '/help', icon: HelpCircle },
  ];

  const filteredItems = items
    .filter((item) => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 5);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command>
          <CommandInput 
            placeholder="Buscar páginas, itens, ações..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            
            <CommandGroup heading="Páginas">
              {pages.map((page) => (
                <CommandItem
                  key={page.path}
                  onSelect={() => handleSelect(() => navigate(page.path))}
                  className="cursor-pointer"
                >
                  <page.icon className="w-4 h-4 mr-2" />
                  {page.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {search && filteredItems.length > 0 && (
              <CommandGroup heading="Itens">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(() => {
                      // Navigate to search with pre-filled query
                      navigate(`/search?q=${encodeURIComponent(item.name)}`);
                    })}
                    className="cursor-pointer"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.code} • Classe {item.classification} • R$ {item.totalValue.toFixed(2)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}
