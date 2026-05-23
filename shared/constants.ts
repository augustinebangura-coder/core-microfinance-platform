// ============================================================================
// FORTRESS PALETTE - DESIGN SYSTEM COLORS
// ============================================================================

export const FORTRESS_PALETTE = {
  primaryNavy: '#0B2545',      // Enterprise Navy - Primary headers, sidebars
  trustBlue: '#133C55',        // Trust Blue - Accent buttons, links
  slateWhite: '#F8F9FA',       // Slate White - Background, cards
  complianceRed: '#D90429',    // Compliance Red - Alerts, high-risk flags
  successGreen: '#10B981',     // Success Green - Approved status
  warningYellow: '#F59E0B',    // Warning Yellow - Pending review
  darkGray: '#1F2937',         // Dark text
  lightGray: '#E5E7EB',        // Border, dividers
  offlineOrange: '#EA580C',    // Offline indicator
};

// ============================================================================
// USER ROLES & PERMISSIONS
// ============================================================================

export const USER_ROLES = {
  FIELD_OFFICER: 'field_officer',
  BRANCH_MANAGER: 'branch_manager',
  EXECUTIVE: 'executive',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.FIELD_OFFICER]: [
    'view:own_clients',
    'create:client_application',
    'capture:signature',
    'upload:photo',
    'sync:offline_data',
  ],
  [USER_ROLES.BRANCH_MANAGER]: [
    'view:branch_clients',
    'review:applications',
    'manage:field_officers',
    'export:reports',
  ],
  [USER_ROLES.EXECUTIVE]: [
    'view:all_data',
    'approve:applications',
    'reject:applications',
    'export:compliance_reports',
    'manage:users',
    'view:audit_trail',
  ],
};

// ============================================================================
// APPLICATION STATUS
// ============================================================================

export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  HIGH_RISK_DUPLICATE: 'high_risk_duplicate',
  FLAGGED: 'flagged',
} as const;

export const STATUS_COLORS = {
  [APPLICATION_STATUS.DRAFT]: '#9CA3AF',
  [APPLICATION_STATUS.PENDING_REVIEW]: '#F59E0B',
  [APPLICATION_STATUS.APPROVED]: '#10B981',
  [APPLICATION_STATUS.REJECTED]: '#D90429',
  [APPLICATION_STATUS.HIGH_RISK_DUPLICATE]: '#D90429',
  [APPLICATION_STATUS.FLAGGED]: '#D90429',
};

// ============================================================================
// PHONE NUMBER FORMAT
// ============================================================================

export const PHONE_COUNTRY_CODE = '+232';  // Sierra Leone
export const PHONE_REGEX = /^\+232\d{8,9}$/;  // +232 followed by 8-9 digits

// ============================================================================
// FILE UPLOAD CONSTRAINTS
// ============================================================================

export const FILE_CONSTRAINTS = {
  MAX_PHOTO_SIZE_KB: 150,          // 150KB max for compressed photos
  PHOTO_QUALITY: 0.7,              // JPEG quality for compression
  ALLOWED_PHOTO_TYPES: ['image/jpeg', 'image/png'],
  SIGNATURE_MAX_SIZE_KB: 50,       // Base64 signature max size
};

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
};

// ============================================================================
// COMPLIANCE & AUDIT
// ============================================================================

export const AUDIT_ACTIONS = {
  CREATE_APPLICATION: 'create_application',
  APPROVE_APPLICATION: 'approve_application',
  REJECT_APPLICATION: 'reject_application',
  SYNC_DATA: 'sync_data',
  VIEW_DATA: 'view_data',
  EXPORT_DATA: 'export_data',
} as const;

// ============================================================================
// ENCRYPTION
// ============================================================================

export const ENCRYPTION_ALGORITHM = 'xchacha20-poly1305';
export const SENSITIVE_FIELDS = [
  'national_identity_number',
  'digital_signature',
  'phone_number',
] as const;

// ============================================================================
// SIERRA LEONE 2026 REGULATORY FRAMEWORK
// ============================================================================

export const SIERRA_LEONE_REGULATIONS = {
  DATA_RETENTION_DAYS: 2555,        // ~7 years
  DUPLICATE_CHECK_WINDOW_DAYS: 365, // Check duplicates within 1 year
  AUDIT_TRAIL_REQUIRED: true,
  ENCRYPTION_REQUIRED: true,
  PHONE_NORMALIZATION_REQUIRED: true,
};
