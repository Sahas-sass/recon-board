"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Briefcase } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-teal-900/30 bg-[#0f161b] p-6 hidden md:flex flex-col h-screen sticky top-0 text-white">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
          <Target size={18} className="text-[#0b1014]" />
        </div>
        <h1 className="text-xl font-bold tracking-wider">ReconBoard</h1>
      </div>

      <nav className="flex flex-col gap-4 text-gray-400">
        
        {/* Command Center Link */}
        <Link
          href="/"
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            pathname === "/"
              ? "text-teal-400 bg-teal-900/10 border-teal-500/20"
              : "border-transparent hover:text-white"
          }`}
        >
          <LayoutDashboard size={18} /> Command Center
        </Link>

        {/* Active Pipeline Link */}
        <Link
          href="/pipeline"
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            pathname.includes("/pipeline")
              ? "text-teal-400 bg-teal-900/10 border-teal-500/20"
              : "border-transparent hover:text-white"
          }`}
        >
          <Briefcase size={18} /> Active Pipeline
        </Link>

      </nav>
    </aside>
  );
}