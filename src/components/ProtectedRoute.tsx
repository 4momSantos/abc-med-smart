import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

type UserRole = 'admin' | 'manager' | 'viewer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole = 'viewer' }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const roleHierarchy = {
    admin: 3,
    manager: 2,
    viewer: 1,
  };

  const hasAccess = userRole && roleHierarchy[userRole] >= roleHierarchy[requiredRole];

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md border-destructive">
          <Shield className="h-4 w-4 text-destructive" />
          <AlertDescription className="ml-2">
            <strong>Acesso Negado</strong>
            <p className="mt-2 text-muted-foreground">
              Você não tem permissão para acessar esta página. 
              Nível necessário: <span className="font-semibold">{requiredRole}</span>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
