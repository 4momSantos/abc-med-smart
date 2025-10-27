-- Remover duplicatas existentes (mantém apenas o mais recente)
DELETE FROM medicines a
USING medicines b
WHERE a.id < b.id 
  AND a.code = b.code 
  AND a.organization_id = b.organization_id
  AND a.code IS NOT NULL;

-- Criar constraint para evitar duplicatas futuras
ALTER TABLE medicines 
ADD CONSTRAINT unique_code_per_org 
UNIQUE (code, organization_id);