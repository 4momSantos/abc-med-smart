import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationStore } from '@/store/organizationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, XCircle, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
}

export function PendingInvitationsList() {
  const { currentOrganization } = useOrganizationStore();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      fetchInvitations();
    }
  }, [currentOrganization]);

  const fetchInvitations = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar convites pendentes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Convite cancelado',
        description: 'O convite foi cancelado com sucesso',
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar convite',
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = (token: string) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/accept-invite?token=${token}`;
    
    navigator.clipboard.writeText(inviteLink);
    setCopiedToken(token);
    
    toast({
      title: 'Link copiado!',
      description: 'O link do convite foi copiado para a área de transferência',
    });

    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loading) {
    return <div>Carregando convites...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Convites Pendentes
        </CardTitle>
        <CardDescription>
          Convites enviados que ainda não foram aceitos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{invitation.email}</span>
                  <Badge variant="outline">
                    {invitation.role.replace('org_', '')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Enviado {formatDistanceToNow(new Date(invitation.created_at), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </span>
                  <span>
                    Expira {formatDistanceToNow(new Date(invitation.expires_at), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(invitation.token)}
                >
                  {copiedToken === invitation.token ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(invitation.id)}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}