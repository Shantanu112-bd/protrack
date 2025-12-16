-- Create missing tables for ProTrack system

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    from_party UUID REFERENCES users(id) NOT NULL,
    to_party UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'requested',
    mpc_tx_id VARCHAR(255),
    temp_key_id VARCHAR(255),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    tracking_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipments_product_id ON shipments(product_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipments
CREATE POLICY IF NOT EXISTS "Shipments accessible to involved parties" ON shipments
    FOR SELECT USING (
        from_party = (
            SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
        OR to_party = (
            SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
        OR EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
            AND r.name = 'admin'
        )
    );

-- RLS Policies for notifications
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON notifications
    FOR SELECT USING (
        user_id = (
            SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- RLS Policies for audit logs (admin only)
CREATE POLICY IF NOT EXISTS "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
            AND r.name = 'admin'
        )
    );