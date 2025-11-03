"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  FileUp,
  // MousePointerClick,
  // Database,
  Award,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Template", url: "/upload-template", icon: FileUp },
  // { title: "Field Mapping", url: "/field-mapping", icon: MousePointerClick },
  // { title: "Upload Data", url: "/upload-data", icon: Database },
  // { title: "Certificates", url: "/certificates", icon: Award },
  { title: "Settings", url: "/", icon: Settings },
];

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);
  const [promoImgError, setPromoImgError] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
  <aside className="hidden md:flex md:w-64 border-r border-border bg-card h-screen sticky top-0 md:flex-col">
        <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Certifyly
          </span>
        </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.url;
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              href={item.url}
              // add data-tour attribute for the tour to target
              data-tour={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="bg-accent/5 border border-border rounded-lg p-3 text-sm">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-md overflow-hidden bg-white flex items-center justify-center">
              {!promoImgError ? (
                <Image src="/campusrank-logo.jpg" alt="Campus Rank" width={56} height={56} className="object-contain rounded-circle" onError={() => setPromoImgError(true)} />
              ) : (
                <div className="text-sm font-semibold">CR</div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">Campus Rank</p>
              <p className="text-xs text-muted-foreground mt-1">One-stop platform for placement preparation — mock tests, interview questions, and curated resources.</p>
            </div>
            <div className="mt-2">
              <Button asChild size="sm">
                <a data-tour="visit" href="https://campusrank.org" target="_blank" rel="noopener noreferrer" className="text-xs">Visit</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Avatar: try to load /avatar.png from public; fallback to initials */}
          <div data-tour="profile" className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center relative">
            {!imgError ? (
              <Image
                src="/avatar.jpeg"
                alt="Priyanshu Chouhan"
                className="w-full h-full object-cover"
                width={32}
                height={32}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">PC</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Priyanshu Chouhan</p>
            <p className="text-xs text-muted-foreground truncate">priyanshu@certifyly.com</p>
          </div>
        </div>
      </div>
      </aside>

      {/* Mobile drawer + backdrop */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => onClose && onClose()} />
          <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-card border-r border-border flex flex-col shadow-md md:hidden transform transition-transform">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">Certifyly</span>
              </div>
              <button aria-label="Close menu" onClick={() => onClose && onClose()} className="p-2 rounded-md hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={() => onClose && onClose()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4">
              <div className="bg-accent/5 border border-border rounded-lg p-3 text-sm">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-white flex items-center justify-center">
                    {!promoImgError ? (
                      <Image src="/campusrank-logo.jpg" alt="Campus Rank" width={56} height={56} className="object-contain rounded-circle" onError={() => setPromoImgError(true)} />
                    ) : (
                      <div className="text-sm font-semibold">CR</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Campus Rank</p>
                    <p className="text-xs text-muted-foreground mt-1">One-stop platform for placement preparation — mock tests, interview questions, and curated resources.</p>
                  </div>
                  <div className="mt-2">
                    <Button asChild size="sm">
                      <a data-tour="visit" href="https://campusrank.org" target="_blank" rel="noopener noreferrer" className="text-xs">Visit</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center relative">
                  {!imgError ? (
                    <Image
                      src="/avatar.jpeg"
                      alt="Priyanshu Chouhan"
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">PC</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Priyanshu Chouhan</p>
                  <p className="text-xs text-muted-foreground truncate">priyanshu@certifyly.com</p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
