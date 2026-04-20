import * as React from "react";
import { cn } from "./utils";

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center px-6 pb-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
};