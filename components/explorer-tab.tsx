"use client"

import { useMemo, useState } from "react"
import { CLASS_COLOR, COLS, IDX, type Row } from "@/lib/data"
import { fmt } from "@/lib/utils"
import { Card, SectionTitle } from "./ui"

const PAGE = 25

const NUMERIC_COLS = new Set([
  "Latitude",
  "Longitude",
  "Population",
  "Urban_Area_km2",
  "Builtup_Growth_%",
  "Green_Cover_%",
  "Water_Cover_%",
  "Road_Density_km_per_km2",
  "Night_Light_Index",
  "NDVI",
  "NDBI",
  "Urban_Density_persons_per_km2",
  "Land_Use_Change_%",
])

export function ExplorerTab({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("")
  const [sortCol, setSortCol] = useState<number>(IDX.City)
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = rows
    if (q) {
      out = rows.filter((r) =>
        [r[IDX.City], r[IDX.Country], r[IDX.Growth_Category], r[IDX.Expansion_Direction]]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    }
    const sorted = [...out].sort((a, b) => {
      const va = a[sortCol]
      const vb = b[sortCol]
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * sortDir
      return String(va).localeCompare(String(vb)) * sortDir
    })
    return sorted
  }, [rows, query, sortCol, sortDir])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(current * PAGE, current * PAGE + PAGE)

  function toggleSort(ci: number) {
    if (ci === sortCol) setSortDir((d) => (d === 1 ? -1 : 1))
    else {
      setSortCol(ci)
      setSortDir(1)
    }
    setPage(0)
  }

  function downloadCsv() {
    const header = COLS.join(",")
    const body = filtered
      .map((r) => r.map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v)).join(","))
      .join("\n")
    const blob = new Blob([header + "\n" + body], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "urban-growth-filtered.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fadein">
      <SectionTitle hint={`${filtered.length.toLocaleString()} rows match`}>
        Data explorer
      </SectionTitle>

      <Card>
        <div className="mb-[14px] flex flex-wrap items-center justify-between gap-3">
          <input
            type="search"
            placeholder="Search city, country, category, direction…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            className="min-w-[240px] flex-1"
          />
          <button
            onClick={downloadCsv}
            className="cursor-pointer rounded-[7px] border border-[var(--border)] bg-[var(--panel-2)] px-[14px] py-2 text-[12.5px] font-medium text-[var(--text)] transition-colors hover:border-[var(--light)] hover:text-[var(--light)]"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-[var(--border-soft)]">
          <table className="w-full border-collapse text-[12px] whitespace-nowrap">
            <thead>
              <tr>
                {COLS.map((c, ci) => (
                  <th
                    key={c}
                    onClick={() => toggleSort(ci)}
                    className="sticky top-0 cursor-pointer select-none border-b border-[var(--border-soft)] bg-[var(--panel-2)] px-[10px] py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.3px] text-[var(--text-dim)] hover:text-[var(--light)]"
                  >
                    {c.replace(/_/g, " ")}
                    {sortCol === ci ? (sortDir === 1 ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={i} className="hover:bg-[var(--panel-2)]">
                  {r.map((v, ci) => {
                    const col = COLS[ci]
                    if (col === "Growth_Category") {
                      return (
                        <td key={ci} className="border-b border-[var(--border-soft)] px-[10px] py-[7px]">
                          <span
                            className="inline-block rounded-full px-2 py-[2px] text-[10.5px] font-semibold"
                            style={{
                              color: CLASS_COLOR[v as keyof typeof CLASS_COLOR],
                              background: `${CLASS_COLOR[v as keyof typeof CLASS_COLOR]}1f`,
                            }}
                          >
                            {v}
                          </span>
                        </td>
                      )
                    }
                    return (
                      <td
                        key={ci}
                        className="border-b border-[var(--border-soft)] px-[10px] py-[7px] text-[var(--text-dim)]"
                      >
                        {NUMERIC_COLS.has(col) ? fmt(v as number, 2) : String(v)}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} className="px-[10px] py-8 text-center text-[var(--text-faint)]">
                    No rows match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-[14px] flex items-center justify-between text-[12px] text-[var(--text-dim)]">
          <span>
            Page {current + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              className="cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--panel-2)] px-3 py-[6px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
              className="cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--panel-2)] px-3 py-[6px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
