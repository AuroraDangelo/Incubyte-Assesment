import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from './Modal';
import type { Vehicle } from '../types';

interface Props { vehicle: Vehicle; onSubmit: (qty: number) => Promise<void>; onClose: () => void }

export default function RestockModal({ vehicle, onSubmit, onClose }: Props) {
  const [qty, setQty] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1) return setError('Enter a whole number of at least 1');
    setSaving(true);
    try { await onSubmit(n); } catch (err) { setError(err instanceof Error ? err.message : 'Restock failed'); setSaving(false); }
  }

  return (
    <Modal title={`Restock ${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-asphalt/70">Currently {vehicle.quantity} in stock.</p>
        <div>
          <label htmlFor="restock-qty" className="mb-1 block text-sm font-medium">Units to add</label>
          <input id="restock-qty" type="number" min={1} className="field" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus />
        </div>
        {error && <p role="alert" className="text-sm text-brake">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>Add stock</button>
        </div>
      </form>
    </Modal>
  );
}
