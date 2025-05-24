export type UserRole = "ADMIN" | "COLLEGE_ADMIN" | "TEACHER" | "STUDENT" | "GUEST"

export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
}

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  external?: boolean
  label?: string
  description?: string
  roles?: UserRole[] // Roles that can see this nav item
}
