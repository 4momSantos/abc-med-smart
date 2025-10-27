-- ==========================================
-- MULTI-TENANT SYSTEM IMPLEMENTATION
-- ==========================================

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Create organization roles enum
CREATE TYPE public.org_role AS ENUM ('org_admin', 'org_manager', 'org_viewer');

-- 3. Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role org_role DEFAULT 'org_viewer' NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 4. Add organization_id to existing tables
ALTER TABLE public.medicines 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.abc_configurations 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.dashboard_layouts 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.saved_datasets 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.analysis_history 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.http_sync_configs 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.sync_logs 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Create security definer functions
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
      AND organization_id = _org_id
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_active_org(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = _user_id 
    AND is_active = true
  ORDER BY joined_at DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
      AND organization_id = _org_id
      AND role::TEXT = _role
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id UUID)
RETURNS SETOF public.organizations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.* 
  FROM public.organizations o
  INNER JOIN public.organization_members om ON om.organization_id = o.id
  WHERE om.user_id = _user_id 
    AND om.is_active = true
    AND o.is_active = true
  ORDER BY om.joined_at DESC
$$;

-- 6. Migrate existing data
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Create default organization if not exists
  INSERT INTO public.organizations (name, slug, is_active)
  VALUES ('Organização Principal', 'org-principal', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO default_org_id;
  
  -- Get org id if already exists
  IF default_org_id IS NULL THEN
    SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'org-principal';
  END IF;
  
  -- Migrate existing users to default organization
  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  SELECT 
    default_org_id,
    u.id,
    CASE 
      WHEN ur.role = 'admin' THEN 'org_admin'::org_role
      WHEN ur.role = 'manager' THEN 'org_manager'::org_role
      ELSE 'org_viewer'::org_role
    END,
    true
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  
  -- Assign organization_id to existing data
  UPDATE public.medicines SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.abc_configurations SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.dashboard_layouts SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.saved_datasets SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.analysis_history SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.http_sync_configs SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.sync_logs SET organization_id = default_org_id WHERE organization_id IS NULL;
END $$;

-- 7. Make organization_id NOT NULL after migration
ALTER TABLE public.medicines ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.abc_configurations ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.dashboard_layouts ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.saved_datasets ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.analysis_history ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.http_sync_configs ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.sync_logs ALTER COLUMN organization_id SET NOT NULL;

-- 8. Update RLS policies for organizations
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
      AND is_active = true
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "System admins can manage all organizations"
ON public.organizations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Org admins can update their organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
      AND role = 'org_admin'
      AND is_active = true
  )
);

