import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Building2 } from 'lucide-react';
import { SystemUsersManagement } from '@/components/admin/SystemUsersManagement';
import { SystemOrganizationsManagement } from '@/components/admin/SystemOrganizationsManagement';

export default function SystemAdminPage() {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md border-destructive">
          <Shield className="h-4 w-4 text-destructive" />
          <AlertDescription className="ml-2">
            <strong>Acesso Negado</strong>
            <p className="mt-2 text-muted-foreground">
              Apenas administradores do sistema podem acessar esta página.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Administração do Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie usuários, organizações e permissões do sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários do Sistema
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building2 className="h-4 w-4 mr-2" />
            Todas as Organizações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários do sistema e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemUsersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Organizações</CardTitle>
              <CardDescription>
                Visualize todas as organizações e gerencie seus membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemOrganizationsManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
