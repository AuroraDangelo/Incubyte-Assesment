import { formatPrice, swatchFor } from '../format';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  busy?: boolean;
  onPurchase: (v: Vehicle) => void;
  onEdit: (v: Vehicle) => void;
  onRestock: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
}

/** A hang-tag style card: swatch + title on top, price and stock below, actions last. */
export default function VehicleCard({ vehicle: v, isAdmin, busy, onPurchase, onEdit, onRestock, onDelete }: Props) {
  const soldOut = v.quantity === 0;
  const low = v.quantity > 0 && v.quantity <= 2;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg border border-asphalt/20 bg-paper shadow-sm">
      <div className="h-2" style={{ backgroundColor: swatchFor(v.category) }} aria-hidden />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold leading-tight">{v.make} {v.model}</h3>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-asphalt/70">
              <span className="h-3 w-3 rounded-full border border-asphalt/30" style={{ backgroundColor: swatchFor(v.category) }} aria-hidden />
              <span>{v.category}</span>
            </p>
          </div>
          <span aria-hidden className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-asphalt/30 bg-concrete" />
        </header>

        <div className="flex items-end justify-between">
          <p className="font-display text-3xl font-black tracking-tight">{formatPrice(v.price)}</p>
          <p className={`text-sm font-semibold ${soldOut ? 'text-brake' : low ? 'text-[#8A5A00]' : 'text-racing'}`}>
            {soldOut ? 'Sold out' : `${v.quantity} in stock`}{low && ' – going fast'}
          </p>
        </div>

        <button type="button" className="btn-primary mt-auto w-full" disabled={soldOut || busy} onClick={() => onPurchase(v)}>
          Purchase
        </button>

        {isAdmin && (
          <div className="flex gap-2 border-t border-dashed border-asphalt/25 pt-3">
            <button type="button" className="btn-quiet flex-1 !px-2" onClick={() => onEdit(v)}>Edit</button>
            <button type="button" className="btn-quiet flex-1 !px-2" onClick={() => onRestock(v)}>Restock</button>
            <button type="button" className="btn-danger flex-1 !px-2" onClick={() => onDelete(v)}>Delete</button>
          </div>
        )}
      </div>
    </article>
  );
}
