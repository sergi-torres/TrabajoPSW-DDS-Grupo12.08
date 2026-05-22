import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  text: string;
  /** Optional width for the tooltip popover */
  maxWidth?: number;
}

/**
 * InfoTooltip — Icono ℹ️ con popover informativo.
 * Usa --color-info de la guía de diseño.
 * Muestra el tooltip al hover (desktop) y al click (mobile).
 */
export default function InfoTooltip({ text, maxWidth = 260 }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate whether tooltip should appear above or below
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      setPosition(spaceAbove < 120 ? "bottom" : "top");
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <span className="info-tooltip-wrapper">
      <button
        ref={triggerRef}
        type="button"
        className="info-tooltip-trigger"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label="Más información"
      >
        <Info size={15} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`info-tooltip-popover info-tooltip-popover--${position}`}
          style={{ maxWidth }}
          role="tooltip"
        >
          <div className="info-tooltip-arrow" />
          <p className="info-tooltip-text">{text}</p>
        </div>
      )}

      <style>{`
        .info-tooltip-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 6px;
          vertical-align: middle;
        }

        .info-tooltip-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: var(--info-bg, #EFF6FF);
          color: var(--info, #3B82F6);
          cursor: pointer;
          transition: all 150ms ease;
          padding: 0;
          flex-shrink: 0;
        }

        .info-tooltip-trigger:hover {
          background: var(--info, #3B82F6);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          transform: scale(1.1);
        }

        .info-tooltip-popover {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(59, 130, 246, 0.15);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(59, 130, 246, 0.08);
          animation: tooltip-enter 200ms cubic-bezier(0, 0, 0.2, 1);
        }

        .info-tooltip-popover--top {
          bottom: calc(100% + 10px);
        }

        .info-tooltip-popover--bottom {
          top: calc(100% + 10px);
        }

        @keyframes tooltip-enter {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .info-tooltip-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .info-tooltip-popover--top .info-tooltip-arrow {
          bottom: -5px;
          border-top: none;
          border-left: none;
        }

        .info-tooltip-popover--bottom .info-tooltip-arrow {
          top: -5px;
          border-bottom: none;
          border-right: none;
        }

        .info-tooltip-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          line-height: 1.5;
          color: #374151;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </span>
  );
}
