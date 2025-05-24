import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import type { User } from '@/types'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const user = (await getUserFromCookies(cookieStore)) as User | null // Cast for type safety

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name || 'User'}!</CardTitle>
          <CardDescription>
            You are logged in as a <span className="font-semibold">{user.role}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your personalized dashboard. Select an option from the sidebar to get started.</p>
          {user.role === 'ADMIN' && (
            <p className="mt-4">As an Admin, you can manage colleges and users system-wide.</p>
          )}
          {user.role === 'COLLEGE_ADMIN' && (
            <p className="mt-4">As a College Admin, you can manage departments, classes, students, subjects, exams, and results for your college.</p>
          )}
          {user.role === 'TEACHER' && (
            <p className="mt-4">As a Teacher, you can enter student attendance and update results for your assigned exams.</p>
          )}
          {user.role === 'STUDENT' && (
            <p className="mt-4">As a Student, you can view your attendance and exam results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
