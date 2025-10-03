"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Trophy,
  TrendingUp,
  GraduationCap,
  Library
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and stats"
  },
  {
    title: "Exams",
    url: "/exams",
    icon: BookOpen,
    description: "Browse available exams"
  },
  {
    title: "My Tests",
    url: "/tests",
    icon: FileText,
    description: "Your test attempts"
  },
  {
    title: "Results",
    url: "/dashboard/results", 
    icon: BarChart3,
    description: "Performance analysis"
  },
  {
    title: "Syllabus",
    url: "/dashboard/syllabus",
    icon: GraduationCap,
    description: "Study syllabus and track progress"
  },
  {
    title: "Study Materials",
    url: "/dashboard/study-materials",
    icon: Library,
    description: "Access videos and documents"
  },
  {
    title: "Advanced Analytics",
    url: "/dashboard/advanced-analytics",
    icon: TrendingUp,
    description: "AI-powered insights and trends"
  },
  {
    title: "Resume Tests",
    url: "/dashboard/resume-tests",
    icon: Trophy,
    description: "Continue incomplete tests"
  },
  {
    title: "Subscription",
    url: "/dashboard/subscription",
    icon: CreditCard,
    description: "Billing and subscriptions"
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Account preferences"
  }
]

interface DashboardSidebarProps {
  children: React.ReactNode
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider 
      defaultOpen={true}
      style={{
        "--sidebar-width": "12rem",
        "--sidebar-width-icon": "3rem"
      } as React.CSSProperties}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center space-x-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
            <div className="w-12 h-8 bg-black rounded-lg flex items-center justify-center px-1">
              <span className="text-white font-bold text-xl">247</span>
            </div>
            <span className="text-xl font-bold text-foreground group-data-[collapsible=icon]:hidden">Exams</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.url || 
                (item.url !== '/dashboard' && pathname.startsWith(item.url))
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center w-full [.group[data-state=collapsed]_&]:justify-center">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="ml-3 [.group[data-state=collapsed]_&]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
    </SidebarProvider>
  )
}