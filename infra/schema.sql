-- ============================================================================
-- C.O.R.E. MICROFINANCE PLATFORM - POSTGRESQL SCHEMA
-- Sierra Leone 2026 Compliance Framework
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('field_officer', 'branch_manager', 'executive')),
  branch_id UUID,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BRANCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CLIENT APPLICATIONS (CORE BUSINESS TABLE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  
  -- Sensitive fields (encrypted at rest)
  national_identity_number_encrypted VARCHAR(500) NOT NULL,
  phone_number_normalized VARCHAR(20) NOT NULL, -- +232XXXXXXXXX format
  
  date_of_birth DATE NOT NULL,
  requested_loan_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SLL',
  
  -- Media & Signatures
  photo_url TEXT,
  digital_signature_encrypted TEXT, -- Base64 canvas drawing (encrypted)
  
  -- Status & Risk
  status VARCHAR(50) DEFAULT 'draft' CHECK (
    status IN ('draft', 'pending_review', 'approved', 'rejected', 'flagged', 'high_risk_duplicate')
  ),
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  duplicate_nin_count INT DEFAULT 0,
  
  -- Ownership & Approval
  field_officer_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  approved_by_id UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Compliance Metadata (Audit Trail)
  device_id VARCHAR(255),
  device_type VARCHAR(50), -- mobile, web
  os_version VARCHAR(50),
  app_version VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(national_identity_number_encrypted, branch_id)
);

-- ============================================================================
-- AUDIT LOG (Compliance & Regulatory Requirement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  
  -- Action details
  old_values JSONB,
  new_values JSONB,
  
  -- Device info
  device_id VARCHAR(255),
  device_type VARCHAR(50),
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- OFFLINE SYNC QUEUE (For mobile app)
-- ============================================================================

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  application_id UUID REFERENCES client_applications(id),
  application_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP
);

-- ============================================================================
-- DUPLICATE NIN DETECTION LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_nin_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES client_applications(id),
  nin_hash VARCHAR(255) NOT NULL,
  duplicate_count INT,
  existing_record_ids UUID[],
  risk_level VARCHAR(20),
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch_id ON users(branch_id);

CREATE INDEX idx_client_applications_field_officer_id ON client_applications(field_officer_id);
CREATE INDEX idx_client_applications_branch_id ON client_applications(branch_id);
CREATE INDEX idx_client_applications_status ON client_applications(status);
CREATE INDEX idx_client_applications_risk_level ON client_applications(risk_level);
CREATE INDEX idx_client_applications_created_at ON client_applications(created_at);
CREATE INDEX idx_client_applications_phone_normalized ON client_applications(phone_number_normalized);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

CREATE INDEX idx_offline_sync_queue_user_id ON offline_sync_queue(user_id);
CREATE INDEX idx_offline_sync_queue_status ON offline_sync_queue(status);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- Field Officers: Can only view/edit their own clients
CREATE POLICY field_officer_clients ON client_applications
  FOR SELECT USING (
    auth.uid() = field_officer_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'executive'
  );

CREATE POLICY field_officer_create_clients ON client_applications
  FOR INSERT WITH CHECK (
    auth.uid() = field_officer_id
  );

CREATE POLICY field_officer_update_own_clients ON client_applications
  FOR UPDATE USING (
    auth.uid() = field_officer_id AND status = 'draft'
  );

-- Executives: Can view all, approve/reject
CREATE POLICY executive_all_clients ON client_applications
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'executive'
  );

CREATE POLICY executive_approve_reject ON client_applications
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'executive'
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'executive'
  );

-- Audit logs: Only executives can view
CREATE POLICY view_audit_logs ON audit_logs
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'executive'
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_applications_updated_at BEFORE UPDATE ON client_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log create/update actions
CREATE OR REPLACE FUNCTION log_application_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, 
    old_values, new_values, device_id, device_type
  ) VALUES (
    auth.uid(),
    TG_ARGV[0],
    'client_application',
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW),
    NEW.device_id,
    NEW.device_type
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_application_create AFTER INSERT ON client_applications
  FOR EACH ROW EXECUTE FUNCTION log_application_changes('CREATE');

CREATE TRIGGER log_application_update AFTER UPDATE ON client_applications
  FOR EACH ROW EXECUTE FUNCTION log_application_changes('UPDATE');

-- ============================================================================
-- SAMPLE DATA (Demo)
-- ============================================================================

-- Insert demo users
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('officer@microfinance.com', '$2a$10$demo_hash_here', 'field_officer', 'John', 'Officer'),
('manager@microfinance.com', '$2a$10$demo_hash_here', 'branch_manager', 'Jane', 'Manager'),
('executive@microfinance.com', '$2a$10$demo_hash_here', 'executive', 'Admin', 'Executive')
ON CONFLICT DO NOTHING;

-- Insert demo branch
INSERT INTO branches (name, location) VALUES
('Freetown Main', 'Freetown') ON CONFLICT DO NOTHING;
