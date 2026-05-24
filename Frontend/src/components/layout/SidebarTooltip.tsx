// components/layout/SidebarTooltip.tsx
import { ReactNode, useState } from "react";
import { cn } from "../ui/utils";

interface SidebarTooltipProps {
  children: ReactNode;
  label: string;
  isCollapsed: boolean;
  side?: "right" | "left";
}

export function SidebarTooltip({ 
  children, 
  label, 
  isCollapsed, 
  side = "right" 
}: SidebarTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isCollapsed) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap",
            side === "right" ? "left-full ml-2" : "right-full mr-2"
          )}
        >
          {label}
          {/* Flecha del tooltip */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-gray-900",
              side === "right" ? "-left-0.5" : "-right-0.5"
            )}
            style={{
              transform: "rotate(45deg)",
              width: "6px",
              height: "6px",
            }}
          />
        </div>
      )}
    </div>
  );
}