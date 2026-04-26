import * as React from "react";
import { cn } from "./utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
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

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props} />
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardFooter({ className, ...props }: CardFooterProps) {
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
