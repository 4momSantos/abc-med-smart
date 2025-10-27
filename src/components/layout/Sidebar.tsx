import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Brain, 
  TrendingUp, 
  Upload, 
  FileText, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { userRole } = useAuth();

  // Menu items dinâmicos baseados em role
  const getMenuItems = () => {
    const baseItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: '/visualizations', icon: BarChart3, label: 'Visualizações' },
      { path: '/ml', icon: Brain, label: 'Machine Learning' },
      { path: '/statistics', icon: TrendingUp, label: 'Estatísticas' },
      { path: '/import', icon: Upload, label: 'Importar Dados' },
      { path: '/reports', icon: FileText, label: 'Relatórios' },
      { path: '/settings', icon: Settings, label: 'Configurações' },
    ];

    // Adicionar item de administração apenas para admins
    if (userRole === 'admin') {
      baseItems.push({
        path: '/system-admin',
        icon: Shield,
        label: 'Administração',
      });
    }

    baseItems.push({ path: '/help', icon: HelpCircle, label: 'Ajuda' });

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
    >
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-sidebar-foreground"
            >
              ABC Analysis
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'text-sidebar-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebarCollapse}
          className="w-full flex items-center justify-center"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
};
