"use client";

import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { PlayerBar } from "@/components/player/PlayerBar";
import { FullPlayer } from "@/components/player/FullPlayer";
import { QueuePanel } from "@/components/playlist/QueuePanel";
import { KeyboardHelp } from "./KeyboardHelp";
import { ToastContainer } from "@/components/ui/Toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  useAudioEngine();
  useKeyboardShortcuts();
  useServiceWorker();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-primary">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main content area */}
      {/* pb breakdown: mobile=mini-player(72)+bottomnav(56)=128→pb-32, tablet=player(80)+bottomnav(56)=136→pb-36, desktop=player(80)→pb-20 */}
      <main className="flex-1 overflow-y-auto pb-32 sm:pb-36 lg:pb-20">
        {children}
      </main>

      {/* Queue panel (desktop) */}
      <QueuePanel />

      {/* Player bar (fixed bottom) */}
      <PlayerBar />

      {/* Full player (mobile overlay) */}
      <FullPlayer />

      {/* Bottom nav (mobile) */}
      <BottomNav />

      {/* Keyboard shortcuts help modal */}
      <KeyboardHelp />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
