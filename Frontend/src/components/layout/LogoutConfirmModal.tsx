import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { LogOut, X, AlertCircle } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * LogoutConfirmModal — Modal de confirmación para cerrar sesión
 */
export function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: LogoutConfirmModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const handleModalClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={handleModalClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Cerrar sesión</h2>
            <p className="text-sm text-slate-600">
              ¿Estás seguro de que deseas cerrar sesión? Serás redirigido a la página de inicio de sesión.
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 p-1 rounded-full hover:bg-slate-100"
            aria-label="Cerrar modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            type="button"
            className="rounded-3xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
            className="rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Cerrando...</span>
              </>
            ) : (
              <>
                <LogOut size={18} strokeWidth={2} />
                <span>Cerrar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
