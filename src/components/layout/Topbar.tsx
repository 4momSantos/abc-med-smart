import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Download, Share2, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OrganizationSwitcher } from '@/components/organization/OrganizationSwitcher';

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

const getRoleBadgeColor = (role: string | null) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    case 'manager':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    default:
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
  }
};

const getRoleLabel = (role: string | null) => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'manager':
      return 'Gerente';
    default:
      return 'Visualizador';
  }
};

export const Topbar = () => {
  const location = useLocation();
  const { toggleSidebar } = useUIStore();
  const { user, userRole, signOut, refreshRole } = useAuth();
  const breadcrumbs = breadcrumbMap[location.pathname] || ['Dashboard'];

  const userInitials = user?.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || 'U';

  const handleRefreshRole = async () => {
    await refreshRole();
    window.location.reload();
  };

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

        <OrganizationSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                <Badge className={cn('text-xs px-1 py-0', getRoleBadgeColor(userRole))}>
                  {getRoleLabel(userRole)}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRefreshRole}>
              <User className="mr-2 h-4 w-4" />
              Atualizar Permissões
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
