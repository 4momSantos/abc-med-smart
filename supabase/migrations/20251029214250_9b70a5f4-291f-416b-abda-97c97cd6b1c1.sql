-- Remover política restritiva antiga
DROP POLICY IF EXISTS "Org managers can insert medicines" ON medicines;

-- Nova política: qualquer membro ativo pode inserir medicamentos
CREATE POLICY "Org members can insert medicines"
ON medicines FOR INSERT
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
);