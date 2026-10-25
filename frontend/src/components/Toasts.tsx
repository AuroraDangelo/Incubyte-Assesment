export interface Toast { id: number; kind: 'ok' | 'error'; text: string }

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <p key={t.id} className={`pointer-events-auto rounded-md px-4 py-2 text-sm font-semibold text-white shadow-lg ${t.kind === 'ok' ? 'bg-racing-dark' : 'bg-brake'}`}>
          {t.text}
        </p>
      ))}
    </div>
  );
}
