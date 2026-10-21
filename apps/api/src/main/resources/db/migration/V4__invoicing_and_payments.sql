-- =============================================
-- Kassa API — Phase 3: Invoicing & Payments
-- =============================================

-- Customers (optional, for named invoices)
CREATE TABLE customers (
    id              UUID PRIMARY KEY,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255)    NOT NULL,
    phone           VARCHAR(50),
    email           VARCHAR(320),
    address         VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_org ON customers(organization_id);

-- Invoices
CREATE TABLE invoices (
    id              UUID PRIMARY KEY,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    shop_id         UUID            NOT NULL REFERENCES shops(id),
    customer_id     UUID            REFERENCES customers(id),
    invoice_number  VARCHAR(50)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    subtotal        NUMERIC(14, 2)  NOT NULL DEFAULT 0,
    tax_total       NUMERIC(14, 2)  NOT NULL DEFAULT 0,
    total           NUMERIC(14, 2)  NOT NULL DEFAULT 0,
    amount_paid     NUMERIC(14, 2)  NOT NULL DEFAULT 0,
    notes           TEXT,
    created_by      UUID            REFERENCES app_users(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_invoice_number_org UNIQUE (organization_id, invoice_number),
    CONSTRAINT chk_invoice_status CHECK (status IN ('DRAFT', 'VALIDATED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'))
);

CREATE INDEX idx_invoices_org      ON invoices(organization_id);
CREATE INDEX idx_invoices_shop     ON invoices(shop_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_invoices_created  ON invoices(created_at);

-- Invoice lines
CREATE TABLE invoice_lines (
    id          UUID PRIMARY KEY,
    invoice_id  UUID            NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id  UUID            NOT NULL REFERENCES products(id),
    product_name VARCHAR(255)   NOT NULL,
    quantity    INTEGER         NOT NULL,
    unit_price  NUMERIC(12, 2) NOT NULL,
    tva_rate    NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    line_total  NUMERIC(14, 2) NOT NULL,
    sort_order  INTEGER        NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);

-- Payments
CREATE TABLE payments (
    id          UUID PRIMARY KEY,
    invoice_id  UUID            NOT NULL REFERENCES invoices(id),
    method      VARCHAR(30)     NOT NULL,
    amount      NUMERIC(14, 2)  NOT NULL,
    reference   VARCHAR(255),
    notes       TEXT,
    received_by UUID            REFERENCES app_users(id),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_method CHECK (method IN ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'OTHER'))
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_method  ON payments(method);
CREATE INDEX idx_payments_created ON payments(created_at);
