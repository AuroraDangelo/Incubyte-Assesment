import type { Filters } from '../types';

interface Props { filters: Filters; categories: string[]; onChange: (f: Filters) => void }

/** Search strip styled as a number plate – the page's one loud element. */
export default function FilterPlate({ filters, categories, onChange }: Props) {
  const set = (k: keyof Filters) => (e: { target: { value: string } }) => onChange({ ...filters, [k]: e.target.value });
  const active = Object.values(filters).some((v) => v && v.trim());

  const input = 'w-full rounded border-2 border-asphalt bg-paper px-3 py-2 text-sm font-semibold placeholder:font-normal placeholder:text-asphalt/45';
  const label = 'mb-1 block text-xs font-bold text-asphalt';

  return (
    <form role="search" aria-label="Filter vehicles" className="plate" onSubmit={(e) => e.preventDefault()}>
      <div className="plate-inner grid grid-cols-2 gap-3 md:grid-cols-6 md:items-end">
        <div className="col-span-1 md:col-span-1">
          <label className={label} htmlFor="f-make">Make</label>
          <input id="f-make" className={input} placeholder="Toyota" value={filters.make ?? ''} onChange={set('make')} />
        </div>
        <div>
          <label className={label} htmlFor="f-model">Model</label>
          <input id="f-model" className={input} placeholder="Corolla" value={filters.model ?? ''} onChange={set('model')} />
        </div>
        <div>
          <label className={label} htmlFor="f-cat">Category</label>
          <select id="f-cat" className={input} value={filters.category ?? ''} onChange={set('category')}>
            <option value="">Any</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="f-min">Min price</label>
          <input id="f-min" type="number" min={0} className={input} placeholder="0" value={filters.minPrice ?? ''} onChange={set('minPrice')} />
        </div>
        <div>
          <label className={label} htmlFor="f-max">Max price</label>
          <input id="f-max" type="number" min={0} className={input} placeholder="Any" value={filters.maxPrice ?? ''} onChange={set('maxPrice')} />
        </div>
        <button
          type="button"
          className="col-span-2 rounded border-2 border-asphalt bg-asphalt px-3 py-2 text-sm font-bold text-plate disabled:opacity-40 md:col-span-1"
          disabled={!active}
          onClick={() => onChange({})}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
