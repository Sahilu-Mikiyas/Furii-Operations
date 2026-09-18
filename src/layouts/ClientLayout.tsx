import React, { useState } from "react";
import { ClientSidebar } from "@/components/navigation/ClientSidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { CommandPalette } from "@/components/search/CommandPalette";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      <ClientSidebar />
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
