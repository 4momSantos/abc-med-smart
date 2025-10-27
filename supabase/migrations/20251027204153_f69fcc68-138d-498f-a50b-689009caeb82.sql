-- Criar tabela de convites de organização
CREATE TABLE public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'org_viewer',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, email, status)
);

-- Habilitar RLS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Org admins podem ver convites da sua organização
CREATE POLICY "Org admins can view invitations"
ON public.organization_invitations FOR SELECT
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_admin') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Org admins podem criar convites
CREATE POLICY "Org admins can insert invitations"
ON public.organization_invitations FOR INSERT
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'org_admin') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Org admins podem atualizar convites (cancelar, etc)
CREATE POLICY "Org admins can update invitations"
ON public.organization_invitations FOR UPDATE
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_admin') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Índices para performance
CREATE INDEX idx_invitations_email ON public.organization_invitations(email);
CREATE INDEX idx_invitations_token ON public.organization_invitations(token);
CREATE INDEX idx_invitations_status ON public.organization_invitations(status);
CREATE INDEX idx_invitations_org ON public.organization_invitations(organization_id);