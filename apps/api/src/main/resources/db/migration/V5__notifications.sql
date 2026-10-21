-- =============================================
-- Kassa API — Phase 5: Notifications
-- =============================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY,
    organization_id UUID            NOT NULL REFERENCES organizations(id),
    user_id         UUID            REFERENCES app_users(id),
    shop_id         UUID            REFERENCES shops(id),
    type            VARCHAR(50)     NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    message         TEXT            NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    read            BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (type IN (
        'STOCK_ALERT', 'STOCK_OUT', 'INVOICE_OVERDUE', 'STOCK_MOVEMENT', 'INVOICE_PAID', 'SYSTEM'
    ))
);

CREATE INDEX idx_notifications_org       ON notifications(organization_id);
CREATE INDEX idx_notifications_user      ON notifications(user_id);
CREATE INDEX idx_notifications_read      ON notifications(read);
CREATE INDEX idx_notifications_created   ON notifications(created_at);
CREATE INDEX idx_notifications_type      ON notifications(type);
