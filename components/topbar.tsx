"use client"

export interface Filters {
  country: string
  city: string
  direction: string
  yearMin: number
  yearMax: number
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-[0.6px] text-[var(--text-faint)]">
        {label}
      </label>
      {children}
    </div>
  )
}

export function Topbar({
  title,
  subtitle,
  showFilters,
  filters,
  onChange,
  onReset,
  onToggleSidebar,
  options,
}: {
  title: string
  subtitle: string
  showFilters: boolean
  filters: Filters
  onChange: (next: Partial<Filters>) => void
  onReset: () => void
  onToggleSidebar: () => void
  options: {
    countries: string[]
    cities: string[]
    directions: string[]
    years: number[]
  }
}) {
  return (
    <div
      className="sticky top-0 z-20 border-b border-[var(--border-soft)] px-4 py-4 backdrop-blur-md md:px-7"
      style={{ background: "rgba(6,11,20,0.85)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-3">
          <button
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel-2)] md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div>
            <h1 className="m-0 mb-[3px] text-[19px] font-semibold">{title}</h1>
            <p className="m-0 max-w-xl text-[12.5px] text-[var(--text-dim)]">{subtitle}</p>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-end gap-[10px]">
            <Field label="Country">
              <select
                value={filters.country}
                onChange={(e) => onChange({ country: e.target.value, city: "" })}
                className="min-w-[120px]"
              >
                <option value="">All</option>
                {options.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City">
              <select
                value={filters.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className="min-w-[120px]"
              >
                <option value="">All</option>
                {options.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Direction">
              <select
                value={filters.direction}
                onChange={(e) => onChange({ direction: e.target.value })}
                className="min-w-[120px]"
              >
                <option value="">All</option>
                {options.directions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Year from">
              <select
                value={filters.yearMin}
                onChange={(e) => onChange({ yearMin: Number(e.target.value) })}
              >
                {options.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Year to">
              <select
                value={filters.yearMax}
                onChange={(e) => onChange({ yearMax: Number(e.target.value) })}
              >
                {options.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="&nbsp;">
              <button
                onClick={onReset}
                className="cursor-pointer rounded-[7px] border border-[var(--border)] bg-[var(--panel-2)] px-[14px] py-2 text-[12.5px] font-medium text-[var(--text)] transition-colors hover:border-[var(--light)] hover:text-[var(--light)]"
              >
                Reset
              </button>
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}
