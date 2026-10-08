import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  ink: "bg-ink text-cream",
  butter: "bg-butter text-ink",
  surface: "bg-surface text-ink shadow-card",
  mint: "bg-mint text-ink",
} as const;

export function buttonClass(variant: keyof typeof variants = "ink", extra?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    variants[variant],
    extra,
  );
}

export function Button({
  variant = "ink",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
