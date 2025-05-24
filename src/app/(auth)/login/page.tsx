import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/icons' // Changed from 'Icons' to 'Logo'
import { siteConfig } from '@/config/site'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 justify-center">
            <Logo className="h-8 w-8" /> {/* Changed from Icons.Logo to Logo */}
            <CardTitle className="text-3xl font-bold tracking-tight">{siteConfig.name}</CardTitle>
          </Link>
          <CardDescription>
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
