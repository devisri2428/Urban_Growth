import type { Row } from "./data"

export function fmt(n: number | null | undefined, d = 1): string {
  if (n === undefined || n === null || isNaN(n)) return "—"
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K"
  return n.toFixed(d)
}

export function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / (arr.length || 1)
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort() as T[]
}

export function groupBy(rows: Row[], keyIdx: number): Record<string, Row[]> {
  const g: Record<string, Row[]> = {}
  rows.forEach((r) => {
    const k = String(r[keyIdx])
    ;(g[k] = g[k] || []).push(r)
  })
  return g
}
