import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Ensure Inter is available or rely on standard sans
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] }); // Keep Inter as primary

export const metadata: Metadata = {
  title: "VC Portfolio OS",
  description: "Venture Capital Investment Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
