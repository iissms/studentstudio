
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import type { User, UserRole } from '@/types'
import { decodeJwt } from 'jose'

interface JwtPayload {
  user_id: number; // Expecting numeric user_id from JWT
  role: string;
  college_id?: number;
  name?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

function mapJwtRoleToUserRole(jwtRole: string): UserRole | null {
  const upperCaseJwtRole = jwtRole.toUpperCase();
  // Ensure mapping matches UserRole type and potential JWT role strings
  const roleMap: Record<string, UserRole> = {
    "ADMIN": "ADMIN",
    "COLLEGEADMIN": "COLLEGE_ADMIN", // If JWT sends "CollegeAdmin"
    "COLLEGE_ADMIN": "COLLEGE_ADMIN", // If JWT sends "COLLEGE_ADMIN"
    "TEACHER": "TEACHER",
    "STUDENT": "STUDENT",
  };

  if (roleMap[upperCaseJwtRole]) {
    return roleMap[upperCaseJwtRole];
  }

  // Fallback for direct match if not in map (e.g. "GUEST")
  const validRoles: UserRole[] = ["ADMIN", "COLLEGE_ADMIN", "TEACHER", "STUDENT", "GUEST"];
  if (validRoles.includes(upperCaseJwtRole as UserRole)) {
    return upperCaseJwtRole as UserRole;
  }

  console.warn(`Unknown role from JWT: ${jwtRole}`);
  return null;
}


export async function getUserFromCookies(
  cookies: ReadonlyRequestCookies
): Promise<User | null> {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  const tokenCookie = cookies.get(AUTH_COOKIE_NAME)

  if (!tokenCookie || !tokenCookie.value) {
    return null
  }

  try {
    // Use jose to decode the JWT
    const decodedPayload = decodeJwt(tokenCookie.value) as JwtPayload;

    const userRole = mapJwtRoleToUserRole(decodedPayload.role);
    if (!userRole) {
      console.error('Invalid or unmapped role from JWT:', decodedPayload.role);
      return null;
    }

    return {
      id: String(decodedPayload.user_id), // Convert numeric user_id from JWT to string for User.id
      name: decodedPayload.name || null,
      email: decodedPayload.email || null,
      role: userRole,
      college_id: decodedPayload.college_id, // Ensure college_id is passed
    }
  } catch (error) {
    console.error('Failed to decode JWT or invalid token:', error)
    return null
  }
}
