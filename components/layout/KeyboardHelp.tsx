"use client";

import { X } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

const shortcuts = [
  {
    group: "Playback",
    items: [
      { key: "Space", action: "Play / Pause" },
      { key: "N", action: "Next track" },
      { key: "P", action: "Previous track" },
    ],
  },
  {
    group: "Seeking",
    items: [
      { key: "\u2192", action: "Forward 5s" },
      { key: "\u2190", action: "Backward 5s" },
      { key: "Shift + \u2192", action: "Forward 10s" },
      { key: "Shift + \u2190", action: "Backward 10s" },
    ],
  },
  {
    group: "Volume",
    items: [
      { key: "\u2191", action: "Volume up" },
      { key: "\u2193", action: "Volume down" },
      { key: "M", action: "Toggle mute" },
    ],
  },
  {
    group: "Modes",
    items: [
      { key: "S", action: "Toggle shuffle" },
      { key: "R", action: "Cycle repeat" },
    ],
  },
];

export function KeyboardHelp() {
  const isOpen = useUIStore((s) => s.isKeyboardHelpOpen);
  const toggle = useUIStore((s) => s.toggleKeyboardHelp);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-primary/80 backdrop-blur-sm"
        onClick={toggle}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-surface-secondary border border-border-default rounded-2xl shadow-xl animate-[fade-in_0.15s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-base font-semibold text-content-primary">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={toggle}
            className="text-content-tertiary hover:text-content-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((section) => (
            <div key={section.group} className="mb-5 last:mb-0">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-content-tertiary mb-2">
                {section.group}
              </h3>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-content-secondary">
                      {item.action}
                    </span>
                    <kbd className="px-2 py-0.5 rounded bg-surface-tertiary text-[11px] font-mono text-content-primary border border-border-subtle">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-border-subtle">
          <p className="text-xs text-content-tertiary text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-[10px] font-mono border border-border-subtle">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}
