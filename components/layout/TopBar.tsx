"use client"

import Image from "next/image"

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-background/88 backdrop-blur-md">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent border border-border shadow-[var(--shadow-soft)]">
          <Image 
            src="/logo.jpg" 
            alt="BogiePOS Logo" 
            width={28} 
            height={28} 
            className="rounded-xl object-cover"
          />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-foreground leading-none">
            BogiePOS
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">ร้านพร้อมขาย</p>
        </div>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />
    </header>
  )
}
