import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  expires_at: string;
  organizations: {
    name: string;
  };
}

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido');
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*, organizations(name)')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      if (new Date(data.expires_at) < new Date()) {
        setError('Este convite expirou');
        setLoading(false);
        return;
      }

      setInvitation(data as Invitation);
    } catch (err: any) {
      console.error('Error fetching invitation:', err);
      setError('Convite não encontrado ou inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    try {
      setAccepting(true);

      if (!user) {
        // Redirecionar para signup com o token
        navigate(`/auth?invite_token=${token}`);
        return;
      }

      // Verificar se email do usuário logado é o mesmo do convite
      if (user.email !== invitation.email) {
        toast({
          title: 'Erro',
          description: 'Este convite foi enviado para outro email. Faça logout e use o email correto.',
          variant: 'destructive',
        });
        return;
      }

      // Adicionar usuário à organização
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: invitation.organization_id,
          user_id: user.id,
          role: invitation.role as any,
          is_active: true
        }]);

      if (memberError) throw memberError;

      // Atualizar convite como aceito
      await supabase
        .from('organization_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      toast({
        title: 'Convite aceito!',
        description: `Você agora faz parte de ${invitation.organizations.name}`,
      });

      // Redirecionar para dashboard
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao aceitar convite: ' + err.message,
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center">Convite Inválido</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">Convite para Organização</CardTitle>
          <CardDescription className="text-center">
            Você foi convidado para participar de uma organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{invitation.organizations.name}</strong>
              <br />
              Função: <span className="capitalize">{invitation.role.replace('org_', '')}</span>
              <br />
              Email: {invitation.email}
            </AlertDescription>
          </Alert>

          {!user && (
            <Alert>
              <AlertDescription>
                Você precisa criar uma conta ou fazer login para aceitar este convite.
              </AlertDescription>
            </Alert>
          )}

          {user && user.email !== invitation.email && (
            <Alert variant="destructive">
              <AlertDescription>
                Este convite foi enviado para <strong>{invitation.email}</strong>, mas você está logado como <strong>{user.email}</strong>.
                Faça logout e use o email correto.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleAccept} 
            className="w-full"
            disabled={accepting || (user ? user.email !== invitation.email : false)}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aceitando...
              </>
            ) : (
              user ? 'Aceitar Convite' : 'Criar Conta e Aceitar'
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')} 
            className="w-full"
          >
            {user ? 'Voltar' : 'Já tenho uma conta'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}