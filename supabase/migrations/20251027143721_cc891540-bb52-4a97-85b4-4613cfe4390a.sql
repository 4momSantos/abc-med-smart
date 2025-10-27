-- Habilitar RLS em todas as tabelas
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abc_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.http_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS PARA MEDICINES
-- ========================================

-- Admin vê todos os medicamentos
CREATE POLICY "Admins can view all medicines"
  ON public.medicines FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Usuários veem apenas seus próprios medicamentos
CREATE POLICY "Users can view own medicines"
  ON public.medicines FOR SELECT
  USING (auth.uid() = user_id);

-- Admin e Manager podem inserir
CREATE POLICY "Admins and managers can insert medicines"
  ON public.medicines FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    (public.has_role(auth.uid(), 'manager') AND auth.uid() = user_id)
  );

-- Admin pode atualizar tudo, Manager apenas seus próprios
CREATE POLICY "Admins can update all medicines"
  ON public.medicines FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can update own medicines"
  ON public.medicines FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'manager') AND 
    auth.uid() = user_id
  );

-- Admin pode deletar tudo, Manager apenas seus próprios
CREATE POLICY "Admins can delete all medicines"
  ON public.medicines FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can delete own medicines"
  ON public.medicines FOR DELETE
  USING (
    public.has_role(auth.uid(), 'manager') AND 
    auth.uid() = user_id
  );

-- ========================================
-- POLÍTICAS RLS PARA ABC_CONFIGURATIONS
-- ========================================

CREATE POLICY "Users can view own ABC config"
  ON public.abc_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ABC configs"
  ON public.abc_configurations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own ABC config"
  ON public.abc_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ABC config"
  ON public.abc_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ABC config"
  ON public.abc_configurations FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS PARA SAVED_DATASETS
-- ========================================

CREATE POLICY "Users can view own datasets"
  ON public.saved_datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all datasets"
  ON public.saved_datasets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own datasets"
  ON public.saved_datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets"
  ON public.saved_datasets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets"
  ON public.saved_datasets FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS PARA DASHBOARD_LAYOUTS
-- ========================================

CREATE POLICY "Users can view own layouts"
  ON public.dashboard_layouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all layouts"
  ON public.dashboard_layouts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own layouts"
  ON public.dashboard_layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own layouts"
  ON public.dashboard_layouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own layouts"
  ON public.dashboard_layouts FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS PARA ANALYSIS_HISTORY
-- ========================================

CREATE POLICY "Users can view own analysis"
  ON public.analysis_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analysis"
  ON public.analysis_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own analysis"
  ON public.analysis_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS PARA HTTP_SYNC_CONFIGS
-- ========================================

CREATE POLICY "Users can view own sync configs"
  ON public.http_sync_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sync configs"
  ON public.http_sync_configs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and managers can insert sync configs"
  ON public.http_sync_configs FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    (public.has_role(auth.uid(), 'manager') AND auth.uid() = user_id)
  );

CREATE POLICY "Users can update own sync configs"
  ON public.http_sync_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync configs"
  ON public.http_sync_configs FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS PARA SYNC_LOGS
-- ========================================

CREATE POLICY "Users can view own sync logs"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sync logs"
  ON public.sync_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own sync logs"
  ON public.sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);