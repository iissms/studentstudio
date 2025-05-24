
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import type { User, UserRole } from '@/types'
import { decodeJwt } from 'jose'

interface JwtPayload {
  user_id: number;
  role: string; // Role from JWT, e.g., "CollegeAdmin"
  college_id?: number;
  name?: string; // Optional: if your JWT includes name
  email?: string; // Optional: if your JWT includes email
  iat?: number;
  exp?: number;
}

// Helper to map role strings from JWT to UserRole enum/type
// Ensures the role is one of the predefined UserRole types.
function mapJwtRoleToUserRole(jwtRole: string): UserRole | null {
  const upperCaseJwtRole = jwtRole.toUpperCase();
  const validRoles: UserRole[] = ["ADMIN", "COLLEGE_ADMIN", "TEACHER", "STUDENT", "GUEST"];
  
  if (validRoles.includes(upperCaseJwtRole as UserRole)) {
    // If the backend sends "CollegeAdmin", and UserRole includes "COLLEGE_ADMIN",
    // this direct cast is okay after validation.
    // Adjust this mapping if backend roles differ significantly in naming/casing.
    if (upperCaseJwtRole === "COLLEGEADMIN") return "COLLEGE_ADMIN"; // example specific mapping if needed
    return upperCaseJwtRole as UserRole;
  }
  
  // Handle cases like "Admin" vs "ADMIN" by checking common variations or logging.
  // For now, a direct check based on UserRole values.
  // Example: if backend sends "Admin" and UserRole is "ADMIN"
  if (jwtRole === "Admin" && validRoles.includes("ADMIN")) return "ADMIN";
  if (jwtRole === "CollegeAdmin" && validRoles.includes("COLLEGE_ADMIN")) return "COLLEGE_ADMIN";
  if (jwtRole === "Teacher" && validRoles.includes("TEACHER")) return "TEACHER";
  if (jwtRole === "Student" && validRoles.includes("STUDENT")) return "STUDENT";

  console.warn(`Unknown role from JWT: ${jwtRole}`);
  return null; // Or default to GUEST, or throw an error
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
    const decodedPayload = decodeJwt(tokenCookie.value) as JwtPayload;

    const userRole = mapJwtRoleToUserRole(decodedPayload.role);
    if (!userRole) {
      console.error('Invalid or unmapped role from JWT:', decodedPayload.role);
      return null;
    }

    // The JWT example payload has user_id (number), role (string).
    // User type expects id (string), name (string|null), email (string|null), role (UserRole).
    return {
      id: String(decodedPayload.user_id), // Convert number to string for User.id
      name: decodedPayload.name || null, // Use name from JWT if present, otherwise null
      email: decodedPayload.email || null, // Use email from JWT if present, otherwise null
      role: userRole,
    }
  } catch (error) {
    console.error('Failed to decode JWT or invalid token:', error)
    return null
  }
}
