import React from "react";
import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteDialog({ isOpen, title = "Delete record", message, onConfirm, onCancel }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            className="rounded-xl bg-light px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:scale-105 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:scale-105 transition"
            onClick={onConfirm}
          >
            Confirm delete
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-700">{message || "This action cannot be undone."}</p>
    </Modal>
  );
}

export default ConfirmDeleteDialog;
