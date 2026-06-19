import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import ClientLayout from "./client-layout";

const sfProTH = localFont({
  src: "../SFProTH_regular.woff.ttf",
  variable: "--font-sfpro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BogiePOS — ระบบขายหน้าร้าน",
  description: "ระบบ POS สำหรับร้านเสื้อผ้า จัดการสินค้า ขาย โปรโมชั่น และดูสรุปยอดขาย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning className={`${sfProTH.variable} antialiased`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ClientLayout>{children}</ClientLayout>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
