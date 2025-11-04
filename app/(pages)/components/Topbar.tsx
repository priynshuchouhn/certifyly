'use client';
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Topbar is an async server component. It will fetch the repo star count server-side.
export function Topbar({ onOpenSidebar, onStartTour }: { onOpenSidebar?: () => void; onStartTour?: () => void }) {
  return (
    <header className="h-16 border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/80">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Hamburger only on small screens */}
          <button
            aria-label="Open menu"
            onClick={() => onOpenSidebar && onOpenSidebar()}
            className="md:hidden p-2 rounded-md hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, certificates..."
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onStartTour && onStartTour()}>
            Tour
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          {/* <Suspense fallback={<div>Loading...</div>}>
            <GitHubBtnClient />
          </Suspense> */}
        </div>
      </div>
    </header>
  );
}
