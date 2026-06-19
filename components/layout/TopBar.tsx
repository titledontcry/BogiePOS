"use client"

import Image from "next/image"

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-background/88 backdrop-blur-md">
      {/* Mobile Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="h-10 w-10 rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-soft)] shrink-0">
          <Image 
            src="/logo.jpg" 
            alt="BogiePOS Logo" 
            width={40} 
            height={40} 
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-foreground leading-none">
            BogiePOS
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">ร้านพรีม</p>
        </div>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />
    </header>
  )
}
