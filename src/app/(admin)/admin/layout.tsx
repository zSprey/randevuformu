"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Login page should NOT render the sidebar or dashboard frame
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFBFC] text-slate-800 font-sans antialiased selection:bg-[#0062FF]/10 selection:text-[#0062FF]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
