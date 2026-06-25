"use client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blue" | "green" | "purple" | "orange";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-gray-100 text-gray-700": variant === "default",
          "bg-blue-50 text-blue-700": variant === "blue",
          "bg-green-50 text-green-700": variant === "green",
          "bg-purple-50 text-purple-700": variant === "purple",
          "bg-orange-50 text-orange-700": variant === "orange",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
