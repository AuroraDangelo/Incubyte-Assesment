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
      <div className="plate-inner">
        <div className="mb-2.5 flex items-center gap-2 border-b border-asphalt/20 pb-1.5">
          <span className="inline-flex items-center gap-1 rounded bg-[#003399] px-1.5 py-0.5 text-[10px] font-black tracking-widest text-white shadow-sm">
            IND
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-asphalt/70">
            Showroom Search & Filters
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:items-end">
          <div className="col-span-1 md:col-span-1">
            <label className={label} htmlFor="f-make">Brand</label>
            <input id="f-make" className={input} placeholder="Tata, Mahindra..." value={filters.make ?? ''} onChange={set('make')} />
          </div>
          <div>
            <label className={label} htmlFor="f-model">Model</label>
            <input id="f-model" className={input} placeholder="Nexon, Thar..." value={filters.model ?? ''} onChange={set('model')} />
          </div>
          <div>
            <label className={label} htmlFor="f-cat">Category</label>
            <select id="f-cat" className={input} value={filters.category ?? ''} onChange={set('category')}>
              <option value="">Any Category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="f-min">Min price (₹)</label>
            <input id="f-min" type="number" min={0} className={input} placeholder="Min ₹" value={filters.minPrice ?? ''} onChange={set('minPrice')} />
          </div>
          <div>
            <label className={label} htmlFor="f-max">Max price (₹)</label>
            <input id="f-max" type="number" min={0} className={input} placeholder="Max ₹" value={filters.maxPrice ?? ''} onChange={set('maxPrice')} />
          </div>
          <button
            type="button"
            className="col-span-2 rounded border-2 border-asphalt bg-asphalt px-3 py-2 text-sm font-bold text-plate hover:bg-asphalt/90 disabled:opacity-40 md:col-span-1"
            disabled={!active}
            onClick={() => onChange({})}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
