import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Shaz | Cars & Car Care", template: "%s | Shaz" },
  description: "Book mobile oil changes, arrange vehicle inspections, and buy or sell cars with confidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="shaz-motion">
        <NextTopLoader color="#E94A3F" showSpinner={false} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
