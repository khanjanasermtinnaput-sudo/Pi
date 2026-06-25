"use client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none",
          {
            "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] shadow-sm": variant === "primary",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]": variant === "secondary",
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100": variant === "ghost",
            "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300": variant === "outline",
          },
          {
            "text-sm px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
