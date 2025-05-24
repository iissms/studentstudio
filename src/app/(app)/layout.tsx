import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth-utils'
import { AppShellClient } from '@/components/layout/AppShellClient'
import type { User } from '@/types'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const user = await getUserFromCookies(cookieStore)

  if (!user) {
    // This should ideally be caught by middleware, but as a safeguard:
    redirect('/login')
  }
  
  // Cast to User as getUserFromCookies might return a more generic type or null (which is handled above)
  const typedUser: User = user as User;

  return <AppShellClient user={typedUser}>{children}</AppShellClient>
}
