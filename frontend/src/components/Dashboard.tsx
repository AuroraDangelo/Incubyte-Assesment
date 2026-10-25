import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Filters, User, Vehicle, VehicleInput } from '../types';
import ConfirmDialog from './ConfirmDialog';
import FilterPlate from './FilterPlate';
import RestockModal from './RestockModal';
import type { Toast } from './Toasts';
import Toasts from './Toasts';
import VehicleCard from './VehicleCard';
import VehicleFormModal from './VehicleFormModal';

type Dialog =
  | { kind: 'add' }
  | { kind: 'edit'; vehicle: Vehicle }
  | { kind: 'restock'; vehicle: Vehicle }
  | { kind: 'delete'; vehicle: Vehicle }
  | null;

interface Props { user: User; onLogout: () => void }

export default function Dashboard({ user, onLogout }: Props) {
  const isAdmin = user.role === 'admin';
  const [filters, setFilters] = useState<Filters>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const requestSeq = useRef(0);

  const toast = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const load = useCallback(async (f: Filters) => {
    const seq = ++requestSeq.current; // ignore out-of-order responses while typing
    try {
      const data = await api.listVehicles(f);
      if (seq !== requestSeq.current) return;
      setVehicles(data);
      setCategories((prev) => [...new Set([...prev, ...data.map((v) => v.category)])].sort());
      setLoadError(null);
    } catch (err) {
      if (seq === requestSeq.current) setLoadError(err instanceof Error ? err.message : 'Could not load vehicles');
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  // Debounce so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => load(filters), 250);
    return () => clearTimeout(t);
  }, [filters, load]);

  const refresh = () => load(filters);
  const replace = (v: Vehicle) => setVehicles((list) => list.map((x) => (x.id === v.id ? v : x)));

  async function purchase(v: Vehicle) {
    setBusyId(v.id);
    try {
      replace(await api.purchase(v.id));
      toast('ok', `Purchased ${v.make} ${v.model}`);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Purchase failed');
      refresh(); // stock may have changed under us
    } finally {
      setBusyId(null);
    }
  }

  async function saveVehicle(data: VehicleInput) {
    if (dialog?.kind === 'edit') {
      await api.updateVehicle(dialog.vehicle.id, data);
      toast('ok', 'Vehicle updated');
    } else {
      await api.createVehicle(data);
      toast('ok', 'Vehicle added');
    }
    setDialog(null);
    refresh();
  }

  const total = vehicles.reduce((n, v) => n + v.quantity, 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-asphalt/15 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="font-display text-lg font-extrabold" style={{ fontStretch: '125%' }}>Bharat Motors</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline">{user.name}</span>
            {isAdmin && <span className="rounded bg-plate px-2 py-0.5 text-xs font-bold">Admin</span>}
            <button className="btn-quiet !py-1.5" onClick={onLogout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black sm:text-5xl">Showroom Inventory</h1>
            <p className="mt-2 text-asphalt/70" aria-live="polite">
              {loading ? 'Counting cars…' : `${vehicles.length} model${vehicles.length === 1 ? '' : 's'}, ${total} unit${total === 1 ? '' : 's'} ready for delivery`}
            </p>
          </div>
          {isAdmin && <button className="btn-primary" onClick={() => setDialog({ kind: 'add' })}>Add vehicle</button>}
        </div>

        <FilterPlate filters={filters} categories={categories} onChange={setFilters} />

        {loadError && <p role="alert" className="mt-6 rounded-md border border-brake/30 bg-brake/10 px-4 py-3 text-brake">{loadError}</p>}

        {!loading && !loadError && vehicles.length === 0 && (
          <div className="mt-10 rounded-lg border-2 border-dashed border-asphalt/25 p-10 text-center">
            <p className="text-lg font-bold">Nothing in the showroom matches.</p>
            <p className="mt-1 text-sm text-asphalt/70">Loosen the price range or clear a filter.</p>
          </div>
        )}

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <li key={v.id} className="flex min-w-0">
                <VehicleCard
                  vehicle={v}
                  isAdmin={isAdmin}
                  busy={busyId === v.id}
                  onPurchase={purchase}
                  onEdit={(x) => setDialog({ kind: 'edit', vehicle: x })}
                  onRestock={(x) => setDialog({ kind: 'restock', vehicle: x })}
                  onDelete={(x) => setDialog({ kind: 'delete', vehicle: x })}
                />
            </li>
          ))}
        </ul>
      </main>

      {(dialog?.kind === 'add' || dialog?.kind === 'edit') && (
        <VehicleFormModal initial={dialog.kind === 'edit' ? dialog.vehicle : undefined} onSubmit={saveVehicle} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'restock' && (
        <RestockModal
          vehicle={dialog.vehicle}
          onClose={() => setDialog(null)}
          onSubmit={async (qty) => {
            replace(await api.restock(dialog.vehicle.id, qty));
            toast('ok', `Added ${qty} to ${dialog.vehicle.make} ${dialog.vehicle.model}`);
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Delete vehicle?"
          message={`${dialog.vehicle.make} ${dialog.vehicle.model} will be removed from the inventory. This cannot be undone.`}
          confirmLabel="Delete"
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            try {
              await api.deleteVehicle(dialog.vehicle.id);
              toast('ok', 'Vehicle deleted');
            } catch (err) {
              toast('error', err instanceof Error ? err.message : 'Delete failed');
            }
            setDialog(null);
            refresh();
          }}
        />
      )}
      <Toasts toasts={toasts} />
    </div>
  );
}
