-- =============================================
-- Kassa API — Link suppliers to products
-- =============================================

ALTER TABLE products ADD COLUMN supplier_id UUID REFERENCES suppliers(id);

CREATE INDEX idx_products_supplier ON products(supplier_id);
