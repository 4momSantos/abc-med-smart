-- Criar tabela otimizada com estrutura híbrida (campos principais + JSONB)
CREATE TABLE medicines_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid NOT NULL,
  
  -- Campos essenciais (indexáveis e frequentemente consultados)
  code text,
  name text NOT NULL,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  total_value numeric NOT NULL,
  classification char(1),
  
  -- Dados extras em JSONB (economia de ~70% de espaço)
  extra_data jsonb DEFAULT '{}'::jsonb,
  
  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_medicines_new_org ON medicines_new(organization_id);
CREATE INDEX idx_medicines_new_code ON medicines_new(code);
CREATE INDEX idx_medicines_new_name ON medicines_new(name);
CREATE INDEX idx_medicines_new_classification ON medicines_new(classification);
CREATE INDEX idx_medicines_new_extra_data ON medicines_new USING GIN (extra_data);
CREATE INDEX idx_medicines_new_created_at ON medicines_new(created_at DESC);

-- Migrar dados existentes para nova estrutura
INSERT INTO medicines_new (
  id, organization_id, user_id, code, name, quantity, unit_price, total_value, 
  classification, extra_data, created_at, updated_at
)
SELECT 
  id,
  organization_id,
  user_id,
  code,
  name,
  quantity,
  unit_price,
  total_value,
  classification,
  jsonb_strip_nulls(jsonb_build_object(
    'unit', unit,
    'category', category,
    'subcategory', subcategory,
    'supplier', supplier,
    'batch', batch,
    'expiration_date', expiration_date,
    'percentage', percentage,
    'accumulated_percentage', accumulated_percentage,
    'cumulative_percentage', cumulative_percentage,
    'value_percentage', value_percentage,
    'clinical_criticality', clinical_criticality,
    'requesting_sector', requesting_sector,
    'lead_time', lead_time,
    'min_stock', min_stock,
    'current_stock', current_stock,
    'reorder_point', reorder_point,
    'total_cost', total_cost,
    'stock_value', stock_value,
    'profit_margin', profit_margin,
    'discount', discount,
    'tax', tax,
    'movement_date', movement_date,
    'month', month,
    'year', year,
    'last_purchase_date', last_purchase_date,
    'consumption_frequency', consumption_frequency,
    'therapeutic_indication', therapeutic_indication,
    'active_ingredient', active_ingredient,
    'administration_route', administration_route,
    'special_control', special_control,
    'storage_temperature', storage_temperature,
    'seasonality', seasonality,
    'trend', trend,
    'volatility', volatility,
    'stockout_rate', stockout_rate,
    'cost_center', cost_center,
    'movement_type', movement_type,
    'invoice_number', invoice_number,
    'responsible', responsible,
    'needs_reorder', needs_reorder
  )),
  created_at,
  updated_at
FROM medicines;

-- Substituir tabela antiga pela nova
DROP TABLE medicines CASCADE;
ALTER TABLE medicines_new RENAME TO medicines;

-- Recriar RLS policies
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org medicines" 
ON medicines 
FOR SELECT 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org managers can insert medicines" 
ON medicines 
FOR INSERT 
WITH CHECK (has_org_role(auth.uid(), organization_id, 'org_manager'::text) OR has_org_role(auth.uid(), organization_id, 'org_admin'::text) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org managers can update medicines" 
ON medicines 
FOR UPDATE 
USING (has_org_role(auth.uid(), organization_id, 'org_manager'::text) OR has_org_role(auth.uid(), organization_id, 'org_admin'::text) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org admins can delete medicines" 
ON medicines 
FOR DELETE 
USING (has_org_role(auth.uid(), organization_id, 'org_admin'::text) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON medicines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();