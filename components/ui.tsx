import type { ReactNode } from "react"

export function Card({
  children,
  className = "",
  title,
  sub,
}: {
  children: ReactNode
  className?: string
  title?: string
  sub?: string
}) {
  return (
    <div
      className={`rounded-[14px] border border-[var(--border-soft)] bg-[var(--panel)] p-[18px] pb-[14px] ${className}`}
    >
      {title && <h3 className="m-0 text-[13px] font-semibold text-[var(--text)]">{title}</h3>}
      {sub && <div className="mb-3 mt-[2px] text-[11px] text-[var(--text-faint)]">{sub}</div>}
      {children}
    </div>
  )
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-[14px] mt-7 flex items-baseline justify-between first:mt-0">
      <h2 className="m-0 text-[14px] font-semibold uppercase tracking-[0.8px] text-[var(--text-dim)]">
        {children}
      </h2>
      {hint && <span className="text-[11.5px] text-[var(--text-faint)]">{hint}</span>}
    </div>
  )
}

const TOOLTIP_STYLE = {
  background: "#0F1826",
  border: "1px solid #1E2A3E",
  borderRadius: 8,
  color: "#EAF0F7",
  fontSize: 12,
}

export { TOOLTIP_STYLE }
