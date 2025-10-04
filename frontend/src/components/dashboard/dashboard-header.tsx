"use client"

import { Bell, Search, User, Settings, LogOut, CreditCard, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
  title?: string
}

export function DashboardHeader({ title = "Dashboard" }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 w-full shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6 w-full max-w-none">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <SidebarTrigger />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">247</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{title}</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search exams..."
              className="w-48 xl:w-64 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 rounded-lg">
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </Button>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-xl rounded-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-gray-900 leading-none">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.first_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-gray-500 font-medium">
                    {user?.email || 'No email'}
                  </p>
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                    <span className="text-xs font-semibold capitalize">{user?.role || 'Student'}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="hover:bg-blue-50 rounded-lg mx-2 my-1">
                <User className="mr-3 h-4 w-4 text-gray-600" />
                <span className="font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-green-50 rounded-lg mx-2 my-1">
                <CreditCard className="mr-3 h-4 w-4 text-gray-600" />
                <span className="font-medium">Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="hover:bg-purple-50 rounded-lg mx-2 my-1">
                <Settings className="mr-3 h-4 w-4 text-gray-600" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-orange-50 rounded-lg mx-2 my-1">
                <HelpCircle className="mr-3 h-4 w-4 text-gray-600" />
                <span className="font-medium">Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 rounded-lg mx-2 my-1">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}