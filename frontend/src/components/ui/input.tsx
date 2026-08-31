import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3.5 text-[0.95rem] text-ink placeholder:text-faint transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:border-ink focus-visible:shadow-[0_0_0_3px_rgba(23,21,15,0.06)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
