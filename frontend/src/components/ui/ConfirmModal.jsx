import { AlertTriangle } from "lucide-react";

/**
 * Reusable confirmation dialog modal.
 * Props:
 *   open        – boolean
 *   title       – string  (optional, default "Are you sure?")
 *   message     – string
 *   confirmLabel – string (optional, default "Delete")
 *   onConfirm   – () => void
 *   onCancel    – () => void
 *   danger      – boolean (red confirm button vs blue)
 */
const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  danger = true,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
          danger ? "bg-red-100 dark:bg-red-900/20" : "bg-blue-100 dark:bg-blue-900/20"
        }`}>
          <AlertTriangle className={`h-6 w-6 ${danger ? "text-red-500" : "text-blue-500"}`} />
        </div>

        <h3 className="text-center text-base font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#2F6FCC] hover:bg-[#2561b8]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
