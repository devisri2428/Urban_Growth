"use client"

export type TabKey = "dashboard" | "prediction" | "model" | "explorer" | "about"

const NAV: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "prediction", label: "Growth Prediction" },
  { key: "model", label: "Model Performance" },
  { key: "explorer", label: "Data Explorer" },
  { key: "about", label: "About" },
]

export function Sidebar({
  active,
  onSelect,
  open,
  onClose,
  stats,
}: {
  active: TabKey
  onSelect: (t: TabKey) => void
  open: boolean
  onClose: () => void
  stats: { records: number; cities: number; countries: number; minYear: number; maxYear: number }
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex h-screen w-[232px] flex-none flex-col border-r border-[var(--border-soft)] transition-transform duration-200 md:sticky md:translate-x-0 ${
          open ? "translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg,#0A101B,#070C15)" }}
      >
        <div className="border-b border-[var(--border-soft)] px-5 pt-[22px] pb-[18px]">
          <div
            className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px]"
            style={{
              background:
                "conic-gradient(from 220deg, var(--light), var(--built), var(--veg), var(--water), var(--light))",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 6px 18px rgba(255,180,84,0.15)",
            }}
            aria-hidden="true"
          >
            <span className="text-[15px]">🛰️</span>
          </div>
          <div className="font-display text-[15px] font-semibold tracking-[0.2px] text-[var(--text)]">
            Urban Growth Analytics
          </div>
          <div className="mt-[3px] text-[11px] text-[var(--text-dim)]">
            Satellite-derived city expansion
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto p-3">
          {NAV.map((item) => {
            const isActive = item.key === active
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key)
                  onClose()
                }}
                className={`flex items-center gap-[11px] rounded-lg border px-3 py-[10px] text-left text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "border-[rgba(255,180,84,0.18)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-dim)] hover:bg-[var(--panel)] hover:text-[var(--text)]"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(255,180,84,0.13), rgba(255,180,84,0.02))",
                      }
                    : undefined
                }
              >
                <span
                  className="h-[6px] w-[6px] flex-none rounded-full"
                  style={
                    isActive
                      ? { background: "var(--light)", boxShadow: "0 0 8px rgba(255,180,84,0.7)" }
                      : { background: "var(--text-faint)" }
                  }
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[var(--border-soft)] px-5 pt-[14px] pb-[18px] text-[10.5px] text-[var(--text-faint)]">
          <b className="text-[var(--text-dim)]">{stats.records.toLocaleString()}</b> records ·{" "}
          <b className="text-[var(--text-dim)]">{stats.cities}</b> cities ·{" "}
          <b className="text-[var(--text-dim)]">{stats.countries}</b> countries
          <br />
          {stats.minYear}–{stats.maxYear} · trained client-side
        </div>
      </aside>
    </>
  )
}
