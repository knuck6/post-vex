import { Geist_Mono, Oxanium } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import "dotenv/config";
import ConvexClientProvider from "@/components/ConvexProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", oxanium.variable)}
    >
      <body>
       <TooltipProvider>
        <ConvexClientProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        </ConvexClientProvider>
       </TooltipProvider>
      </body>
    </html>
  )
}
