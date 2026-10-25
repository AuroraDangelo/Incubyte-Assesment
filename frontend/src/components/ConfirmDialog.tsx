import { useState } from 'react';
import Modal from './Modal';

interface Props { title: string; message: string; confirmLabel: string; onConfirm: () => Promise<void>; onClose: () => void }

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-6 text-sm text-asphalt/80">{message}</p>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-quiet" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="btn bg-brake text-white hover:bg-brake/90 disabled:opacity-60"
          disabled={busy}
          onClick={async () => { setBusy(true); await onConfirm(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
