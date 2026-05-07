import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Your custom ReconBoard metadata
export const metadata: Metadata = {
  title: "ReconBoard Command Center",
  description: "Automated job hunting pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#0b1014] text-white flex font-sans">
          
          {/* Global Sidebar */}
          <Sidebar />
          
          {/* Page Content swaps out here */}
          <div className="flex-1">
            {children}
          </div>
          
        </div>
      </body>
    </html>
  );
}