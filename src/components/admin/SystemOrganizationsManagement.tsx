import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Organization, OrgRole } from '@/types/organization';

interface OrganizationMemberWithProfile {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  joined_at: string;
  is_active: boolean;
  profiles?: {
    full_name?: string;
  };
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Users, Search, Trash2 } from 'lucide-react';
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

interface OrgWithMembers {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  subscription_plan: string;
  settings: any;
  memberCount: number;
}

const roleLabels: Record<OrgRole, string> = {
  org_admin: 'Administrador',
  org_manager: 'Gestor',
  org_viewer: 'Visualizador',
};

export function SystemOrganizationsManagement() {
  const [organizations, setOrganizations] = useState<OrgWithMembers[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [members, setMembers] = useState<OrganizationMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrganizations = async () => {
    try {
      setLoading(true);

      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Buscar contagem de membros para cada org
      const orgsWithCounts = await Promise.all(
        orgsData.map(async (org) => {
          const { count } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .eq('is_active', true);

          return {
            ...org,
            memberCount: count || 0,
          };
        })
      );

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('organization_id', orgId)
        .eq('is_active', true);

      if (error) throw error;

      setMembers(data as OrganizationMemberWithProfile[]);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Erro ao carregar membros');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrg(orgId);
    fetchMembers(orgId);
  };

  const handleRoleChange = async (memberId: string, newRole: OrgRole, orgId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers(orgId);
      toast.success('Função atualizada com sucesso');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar função');
    }
  };

  const handleRemoveMember = async (memberId: string, orgId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers(orgId);
      fetchOrganizations(); // Atualizar contagem
      toast.success('Membro removido com sucesso');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar organização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {filteredOrganizations.map((org) => (
          <AccordionItem key={org.id} value={org.id}>
            <AccordionTrigger
              onClick={() => handleOrgSelect(org.id)}
              className="hover:no-underline"
            >
              <div className="flex items-center gap-4 w-full">
                <Building2 className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">{org.name}</div>
                  <div className="text-sm text-muted-foreground">{org.slug}</div>
                </div>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {org.memberCount} membro(s)
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {selectedOrg === org.id && (
                <div className="pt-4 space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <strong>Criada em:</strong>{' '}
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p>
                      <strong>Plano:</strong> {org.subscription_plan}
                    </p>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Data de Entrada</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Nenhum membro nesta organização
                            </TableCell>
                          </TableRow>
                        ) : (
                          members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                {member.profiles?.full_name || `Usuário ${member.user_id.slice(0, 8)}`}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={member.role}
                                  onValueChange={(value) =>
                                    handleRoleChange(member.id, value as OrgRole, org.id)
                                  }
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
                              </TableCell>
                              <TableCell>
                                {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-right">
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
                                        Tem certeza que deseja remover este membro da organização?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRemoveMember(member.id, org.id)}
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-sm text-muted-foreground">
        Total: {filteredOrganizations.length} organização(ões)
      </div>
    </div>
  );
}
