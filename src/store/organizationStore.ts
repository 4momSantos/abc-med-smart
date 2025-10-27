import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Organization, OrganizationMember, OrgRole } from '@/types/organization';

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  isLoading: boolean;
  
  fetchOrganizations: () => Promise<void>;
  setCurrentOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<Organization | null>;
  inviteMember: (email: string, role: OrgRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: OrgRole) => Promise<void>;
  fetchMembers: (orgId: string) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  members: [],
  isLoading: false,

  fetchOrganizations: async () => {
    try {
      set({ isLoading: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ organizations: [], currentOrganization: null, isLoading: false });
        return;
      }

      // Get user's organizations via the security definer function
      const { data, error } = await supabase
        .rpc('get_user_organizations', { _user_id: user.id });

      if (error) throw error;

      const organizations = data as Organization[];
      set({ 
        organizations,
        currentOrganization: organizations[0] || null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Erro ao carregar organizações');
      set({ isLoading: false });
    }
  },

  setCurrentOrganization: async (orgId: string) => {
    const { organizations } = get();
    const org = organizations.find(o => o.id === orgId);
    
    if (org) {
      set({ currentOrganization: org });
      localStorage.setItem('currentOrganizationId', orgId);
      toast.success(`Organização alterada para: ${org.name}`);
    }
  },

  createOrganization: async (name: string) => {
    try {
      set({ isLoading: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const slug = `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
          is_active: true
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as org_admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'org_admin',
          is_active: true
        });

      if (memberError) throw memberError;

      // Refresh organizations
      await get().fetchOrganizations();
      
      toast.success('Organização criada com sucesso!');
      set({ isLoading: false });
      
      return org as Organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Erro ao criar organização');
      set({ isLoading: false });
      return null;
    }
  },

  fetchMembers: async (orgId: string) => {
    try {
      set({ isLoading: true });

      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true);

      if (membersError) throw membersError;

      // Fetch profiles separately
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine data
      const membersWithProfiles = membersData.map(member => ({
        ...member,
        profiles: profilesData.find(p => p.id === member.user_id)
      }));

      set({ members: membersWithProfiles as OrganizationMember[], isLoading: false });
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Erro ao carregar membros');
      set({ isLoading: false });
    }
  },

  inviteMember: async (email: string, role: OrgRole) => {
    try {
      const { currentOrganization } = get();
      if (!currentOrganization) {
        toast.error('Nenhuma organização selecionada');
        return;
      }

      // This would typically send an invitation email
      // For now, we'll just show a success message
      toast.info('Funcionalidade de convite em desenvolvimento');
      
      // TODO: Implement invitation system with edge function
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Erro ao convidar membro');
    }
  },

  removeMember: async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      const { currentOrganization } = get();
      if (currentOrganization) {
        await get().fetchMembers(currentOrganization.id);
      }
      
      toast.success('Membro removido com sucesso');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  },

  updateMemberRole: async (memberId: string, role: OrgRole) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      const { currentOrganization } = get();
      if (currentOrganization) {
        await get().fetchMembers(currentOrganization.id);
      }
      
      toast.success('Função do membro atualizada');
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Erro ao atualizar função');
    }
  },
}));
