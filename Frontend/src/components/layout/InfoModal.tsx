import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * InfoModal — Modal informativo genérico para ayuda y guías.
 * Sigue la estética de ConfirmModal pero sin acciones de confirmación.
 */
export function InfoModal({
  isOpen,
  title,
  children,
  onClose,
}: InfoModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const handleModalClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-2xl font-heading font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto font-body text-slate-600 leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
