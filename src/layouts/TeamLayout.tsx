import React, { useState } from "react";
import { TeamSidebar } from "@/components/navigation/TeamSidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { cn } from "@/lib/utils";

interface TeamLayoutProps {
  children: React.ReactNode;
}

export function TeamLayout({ children }: TeamLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("furii_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("furii_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased relative">
      <TeamSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:pl-0" : "md:pl-64"
        )}
      >
        <TopBar
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapse}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

export default TeamLayout;
