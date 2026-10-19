-- =============================================
-- Kassa API — Phase 1 schema
-- =============================================

CREATE TABLE organizations (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    slug        VARCHAR(255)    NOT NULL UNIQUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(320)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    locked_until    TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER         NOT NULL DEFAULT 0,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_org   ON app_users(organization_id);

CREATE TABLE shops (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    address         VARCHAR(500),
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_org ON shops(organization_id);

CREATE TABLE user_shops (
    id      UUID PRIMARY KEY,
    user_id UUID         NOT NULL REFERENCES app_users(id),
    shop_id UUID         NOT NULL REFERENCES shops(id),
    role    VARCHAR(50)  NOT NULL,
    CONSTRAINT uq_user_shop UNIQUE (user_id, shop_id),
    CONSTRAINT chk_role CHECK (role IN ('PROPRIETAIRE', 'GERANT', 'CAISSIER', 'MAGASINIER'))
);

CREATE INDEX idx_user_shops_user ON user_shops(user_id);
CREATE INDEX idx_user_shops_shop ON user_shops(shop_id);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY,
    token      VARCHAR(255) NOT NULL UNIQUE,
    user_id    UUID         NOT NULL REFERENCES app_users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens(user_id);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY,
    user_id     UUID,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   UUID,
    details     TEXT,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user      ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action    ON audit_logs(action);
CREATE INDEX idx_audit_logs_created   ON audit_logs(created_at);
