import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { email, organizationId, role, invitedBy } = await req.json();

    console.log('Sending invitation:', { email, organizationId, role });

    // Validar dados
    if (!email || !organizationId || !role) {
      throw new Error('Dados incompletos: email, organizationId e role são obrigatórios');
    }

    // Verificar se usuário com este email já existe no sistema
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    // Se usuário existe, verificar se já é membro da organização
    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', existingUser.id)
        .eq('is_active', true)
        .single();

      if (existingMember) {
        throw new Error('Este usuário já é membro desta organização');
      }
    }

    // Gerar token único
    const token = crypto.randomUUID();

    // Buscar informações da organização
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    if (!org) {
      throw new Error('Organização não encontrada');
    }

    // Verificar se já existe convite pendente
    const { data: existingInvite } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      throw new Error('Já existe um convite pendente para este email');
    }

    // Criar convite
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: invitedBy,
        token,
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    console.log('Invitation created:', invitation.id);

    // Construir link de convite
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || '';
    const inviteLink = `${baseUrl}/accept-invite?token=${token}`;

    console.log('User exists:', existingUser ? 'Yes' : 'No');

    if (existingUser) {
      // Usuário já tem conta - enviar apenas notificação
      console.log(`Usuário ${email} já tem conta. Link: ${inviteLink}`);
      // TODO: Integrar com Resend para emails customizados
    } else {
      // Novo usuário - usar Supabase Auth para enviar convite
      const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteLink,
        data: {
          organization_id: organizationId,
          organization_role: role,
          invitation_token: token,
          organization_name: org.name
        }
      });

      if (authError) {
        console.error('Error sending auth invite:', authError);
        throw authError;
      }

      console.log('Auth invitation sent successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation,
        inviteLink // Para debug/teste
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error sending invitation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao enviar convite' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});