-- 9. RLS policies for organization_members
CREATE POLICY "Users can view members of their organizations"
ON public.organization_members FOR SELECT
TO authenticated
USING (
  public.user_belongs_to_org(auth.uid(), organization_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Org admins can manage members"
ON public.organization_members FOR ALL
TO authenticated
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
);

-- 10. Update RLS policies for medicines
DROP POLICY IF EXISTS "Users can view own medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can view all medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins and managers can insert medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can update all medicines" ON public.medicines;
DROP POLICY IF EXISTS "Managers can update own medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can delete all medicines" ON public.medicines;
DROP POLICY IF EXISTS "Managers can delete own medicines" ON public.medicines;

CREATE POLICY "Users can view org medicines"
ON public.medicines FOR SELECT
TO authenticated
USING (
  public.user_belongs_to_org(auth.uid(), organization_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Org managers can insert medicines"
ON public.medicines FOR INSERT
TO authenticated
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Org managers can update medicines"
ON public.medicines FOR UPDATE
TO authenticated
USING (
  (public.has_org_role(auth.uid(), organization_id, 'org_manager')
   OR public.has_org_role(auth.uid(), organization_id, 'org_admin'))
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Org admins can delete medicines"
ON public.medicines FOR DELETE
TO authenticated
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
);

-- 11. Update RLS for other tables (abc_configurations, dashboard_layouts, etc.)
DROP POLICY IF EXISTS "Users can view own ABC config" ON public.abc_configurations;
DROP POLICY IF EXISTS "Admins can view all ABC configs" ON public.abc_configurations;
DROP POLICY IF EXISTS "Users can insert own ABC config" ON public.abc_configurations;
DROP POLICY IF EXISTS "Users can update own ABC config" ON public.abc_configurations;
DROP POLICY IF EXISTS "Users can delete own ABC config" ON public.abc_configurations;

CREATE POLICY "Users can view org ABC config"
ON public.abc_configurations FOR SELECT
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Org managers can manage ABC config"
ON public.abc_configurations FOR ALL
TO authenticated
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
);

-- Dashboard layouts
DROP POLICY IF EXISTS "Users can view own layouts" ON public.dashboard_layouts;
DROP POLICY IF EXISTS "Admins can view all layouts" ON public.dashboard_layouts;
DROP POLICY IF EXISTS "Users can insert own layouts" ON public.dashboard_layouts;
DROP POLICY IF EXISTS "Users can update own layouts" ON public.dashboard_layouts;
DROP POLICY IF EXISTS "Users can delete own layouts" ON public.dashboard_layouts;

CREATE POLICY "Users can view org layouts"
ON public.dashboard_layouts FOR SELECT
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage org layouts"
ON public.dashboard_layouts FOR ALL
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

-- Saved datasets
DROP POLICY IF EXISTS "Users can view own datasets" ON public.saved_datasets;
DROP POLICY IF EXISTS "Admins can view all datasets" ON public.saved_datasets;
DROP POLICY IF EXISTS "Users can insert own datasets" ON public.saved_datasets;
DROP POLICY IF EXISTS "Users can update own datasets" ON public.saved_datasets;
DROP POLICY IF EXISTS "Users can delete own datasets" ON public.saved_datasets;

CREATE POLICY "Users can view org datasets"
ON public.saved_datasets FOR SELECT
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Org managers can manage datasets"
ON public.saved_datasets FOR ALL
TO authenticated
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
);

-- Analysis history
DROP POLICY IF EXISTS "Users can view own analysis" ON public.analysis_history;
DROP POLICY IF EXISTS "Admins can view all analysis" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can insert own analysis" ON public.analysis_history;

CREATE POLICY "Users can view org analysis"
ON public.analysis_history FOR SELECT
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert org analysis"
ON public.analysis_history FOR INSERT
TO authenticated
WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

-- HTTP sync configs
DROP POLICY IF EXISTS "Users can view own sync configs" ON public.http_sync_configs;
DROP POLICY IF EXISTS "Admins can view all sync configs" ON public.http_sync_configs;
DROP POLICY IF EXISTS "Admins and managers can insert sync configs" ON public.http_sync_configs;
DROP POLICY IF EXISTS "Users can update own sync configs" ON public.http_sync_configs;
DROP POLICY IF EXISTS "Users can delete own sync configs" ON public.http_sync_configs;

CREATE POLICY "Users can view org sync configs"
ON public.http_sync_configs FOR SELECT
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Org managers can manage sync configs"
ON public.http_sync_configs FOR ALL
TO authenticated
USING (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_org_role(auth.uid(), organization_id, 'org_manager')
  OR public.has_org_role(auth.uid(), organization_id, 'org_admin')
  OR public.has_role(auth.uid(), 'admin')
);

-- Sync logs
DROP POLICY IF EXISTS "Users can view own sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Admins can view all sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can insert own sync logs" ON public.sync_logs;

CREATE POLICY "Users can view org sync logs"
ON public.sync_logs FOR SELECT
TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert org sync logs"
ON public.sync_logs FOR INSERT
TO authenticated
WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id) OR public.has_role(auth.uid(), 'admin'));

-- 12. Update trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default system role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  -- Check if invited to specific organization
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
    VALUES (
      (NEW.raw_user_meta_data->>'organization_id')::UUID,
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'organization_role')::org_role, 'org_viewer'),
      true
    );
  ELSE
    -- Create personal organization
    INSERT INTO public.organizations (name, slug, is_active)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Minha Organização'),
      'org-' || NEW.id,
      true
    )
    RETURNING id INTO new_org_id;
    
    INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
    VALUES (new_org_id, NEW.id, 'org_admin', true);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 13. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_medicines_org_id ON public.medicines(organization_id);
CREATE INDEX IF NOT EXISTS idx_abc_configs_org_id ON public.abc_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_org_id ON public.dashboard_layouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_saved_datasets_org_id ON public.saved_datasets(organization_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_org_id ON public.analysis_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_http_sync_configs_org_id ON public.http_sync_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_org_id ON public.sync_logs(organization_id);

-- 14. Add updated_at trigger for organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();