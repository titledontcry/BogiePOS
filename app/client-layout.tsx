"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"
import MobileNav from "@/components/layout/MobileNav"
import LoginForm from "@/components/auth/LoginForm"
import { useAuthStore } from "@/store/authStore"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, checkSession } = useAuthStore()
  const pathname = usePathname()
  const isPosPage = pathname === "/pos"
  const [showDashboard, setShowDashboard] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (isAuthenticated) {
      setIsTransitioning(true)
      // Slight delay to allow the fade-out transition to complete
      const timer = setTimeout(() => {
        setShowDashboard(true)
        setIsTransitioning(false)
      }, 550)
      return () => clearTimeout(timer)
    } else {
      setShowDashboard(false)
      setIsTransitioning(false)
    }
  }, [isAuthenticated])

  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F7]">
        <div className="text-center animate-pulse">
          <Loader2 className="animate-spin text-[#1D1D1F] mx-auto mb-4" size={32} />
          <p className="text-sm font-semibold text-[#6E6E73]">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and not transitioning, render LoginForm directly
  if (!isAuthenticated && !isTransitioning) {
    return <LoginForm />
  }

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground flex overflow-hidden relative">
      {/* Dashboard Layout - Fades in and scales gently from 98% to 100% */}
      <div 
        className={`flex-1 flex overflow-hidden w-full h-full transition-all duration-[600ms] ease-out ${
          showDashboard || isAuthenticated ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <TopBar />
          <main className={`flex-1 relative scroll-smooth min-h-0 flex flex-col ${isPosPage ? "overflow-hidden h-full" : "overflow-y-auto pb-20 lg:pb-6"}`}>
            {children}
          </main>
        </div>
        <MobileNav />
      </div>

      {/* Login Screen Overlay - Fades out and scales up slightly (zoom effect) */}
      {!showDashboard && (
        <div 
          className={`absolute inset-0 z-50 transition-all duration-[550ms] ease-in-out ${
            isTransitioning ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          <LoginForm />
        </div>
      )}
    </div>
  )
}
