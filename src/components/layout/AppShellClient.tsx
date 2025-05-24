'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  PanelLeft,
  Home,
  Users,
  Building,
  BookCopy,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Settings,
  BarChart3,
  LogOut,
  ShieldCheck,
  University,
  Library,
  NotebookTabs,
  ClipboardList,
  Newspaper,
} from 'lucide-react'

import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePathname } from 'next/navigation'
import { logoutUser } from '@/lib/actions'
import type { User, NavItem, UserRole } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AppShellClientProps {
  user: User
  children: React.ReactNode
}

const getNavigationItems = (role: UserRole): NavItem[] => {
  const allNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT'] },
    // Admin
    { title: 'Manage Colleges', href: '/admin/colleges', icon: University, roles: ['ADMIN'] },
    { title: 'Manage Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
    // College Admin
    { title: 'Manage Departments', href: '/college-admin/departments', icon: Building, roles: ['COLLEGE_ADMIN'] },
    { title: 'Manage Classes', href: '/college-admin/classes', icon: Library, roles: ['COLLEGE_ADMIN'] },
    { title: 'Manage Students', href: '/college-admin/students', icon: GraduationCap, roles: ['COLLEGE_ADMIN'] },
    { title: 'Manage Subjects', href: '/college-admin/subjects', icon: BookCopy, roles: ['COLLEGE_ADMIN'] },
    { title: 'Manage Exams', href: '/college-admin/exams', icon: Newspaper, roles: ['COLLEGE_ADMIN'] },
    { title: 'Enter Results', href: '/college-admin/results', icon: ClipboardList, roles: ['COLLEGE_ADMIN'] },
    // Teacher
    { title: 'Enter Attendance', href: '/teacher/attendance', icon: ClipboardCheck, roles: ['TEACHER'] },
    { title: 'Update Results', href: '/teacher/results', icon: NotebookTabs, roles: ['TEACHER'] },
    // Student
    { title: 'View Attendance', href: '/student/attendance', icon: BarChart3, roles: ['STUDENT'] },
    { title: 'View Results', href: '/student/results', icon: FileText, roles: ['STUDENT'] },
    // Common
    { title: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT'] },
  ]

  return allNavItems.filter(item => item.roles?.includes(role));
}


function UserNav({ user }: { user: User }) {
  const handleLogout = async () => {
    await logoutUser()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name?.charAt(0) || 'U'}`} alt={user.name || 'User'} data-ai-hint="user avatar"/>
            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarNavigation({ user }: { user: User }) {
  const pathname = usePathname()
  const navItems = getNavigationItems(user.role)
  const { state } = useSidebar()

  return (
    <ScrollArea className="h-full">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              tooltip={state === 'collapsed' ? item.title : undefined}
            >
              <Link href={item.href}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </ScrollArea>
  )
}


export function AppShellClient({ user, children }: AppShellClientProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-3">
            <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <Icons.Logo className="h-7 w-7 text-primary" />
              <span className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">{siteConfig.name}</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
             <SidebarNavigation user={user} />
          </SidebarContent>
          <SidebarFooter className="p-2 border-t group-data-[collapsible=icon]:hidden">
            <div className="text-xs text-sidebar-foreground/70">
              &copy; {new Date().getFullYear()} {siteConfig.name}
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto flex items-center gap-4">
              <UserNav user={user} />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
