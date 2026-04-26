import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  
  const variantClasses = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    ghost: "hover:bg-gray-100 hover:text-gray-800",
    link: "text-purple-600 underline-offset-4 hover:underline",
  };
  
  const sizeClasses = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-6",
    icon: "h-9 w-9 rounded-md",
  };

  return (
    <Comp
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      {...props}
    />
  );
}

export { Button };
