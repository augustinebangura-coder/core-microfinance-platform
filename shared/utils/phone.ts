import { PHONE_COUNTRY_CODE, PHONE_REGEX } from '../constants';

/**
 * Normalize phone number to Sierra Leone format (+232XXXXXXXXX)
 * Strips all spaces, symbols, and formats consistently
 * @param phoneNumber Raw phone number input
 * @returns Normalized phone number in +232XXXXXXXXX format
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';

  // Remove all spaces, hyphens, parentheses, and other symbols
  let cleaned = phoneNumber.replace(/[\s\-().\/]/g, '');

  // Remove leading zeros if present (before country code addition)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Handle already formatted numbers (+232...)
  if (cleaned.startsWith('+232')) {
    return cleaned;
  }

  // Handle 232 without +
  if (cleaned.startsWith('232')) {
    return '+' + cleaned;
  }

  // For raw local numbers, add +232
  return PHONE_COUNTRY_CODE + cleaned;
}

/**
 * Validate normalized phone number format
 * @param phoneNumber Normalized phone number
 * @returns true if valid Sierra Leone format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return PHONE_REGEX.test(phoneNumber);
}

/**
 * Extract phone number digits only (without +232)
 * @param phoneNumber Normalized phone number
 * @returns Digits only
 */
export function getPhoneDigits(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}
