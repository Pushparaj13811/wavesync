"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Library, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePlaylists } from "@/lib/api/tracks";
import { formatTime } from "@/lib/utils/formatTime";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/library", icon: Library, label: "Library" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = usePlaylists();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-full bg-surface-primary border-r border-border-subtle">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <ListMusic size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-content-primary">
          WaveSync
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-surface-tertiary text-content-primary"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-secondary",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Playlists */}
      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="mb-3 px-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-content-tertiary">
            Playlists
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          {data?.playlists.map((playlist) => {
            const isActive = pathname === `/playlist/${playlist.id}`;
            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  "flex flex-col rounded-lg px-3 py-2 transition-colors duration-150",
                  isActive
                    ? "bg-surface-tertiary"
                    : "hover:bg-surface-secondary",
                )}
              >
                <span
                  className={cn(
                    "text-sm truncate",
                    isActive ? "text-content-primary" : "text-content-secondary",
                  )}
                >
                  {playlist.name}
                </span>
                <span className="text-xs text-content-tertiary">
                  {playlist.trackCount} tracks &middot;{" "}
                  {formatTime(playlist.totalDuration)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
