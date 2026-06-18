/**
 * Symmetric AES-256-CBC encryption/decryption helpers.
 * Used to securely store SMTP passwords and sensitive credentials in the database.
 * Key is derived from JWT_SECRET environment variable (padded/truncated to 32 bytes).
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const ENC_PREFIX = 'ENC:';

/**
 * Derives a 32-byte key from the application secret.
 */
function getDerivedKey() {
  const secret = process.env.JWT_SECRET || 'hireflow-ai-default-secret-key-fallback';
  // Use SHA-256 to produce a stable 32-byte key from any length secret
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * Returns a string in the format: "ENC:<iv_hex>:<encrypted_hex>"
 *
 * @param {string} plaintext - The value to encrypt
 * @returns {string} - Encrypted value with IV prefix
 */
function encrypt(plaintext) {
  if (!plaintext) return plaintext;
  // If already encrypted, skip
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext;

  try {
    const key = getDerivedKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return `${ENC_PREFIX}${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (err) {
    console.error('Encryption failed:', err.message);
    return plaintext; // Return plaintext as fallback to avoid breaking app
  }
}

/**
 * Decrypts a value encrypted with the `encrypt()` function.
 * If the value is not encrypted (no ENC: prefix), returns it as-is.
 *
 * @param {string} encryptedValue - The encrypted value (or plaintext)
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedValue) {
  if (!encryptedValue) return encryptedValue;
  // If not encrypted, return as-is (handles legacy plaintext values)
  if (!encryptedValue.startsWith(ENC_PREFIX)) return encryptedValue;

  try {
    const raw = encryptedValue.slice(ENC_PREFIX.length);
    const [ivHex, encryptedHex] = raw.split(':');
    if (!ivHex || !encryptedHex) return encryptedValue;

    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return ''; // Return empty string on decryption failure to avoid leaking bad data
  }
}

/**
 * Returns true if the value is already encrypted.
 */
function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}

module.exports = { encrypt, decrypt, isEncrypted };
