import { Building2, Users, Shield } from 'lucide-react';
import { useOrganizationStore } from '@/store/organizationStore';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InviteMemberDialog } from './InviteMemberDialog';
import { OrganizationMembersList } from './OrganizationMembersList';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { PendingInvitationsList } from './PendingInvitationsList';

const roleLabels = {
  org_admin: 'Administrador',
  org_manager: 'Gestor',
  org_viewer: 'Visualizador',
};

const roleColors = {
  org_admin: 'destructive',
  org_manager: 'default',
  org_viewer: 'secondary',
} as const;

export function OrganizationSettings() {
  const { currentOrganization } = useOrganizationStore();
  const { organizationRole, userRole } = useAuth();

  if (!currentOrganization) {
    return (
      <Alert>
        <AlertDescription>Nenhuma organização selecionada.</AlertDescription>
      </Alert>
    );
  }

  const canManageMembers = organizationRole === 'org_admin';
  const canCreateOrg = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="space-y-6">
      {/* Informações da Organização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Organização
          </CardTitle>
          <CardDescription>Detalhes sobre a organização atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome</p>
            <p className="text-lg font-semibold">{currentOrganization.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Criada em</p>
            <p>{new Date(currentOrganization.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Plano</p>
            <Badge>{currentOrganization.subscription_plan}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Seu Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sua Função
          </CardTitle>
          <CardDescription>Suas permissões nesta organização</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={organizationRole ? roleColors[organizationRole] : 'secondary'}>
              {organizationRole ? roleLabels[organizationRole] : 'Sem função'}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <p className="font-medium">O que você pode fazer:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Ver todos os dados da organização</li>
              {(organizationRole === 'org_manager' || organizationRole === 'org_admin') && (
                <>
                  <li>Importar e editar dados</li>
                  <li>Configurar análises e relatórios</li>
                </>
              )}
              {organizationRole === 'org_admin' && (
                <>
                  <li>Convidar e remover membros</li>
                  <li>Gerenciar funções dos membros</li>
                  <li>Editar configurações da organização</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Membros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros da Organização
              </CardTitle>
              <CardDescription>Gerencie quem tem acesso a esta organização</CardDescription>
            </div>
            {canManageMembers && <InviteMemberDialog />}
          </div>
        </CardHeader>
        <CardContent>
          <OrganizationMembersList />
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {canManageMembers && <PendingInvitationsList />}

      {/* Criar Nova Organização */}
      {canCreateOrg && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Organização</CardTitle>
            <CardDescription>
              Crie uma nova organização para gerenciar dados separadamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrganizationDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
