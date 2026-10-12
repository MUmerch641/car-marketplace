import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toast";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const manrope = localFont({
  src: [
    { path: "./fonts/manrope-regular.ttf", weight: "400" },
    { path: "./fonts/manrope-medium.ttf", weight: "500" },
    { path: "./fonts/manrope-semibold.ttf", weight: "600" },
    { path: "./fonts/manrope-bold.ttf", weight: "700 900" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Shaz | Car care on your terms", template: "%s | Shaz" },
  icons: { apple: "/shaz/icon.png" },
  description:
    "Book mobile oil changes, arrange vehicle inspections, and buy or sell cars with confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
