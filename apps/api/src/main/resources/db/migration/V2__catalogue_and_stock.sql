-- =============================================
-- Kassa API — Phase 2: Catalogue & Stock
-- =============================================

-- Categories (hierarchical via parent_id)
CREATE TABLE categories (
    id              UUID PRIMARY KEY,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255)    NOT NULL,
    parent_id       UUID            REFERENCES categories(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_org    ON categories(organization_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Suppliers
CREATE TABLE suppliers (
    id              UUID PRIMARY KEY,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255)    NOT NULL,
    phone           VARCHAR(50),
    email           VARCHAR(320),
    address         VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_org ON suppliers(organization_id);

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    sku             VARCHAR(100)    NOT NULL,
    barcode         VARCHAR(100),
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    category_id     UUID            REFERENCES categories(id),
    unit            VARCHAR(50),
    buy_price       NUMERIC(12, 2),
    sell_price      NUMERIC(12, 2),
    tva_rate        NUMERIC(5, 2)   NOT NULL DEFAULT 0,
    alert_threshold INTEGER         NOT NULL DEFAULT 5,
    photo_url       VARCHAR(1000),
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_sku_org UNIQUE (organization_id, sku)
);

CREATE INDEX idx_products_org      ON products(organization_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku      ON products(sku);
CREATE INDEX idx_products_barcode  ON products(barcode);

-- Stock levels (per shop per product, with optimistic locking)
CREATE TABLE stock_levels (
    id         UUID PRIMARY KEY,
    shop_id    UUID    NOT NULL REFERENCES shops(id),
    product_id UUID    NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL DEFAULT 0,
    version    INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_stock_shop_product UNIQUE (shop_id, product_id)
);

CREATE INDEX idx_stock_levels_shop    ON stock_levels(shop_id);
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);

-- Stock movements (append-only audit trail)
CREATE TABLE stock_movements (
    id           UUID PRIMARY KEY,
    shop_id      UUID         NOT NULL REFERENCES shops(id),
    product_id   UUID         NOT NULL REFERENCES products(id),
    type         VARCHAR(50)  NOT NULL,
    quantity     INTEGER      NOT NULL,
    reason       TEXT,
    reference_id UUID,
    created_by   UUID         REFERENCES app_users(id),
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_movement_type CHECK (type IN ('ENTRY', 'EXIT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'INVENTORY'))
);

CREATE INDEX idx_stock_movements_shop       ON stock_movements(shop_id);
CREATE INDEX idx_stock_movements_product    ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type       ON stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_reference  ON stock_movements(reference_id);
