import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from './Modal';
import type { Vehicle, VehicleInput } from '../types';

interface Props {
  /** When provided the form edits this vehicle, otherwise it creates one. */
  initial?: Vehicle;
  onSubmit: (data: VehicleInput) => Promise<void>;
  onClose: () => void;
}

export default function VehicleFormModal({ initial, onSubmit, onClose }: Props) {
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const p = Number(price);
    const q = Number(quantity);
    if (!make.trim() || !model.trim() || !category.trim()) return setError('Brand, model and category are required');
    if (price.trim() === '' || !Number.isFinite(p) || p < 0) return setError('Price must be zero or more');
    if (quantity.trim() === '' || !Number.isInteger(q) || q < 0) return setError('Quantity must be a whole number, zero or more');

    setError(null);
    setSaving(true);
    try {
      await onSubmit({ make: make.trim(), model: model.trim(), category: category.trim(), price: p, quantity: q });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save vehicle');
      setSaving(false);
    }
  }

  const text = (id: string, label: string, value: string, set: (v: string) => void) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={id} className="field" value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <Modal title={initial ? `Edit ${initial.make} ${initial.model}` : 'Add a vehicle'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          {text('make', 'Brand', make, setMake)}
          {text('model', 'Model', model, setModel)}
        </div>
        {text('category', 'Category', category, setCategory)}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">Price (₹ INR)</label>
            <input id="price" type="number" inputMode="decimal" className="field" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium">Quantity</label>
            <input id="quantity" type="number" inputMode="numeric" className="field" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>
        {error && <p role="alert" className="rounded-md border border-brake/30 bg-brake/10 px-3 py-2 text-sm text-brake">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{initial ? 'Save changes' : 'Add vehicle'}</button>
        </div>
      </form>
    </Modal>
  );
}
