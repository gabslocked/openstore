import { cookies } from 'next/headers';
import { verifyToken, signToken, type JwtPayload } from './jwt';

/**
 * Session management utilities
 * Unified cookie-based authentication for both users and admins
 */

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Get the current session from cookies
 * @returns Session payload or null if not authenticated
 */
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Set a session cookie
 * @param payload User data to store in the session
 */
export async function setSession(payload: JwtPayload): Promise<void> {
  const cookieStore = await cookies();
  const token = signToken(payload);
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * Clear the session cookie (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Require an authenticated session
 * Throws if not authenticated
 * @returns Session payload
 */
export async function requireAuth(): Promise<JwtPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized: Authentication required');
  }

  return session;
}

/**
 * Require an admin session
 * Throws if not authenticated or not an admin
 * @returns Session payload
 */
export async function requireAdmin(): Promise<JwtPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized: Authentication required');
  }

  if (!session.isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

/**
 * Check if the current session is authenticated
 * @returns Whether the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Check if the current session is an admin
 * @returns Whether the user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.isAdmin === true;
}
