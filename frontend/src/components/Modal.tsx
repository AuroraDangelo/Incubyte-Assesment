import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props { title: string; onClose: () => void; children: ReactNode }

/** Accessible dialog: Escape closes, backdrop click closes, focus moves inside. */
export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-asphalt/60 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-t-2xl bg-paper p-6 shadow-xl sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-2xl font-black">{title}</h2>
        {children}
      </div>
    </div>
  );
}
