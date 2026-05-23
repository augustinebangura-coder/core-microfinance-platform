// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: 'field_officer' | 'branch_manager' | 'executive';
  branch_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// ============================================================================
// CLIENT APPLICATION
// ============================================================================

export interface ClientApplication {
  id: string;
  full_name: string;
  national_identity_number: string;  // Encrypted
  phone_number: string;               // Normalized to +232XXXXXXXXX
  date_of_birth: string;              // ISO 8601
  requested_loan_amount: number;
  currency: 'SLL' | 'USD';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'flagged' | 'high_risk_duplicate';
  photo_url: string;                  // Compressed image URL or Base64
  digital_signature: string;          // Encrypted Base64
  field_officer_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
  approved_by_id?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface CreateClientApplicationDTO {
  full_name: string;
  national_identity_number: string;
  phone_number: string;
  date_of_birth: string;
  requested_loan_amount: number;
  currency: 'SLL' | 'USD';
  photo_file?: File | string;         // File or Base64
  digital_signature: string;          // Base64 canvas drawing
  device_info: DeviceInfo;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  timestamp: string;
  device_info: DeviceInfo;
}

export interface DeviceInfo {
  device_id: string;
  device_type: 'mobile' | 'web';
  os_version: string;
  app_version: string;
  user_agent: string;
}

// ============================================================================
// OFFLINE SYNC
// ============================================================================

export interface OfflineSyncQueue {
  id: string;
  user_id: string;
  application_data: ClientApplication;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error_message?: string;
  retry_count: number;
  created_at: string;
  synced_at?: string;
}

export interface SyncStatus {
  is_online: boolean;
  pending_count: number;
  last_sync: string | null;
  sync_in_progress: boolean;
}

// ============================================================================
// COMPLIANCE & RISK
// ============================================================================

export interface DuplicateNINCheck {
  exists: boolean;
  existing_record_id?: string;
  risk_level: 'low' | 'medium' | 'high';
  duplicate_count: number;
}

export interface ComplianceMetadata {
  timestamp: string;
  field_officer_id: string;
  device_info: DeviceInfo;
  data_version: string;
  encryption_algorithm: string;
}

// ============================================================================
// EXECUTIVE DASHBOARD
// ============================================================================

export interface DashboardMetrics {
  total_processed: number;
  pending_syncs: number;
  action_required: number;
  approval_rate: number;
  flagged_applications: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export interface SearchFilters {
  search_query?: string;
  status?: string[];
  branch_id?: string;
  date_from?: string;
  date_to?: string;
  risk_level?: 'low' | 'medium' | 'high';
}
