"use client";

import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./sidebar";
import { ChatPanel } from "./chat-panel";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
          <ChatPanel />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
