import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] font-medium transition-[background-color,color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.985] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-canvas hover:bg-[#322d20]",
        accent:
          "bg-accent text-[var(--color-accent-ink)] hover:brightness-110",
        outline:
          "border border-line-strong bg-surface text-ink hover:bg-raised",
        secondary:
          "bg-raised text-ink hover:bg-[#ece9e0]",
        ghost:
          "text-muted hover:bg-raised hover:text-ink",
        destructive:
          "bg-[var(--color-negative)] text-white hover:brightness-95",
        link: "text-accent underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-11 px-5 text-[0.9rem]",
        sm: "h-9 px-4 text-[0.83rem]",
        lg: "h-13 px-7 text-base [&_svg]:size-[18px]",
        icon: "h-10 w-10 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn("[&_svg]:size-4", buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
