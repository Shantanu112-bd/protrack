/**
 * Simple encryption/decryption utilities for demo purposes
 * In a real implementation, you would use proper cryptographic libraries
 */

/**
 * Simple encryption function (for demo purposes only)
 * @param data Data to encrypt
 * @param key Encryption key
 * @returns Encrypted data
 */
export function encryptData(data: string, key: string): string {
  // This is a simple XOR encryption for demo purposes only
  // In a real implementation, use proper encryption libraries like AES
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result); // Base64 encode for storage
}

/**
 * Simple decryption function (for demo purposes only)
 * @param encryptedData Encrypted data
 * @param key Encryption key
 * @returns Decrypted data
 */
export function decryptData(encryptedData: string, key: string): string {
  // This is a simple XOR decryption for demo purposes only
  // In a real implementation, use proper decryption libraries
  const data = atob(encryptedData); // Base64 decode
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Generate a random key for encryption
 * @returns Random key string
 */
export function generateRandomKey(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Hash function for RFID data
 * @param data Data to hash
 * @returns Hashed data
 */
export function hashRFIDData(data: string): string {
  // Simple hash function for demo purposes
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, "0")}`;
}
