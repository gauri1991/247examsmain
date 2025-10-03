import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardSidebar>
      {children}
    </DashboardSidebar>
  )
}