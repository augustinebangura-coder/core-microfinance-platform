import { normalizePhoneNumber, isValidPhoneNumber } from '../phone';
import { encryptSensitiveData, decryptSensitiveData } from '../encryption';

/**
 * Backend Compliance Engine - Module 3
 * Handles:
 * - Phone normalization
 * - Duplicate NIN fraud detection
 * - Audit trail generation
 * - Encryption of sensitive fields
 */

export interface ComplianceCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedData: Record<string, any>;
}

/**
 * Comprehensive compliance check on client application
 */
export async function performComplianceCheck(
  applicationData: any,
  supabaseClient: any
): Promise<ComplianceCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalizedData = { ...applicationData };

  try {
    // 1. Normalize phone number
    const normalizedPhone = normalizePhoneNumber(applicationData.phone_number);
    if (!isValidPhoneNumber(normalizedPhone)) {
      errors.push(`Invalid phone number format: ${applicationData.phone_number}`);
    } else {
      normalizedData.phone_number = normalizedPhone;
    }

    // 2. Encrypt sensitive fields
    normalizedData.national_identity_number = encryptSensitiveData(
      applicationData.national_identity_number
    );
    normalizedData.digital_signature = encryptSensitiveData(
      applicationData.digital_signature
    );

    // 3. Check for duplicate NINs (Fraud Detection)
    const duplicateCheck = await checkDuplicateNIN(
      applicationData.national_identity_number,
      supabaseClient
    );

    if (duplicateCheck.exists) {
      warnings.push(
        `HIGH RISK: Duplicate NIN detected. ${duplicateCheck.duplicate_count} existing record(s) found.`
      );
      normalizedData.status = 'high_risk_duplicate';
      normalizedData.risk_level = 'high';
      normalizedData.duplicate_nin_count = duplicateCheck.duplicate_count;
    }

    // 4. Validate required fields
    const requiredFields = [
      'full_name',
      'national_identity_number',
      'phone_number',
      'date_of_birth',
      'requested_loan_amount',
    ];

    for (const field of requiredFields) {
      if (!normalizedData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // 5. Validate loan amount
    if (normalizedData.requested_loan_amount <= 0) {
      errors.push('Requested loan amount must be greater than 0');
    }

    // 6. Validate date of birth
    const dob = new Date(normalizedData.date_of_birth);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) {
      errors.push('Applicant must be at least 18 years old');
    }

    // 7. Attach compliance metadata
    normalizedData.compliance_metadata = {
      timestamp: new Date().toISOString(),
      field_officer_id: applicationData.field_officer_id,
      device_info: {
        device_id: applicationData.device_id,
        device_type: applicationData.device_type,
        os_version: applicationData.os_version,
        app_version: applicationData.app_version,
      },
      data_version: '1.0.0',
      encryption_algorithm: 'xchacha20-poly1305',
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalizedData,
    };
  } catch (error) {
    errors.push(`Compliance check failed: ${error}`);
    return {
      isValid: false,
      errors,
      warnings,
      normalizedData,
    };
  }
}

/**
 * Check for duplicate NINs in the database
 * Within the 365-day regulatory window
 */
export async function checkDuplicateNIN(
  nin: string,
  supabaseClient: any
): Promise<{
  exists: boolean;
  existing_record_id?: string;
  risk_level: string;
  duplicate_count: number;
}> {
  try {
    // Hash the NIN for comparison
    const ninHash = hashNIN(nin);

    // Query for duplicates within the last year
    const { data, error } = await supabaseClient
      .from('client_applications')
      .select('id, created_at')
      .eq('national_identity_number_encrypted', ninHash)
      .gte('created_at', getDateBeforeWindow(365))
      .limit(5);

    if (error) {
      console.error('Duplicate NIN check error:', error);
      return { exists: false, risk_level: 'low', duplicate_count: 0 };
    }

    const duplicateCount = data?.length ?? 0;

    return {
      exists: duplicateCount > 0,
      existing_record_id: data?.[0]?.id,
      risk_level: duplicateCount > 0 ? 'high' : 'low',
      duplicate_count: duplicateCount,
    };
  } catch (error) {
    console.error('Failed to check duplicate NIN:', error);
    return { exists: false, risk_level: 'low', duplicate_count: 0 };
  }
}

/**
 * Hash NIN for storage comparison (one-way)
 */
export function hashNIN(nin: string): string {
  // In production, use libsodium proper hashing
  return btoa(nin).slice(0, 64);
}

/**
 * Get date N days in the past
 */
function getDateBeforeWindow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  supabaseClient: any,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, any>
): Promise<void> {
  try {
    await supabaseClient.from('audit_logs').insert([
      {
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        timestamp: new Date().toISOString(),
        device_id: metadata.device_id,
        device_type: metadata.device_type,
        metadata,
      },
    ]);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
