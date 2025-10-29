-- ==========================================
-- MIGRATION: Estrutura Otimizada para MVP
-- ==========================================

-- 1. Adicionar coluna description (faltava no schema atual)
ALTER TABLE medicines 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Adicionar soft delete
ALTER TABLE medicines 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 3. Criar índices estratégicos
CREATE INDEX IF NOT EXISTS idx_medicines_org_class 
  ON medicines(organization_id, classification) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicines_org_value 
  ON medicines(organization_id, total_value DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicines_org_code 
  ON medicines(organization_id, code) 
  WHERE deleted_at IS NULL;

-- 4. Índice GIN para busca full-text em português
CREATE INDEX IF NOT EXISTS idx_medicines_search 
  ON medicines USING GIN (
    to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(code, ''))
  ) WHERE deleted_at IS NULL;

-- 5. Índice GIN para JSONB (campos extras)
CREATE INDEX IF NOT EXISTS idx_medicines_extra 
  ON medicines USING GIN (extra_data) 
  WHERE deleted_at IS NULL;

-- ==========================================
-- MATERIALIZED VIEW: KPIs Pré-calculados
-- ==========================================

DROP MATERIALIZED VIEW IF EXISTS medicine_kpis CASCADE;

CREATE MATERIALIZED VIEW medicine_kpis AS
SELECT 
  organization_id,
  COUNT(*) as total_items,
  
  -- Contagem por classe
  COUNT(*) FILTER (WHERE classification = 'A') as class_a_count,
  COUNT(*) FILTER (WHERE classification = 'B') as class_b_count,
  COUNT(*) FILTER (WHERE classification = 'C') as class_c_count,
  
  -- Valores totais
  COALESCE(SUM(total_value), 0) as total_value,
  COALESCE(SUM(total_value) FILTER (WHERE classification = 'A'), 0) as class_a_value,
  COALESCE(SUM(total_value) FILTER (WHERE classification = 'B'), 0) as class_b_value,
  COALESCE(SUM(total_value) FILTER (WHERE classification = 'C'), 0) as class_c_value,
  
  -- Estatísticas de preço
  COALESCE(AVG(unit_price), 0) as avg_price,
  COALESCE(MAX(unit_price), 0) as max_price,
  COALESCE(MIN(unit_price), 0) as min_price,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY unit_price), 0) as median_price,
  
  NOW() as last_updated
FROM medicines
WHERE deleted_at IS NULL
GROUP BY organization_id;

-- Índice único na view
CREATE UNIQUE INDEX ON medicine_kpis(organization_id);

-- ==========================================
-- TRIGGER: Auto-refresh da Materialized View
-- ==========================================

CREATE OR REPLACE FUNCTION refresh_medicine_kpis()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY medicine_kpis;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refresh_medicine_kpis ON medicines;

CREATE TRIGGER trigger_refresh_medicine_kpis
AFTER INSERT OR UPDATE OR DELETE ON medicines
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_medicine_kpis();

-- ==========================================
-- FUNCTION: Soft Delete
-- ==========================================

CREATE OR REPLACE FUNCTION soft_delete_medicine(medicine_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE medicines 
  SET deleted_at = NOW()
  WHERE id = medicine_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- FUNCTION: Busca Full-Text
-- ==========================================

CREATE OR REPLACE FUNCTION search_medicines(
  org_id UUID,
  search_term TEXT,
  limit_results INT DEFAULT 50
)
RETURNS SETOF medicines AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM medicines
  WHERE organization_id = org_id
    AND deleted_at IS NULL
    AND to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(code, '')) 
        @@ plainto_tsquery('portuguese', search_term)
  ORDER BY total_value DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==========================================
-- Atualizar estatísticas para query planner
-- ==========================================

ANALYZE medicines;