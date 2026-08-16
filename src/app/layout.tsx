import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "Fengxing | Cars & Car Care", template: "%s | Fengxing" },
  description: "A trusted way to find cars, sell with confidence, and book car care at home.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
