-- Tabela principal de medicamentos
CREATE TABLE public.medicines (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Campos Básicos
  code TEXT,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit_price DECIMAL NOT NULL,
  total_value DECIMAL NOT NULL,
  unit TEXT,
  clinical_criticality TEXT CHECK (clinical_criticality IN ('alta', 'média', 'baixa')),
  
  -- Classificação ABC
  classification CHAR(1) CHECK (classification IN ('A', 'B', 'C')),
  percentage DECIMAL,
  accumulated_percentage DECIMAL,
  cumulative_percentage DECIMAL,
  value_percentage DECIMAL,
  
  -- Campos Logísticos
  category TEXT,
  subcategory TEXT,
  supplier TEXT,
  lead_time INTEGER,
  min_stock DECIMAL,
  current_stock DECIMAL,
  reorder_point DECIMAL,
  batch TEXT,
  expiration_date DATE,
  
  -- Campos Financeiros
  total_cost DECIMAL,
  stock_value DECIMAL,
  profit_margin DECIMAL,
  discount DECIMAL,
  tax DECIMAL,
  
  -- Campos Temporais
  movement_date TIMESTAMPTZ,
  month INTEGER,
  year INTEGER,
  last_purchase_date DATE,
  consumption_frequency TEXT,
  
  -- Campos Clínicos
  therapeutic_indication TEXT,
  active_ingredient TEXT,
  administration_route TEXT,
  special_control BOOLEAN DEFAULT FALSE,
  storage_temperature TEXT,
  
  -- Campos Analíticos
  seasonality TEXT,
  trend TEXT,
  volatility DECIMAL,
  stockout_rate DECIMAL,
  
  -- Campos Operacionais
  requesting_sector TEXT,
  cost_center TEXT,
  movement_type TEXT,
  invoice_number TEXT,
  responsible TEXT,
  
  -- Campos Calculados
  needs_reorder BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX idx_medicines_classification ON public.medicines(classification);
CREATE INDEX idx_medicines_category ON public.medicines(category);
CREATE INDEX idx_medicines_supplier ON public.medicines(supplier);
CREATE INDEX idx_medicines_name ON public.medicines USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_medicines_created_at ON public.medicines(created_at DESC);

-- Trigger de updated_at
CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Configurações ABC por usuário
CREATE TABLE public.abc_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_a_threshold DECIMAL NOT NULL DEFAULT 80,
  class_b_threshold DECIMAL NOT NULL DEFAULT 95,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TRIGGER update_abc_configurations_updated_at
  BEFORE UPDATE ON public.abc_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Datasets salvos
CREATE TABLE public.saved_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  size_bytes BIGINT,
  import_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_datasets_user_id ON public.saved_datasets(user_id);
CREATE INDEX idx_saved_datasets_status ON public.saved_datasets(status);

-- Layouts de dashboard
CREATE TABLE public.dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  widgets JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_dashboard_layouts_updated_at
  BEFORE UPDATE ON public.dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Histórico de análises
CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('abc', 'ml_clustering', 'ml_anomaly', 'ml_forecast', 'statistics')),
  item_count INTEGER NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_type ON public.analysis_history(type);
CREATE INDEX idx_analysis_history_created_at ON public.analysis_history(created_at DESC);

-- Configurações de sincronização HTTP
CREATE TABLE public.http_sync_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id TEXT,
  api_url TEXT NOT NULL,
  method TEXT CHECK (method IN ('GET', 'POST', 'PUT')) DEFAULT 'GET',
  auth_username TEXT,
  auth_password TEXT,
  headers JSONB,
  query_params JSONB,
  body JSONB,
  timeout_ms INTEGER DEFAULT 30000,
  sync_interval INTEGER DEFAULT 3600000,
  data_mapping JSONB NOT NULL,
  transformations JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_http_sync_configs_updated_at
  BEFORE UPDATE ON public.http_sync_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Logs de sincronização
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sync_config_id UUID REFERENCES public.http_sync_configs(id) ON DELETE CASCADE,
  sync_id TEXT NOT NULL,
  tenant_id TEXT,
  type TEXT DEFAULT 'http_basic',
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('em_andamento', 'sucesso', 'erro')) NOT NULL,
  duration_ms INTEGER,
  attempts INTEGER DEFAULT 1,
  data JSONB DEFAULT '{}'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);