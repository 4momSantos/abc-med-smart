import { useEffect } from 'react';
import { Trash2, UserCog } from 'lucide-react';
import { useOrganizationStore } from '@/store/organizationStore';
import { useAuth } from '@/contexts/AuthContext';
import type { OrgRole } from '@/types/organization';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const roleLabels: Record<OrgRole, string> = {
  org_admin: 'Administrador',
  org_manager: 'Gestor',
  org_viewer: 'Visualizador',
};

const roleColors: Record<OrgRole, 'destructive' | 'default' | 'secondary'> = {
  org_admin: 'destructive',
  org_manager: 'default',
  org_viewer: 'secondary',
};

export function OrganizationMembersList() {
  const { members, currentOrganization, fetchMembers, removeMember, updateMemberRole } =
    useOrganizationStore();
  const { user, organizationRole } = useAuth();

  useEffect(() => {
    if (currentOrganization) {
      fetchMembers(currentOrganization.id);
    }
  }, [currentOrganization, fetchMembers]);

  const canManageMembers = organizationRole === 'org_admin';

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    await updateMemberRole(memberId, newRole);
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
  };

  if (!currentOrganization) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data de Entrada</TableHead>
              {canManageMembers && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageMembers ? 4 : 3} className="text-center text-muted-foreground">
                  Nenhum membro encontrado
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {member.user_id === user?.id ? 'Você' : `Usuário ${member.user_id.slice(0, 8)}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManageMembers && member.user_id !== user?.id ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value as OrgRole)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="org_viewer">Visualizador</SelectItem>
                          <SelectItem value="org_manager">Gestor</SelectItem>
                          <SelectItem value="org_admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleColors[member.role]}>{roleLabels[member.role]}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(member.joined_at).toLocaleDateString('pt-BR')}</TableCell>
                  {canManageMembers && (
                    <TableCell className="text-right">
                      {member.user_id !== user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Membro</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover este membro da organização? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
