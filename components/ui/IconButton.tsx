"use client";

import { cn } from "@/lib/utils/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive?: boolean;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  label,
  isActive = false,
  showDot = false,
  size = "md",
  className,
  children,
  ...props
}: IconButtonProps) {
  const sizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  };

  return (
    <button
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full transition-colors duration-150",
        "text-content-tertiary hover:text-content-primary hover:bg-surface-tertiary",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        isActive && "text-accent hover:text-accent-hover",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {showDot && isActive && (
        <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
      )}
    </button>
  );
}
