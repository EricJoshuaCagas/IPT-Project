import React, { useEffect } from "react";

type ModalProps = {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "modal" | "drawer";
  footer?: React.ReactNode;
};

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl"
};

export function Modal({ title, children, isOpen, onClose, size = "md", variant = "modal", footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  if (variant === "drawer") {
    return (
      <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur">
        <div className="h-full w-full max-w-xl overflow-y-auto bg-light px-6 py-5 shadow-xl">
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            </div>
            <button
              aria-label="Close"
              className="rounded-full bg-light px-3 py-1 text-sm font-semibold text-slate-800 shadow hover:scale-105 transition"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </header>
          <div className="space-y-4">{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur">
      <div className={`w-full rounded-2xl bg-light p-6 shadow-2xl ${sizeClass[size]} mx-4`}>
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          </div>
          <button
            aria-label="Close"
            className="rounded-full bg-light px-3 py-1 text-sm font-semibold text-slate-800 shadow hover:scale-105 transition"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
