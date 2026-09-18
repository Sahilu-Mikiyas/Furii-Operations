import React, { useState } from "react";
import { AdminSidebar } from "@/components/navigation/AdminSidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { CommandPalette } from "@/components/search/CommandPalette";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
