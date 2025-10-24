import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, string[]> = {
  '/': ['Dashboard'],
  '/visualizations': ['Visualizações'],
  '/ml': ['Machine Learning'],
  '/statistics': ['Estatísticas'],
  '/import': ['Importar Dados'],
  '/reports': ['Relatórios'],
  '/settings': ['Configurações'],
  '/help': ['Ajuda'],
};

export const Topbar = () => {
  const location = useLocation();
  const { toggleSidebar, sidebarCollapsed } = useUIStore();
  const breadcrumbs = breadcrumbMap[location.pathname] || ['Dashboard'];

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <span
                className={cn(
                  index === breadcrumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {crumb}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar itens, relatórios..."
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Exportar">
          <Download className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Compartilhar">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>
    </header>
    </>
  );
};
