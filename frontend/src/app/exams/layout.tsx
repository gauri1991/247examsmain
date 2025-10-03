import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function ExamsLayout({
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