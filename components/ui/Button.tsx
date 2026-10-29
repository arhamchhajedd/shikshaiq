import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "saffron" | "outline" | "ghost" | "navy";
  size?: "sm" | "md" | "lg";
  href?: string;
  external?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      external,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-black text-white shadow-sm hover:bg-zinc-800 focus-visible:ring-black",
      secondary:
        "bg-white text-zinc-900 border border-zinc-200/90 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-zinc-400",
      saffron:
        "bg-black text-white shadow-sm hover:bg-zinc-800 focus-visible:ring-black",
      outline:
        "border border-zinc-200 bg-transparent text-zinc-700 hover:text-black hover:bg-black/[0.03] hover:border-zinc-300 focus-visible:ring-zinc-400",
      ghost:
        "text-zinc-600 hover:text-black hover:bg-black/[0.04] focus-visible:ring-zinc-400",
      navy:
        "bg-zinc-900 text-white hover:bg-black shadow-sm focus-visible:ring-black",
    };

    const sizeStyles = {
      sm: "h-8 px-3.5 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2 font-medium tracking-tight",
    };

    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
