/**
 * Security utilities for the banking portal
 * Provides masking, validation, simulated cryptographic hashing,
 * and rate-limiting safeguards.
 */

// Simple pseudo SHA-256 style hash generator for audit trails & PIN validation
export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex-like string
  const absHex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = Math.abs(hash * 31).toString(16).padStart(8, '0');
  return `0x${absHex}${salt}`.toUpperCase();
}

/**
 * Mask account number for display:
 * 883901249912 -> •••• •••• 9912
 */
export function maskAccountNumber(acc: string, visibleDigits: number = 4): string {
  if (!acc) return '•••• •••• ••••';
  const clean = acc.replace(/\s+/g, '');
  if (clean.length <= visibleDigits) return clean;
  const visible = clean.slice(-visibleDigits);
  const maskedLength = clean.length - visibleDigits;
  const maskedPart = '•'.repeat(maskedLength);
  
  // Format into chunks of 4
  const full = maskedPart + visible;
  return full.match(/.{1,4}/g)?.join(' ') || full;
}

/**
 * Mask SSN / Tax ID:
 * 123-45-6789 -> •••-••-6789
 */
export function maskSSN(ssn: string): string {
  if (!ssn) return '•••-••-••••';
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) return '•••-••-••••';
  const last4 = digits.slice(-4);
  return `•••-••-${last4}`;
}

/**
 * Mask Email for OTP / 2FA screen:
 * saikat.mohanty@example.com -> s***y@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '••••@••••.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(Math.max(2, user.length - 2))}${user[user.length - 1]}@${domain}`;
}

/**
 * Input sanitization to prevent XSS and script injections
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates transaction amounts
 */
export function validateAmount(amount: number | string): { valid: boolean; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid numeric amount' };
  }
  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than ₹0.00' };
  }
  if (num > 1000000) {
    return { valid: false, error: 'Exceeds maximum allowable transaction ceiling (₹1,000,000.00)' };
  }
  // Check decimal places (max 2)
  const parts = num.toString().split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  return { valid: true };
}

/**
 * Generates a mock simulated CSRF token for banking session
 */
export function generateCsrfToken(): string {
  return 'csrf-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generates an official reference ID
 */
export function generateReferenceId(prefix: 'TXN' | 'DEP' | 'WTH' | 'ADM' | 'USR' = 'TXN'): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${rand}`;
}

/**
 * Generates simulated realistic IP address for audit records
 */
export function getMockClientIp(): string {
  return `192.168.1.${Math.floor(10 + Math.random() * 80)}`;
}

/**
 * Shuffle array for PIN keypad randomization to prevent shoulder surfing
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
