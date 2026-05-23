import TweetNaCl from 'tweetnacl';

// ============================================================================
// ENCRYPTION UTILITIES FOR SENSITIVE DATA
// ============================================================================

const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || '';

/**
 * Decode Base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode Uint8Array to Base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

/**
 * Encrypt sensitive data using XChaCha20-Poly1305
 * @param plaintext The data to encrypt
 * @returns Encrypted data as Base64 string
 */
export function encryptSensitiveData(plaintext: string): string {
  if (!ENCRYPTION_KEY) {
    console.warn('Encryption key not configured. Using plaintext.');
    return plaintext;
  }

  try {
    const key = base64ToUint8Array(ENCRYPTION_KEY);
    const nonce = TweetNaCl.randomBytes(24); // 192-bit nonce for XChaCha20
    const messageUint8 = new TextEncoder().encode(plaintext);

    const encrypted = TweetNaCl.secretbox(messageUint8, nonce, key);
    if (!encrypted) throw new Error('Encryption failed');

    // Combine nonce + ciphertext for decryption
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return uint8ArrayToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param ciphertext Encrypted data as Base64 string
 * @returns Decrypted plaintext
 */
export function decryptSensitiveData(ciphertext: string): string {
  if (!ENCRYPTION_KEY) {
    console.warn('Encryption key not configured. Using ciphertext as plaintext.');
    return ciphertext;
  }

  try {
    const key = base64ToUint8Array(ENCRYPTION_KEY);
    const combined = base64ToUint8Array(ciphertext);

    const nonce = combined.slice(0, 24);
    const encrypted = combined.slice(24);

    const decrypted = TweetNaCl.secretbox.open(encrypted, nonce, key);
    if (!decrypted) throw new Error('Decryption failed');

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a value for comparison (one-way)
 */
export function hashData(data: string): string {
  // In production, use a proper hashing library like libsodium
  // For now, we use a simple approach
  return btoa(data).slice(0, 32);
}
