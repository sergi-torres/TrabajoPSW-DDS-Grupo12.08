import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  asChild?: boolean;
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  
  const variantClasses = {
    default: "border-transparent bg-purple-600 text-white hover:bg-purple-700",
    secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
