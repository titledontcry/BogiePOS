"use client"

import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"
import MobileNav from "@/components/layout/MobileNav"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] w-full bg-background text-foreground flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 relative scroll-smooth">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
