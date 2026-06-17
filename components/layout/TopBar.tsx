"use client"

import Image from "next/image"

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-md">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <Image 
          src="/logo.jpg" 
          alt="BogiePOS Logo" 
          width={28} 
          height={28} 
          className="rounded-md object-cover border border-border"
        />
        <div>
          <h1 className="text-sm font-bold text-foreground leading-none">
            BogiePOS
          </h1>
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Store</p>
        </div>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />
    </header>
  )
}
