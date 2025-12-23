import jwt from 'jsonwebtoken';

/**
 * JWT token utilities for authentication
 */

/**
 * JWT payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

/**
 * Get JWT secret from environment
 * Throws if not configured
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return secret;
}

/**
 * Sign a JWT token
 * @param payload Token payload
 * @param expiresIn Token expiration time (default: 24h)
 * @returns Signed JWT token
 */
export function signToken(payload: JwtPayload, expiresIn = '24h'): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param token JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Decode a JWT token without verification
 * Useful for debugging, but should not be used for authentication
 * @param token JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch {
    return null;
  }
}
