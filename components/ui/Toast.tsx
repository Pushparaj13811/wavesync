"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/useUIStore";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: "border-accent-emerald text-accent-emerald",
  error: "border-accent-rose text-accent-rose",
  info: "border-accent text-accent",
};

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[var(--z-toast)] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  message,
  type,
  duration = 3000,
  onDismiss,
}: {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onDismiss: () => void;
}) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-surface-secondary px-4 py-3 shadow-lg",
        "animate-[slide-down_0.25s_ease-out]",
        colors[type],
      )}
    >
      <Icon size={16} />
      <span className="text-sm text-content-primary">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-content-tertiary hover:text-content-primary"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
