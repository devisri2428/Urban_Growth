"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import { CLASS_COLOR, CLASSES, IDX, type Row } from "@/lib/data"
import { fmt, groupBy, mean, unique } from "@/lib/utils"
import { Card, SectionTitle, TOOLTIP_STYLE } from "./ui"

const AXIS = { fontSize: 11, fill: "#7C8AA3" }

function Kpi({
  label,
  value,
  sub,
  warn,
}: {
  label: string
  value: string
  sub: string
  warn?: boolean
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-[var(--border-soft)] p-[18px] pb-4"
      style={{ background: "linear-gradient(160deg, var(--panel), var(--panel-3))" }}
    >
      <div
        className="pointer-events-none absolute -top-[30px] -right-[30px] h-[90px] w-[90px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,180,84,0.14), transparent 70%)",
        }}
      />
      <div className="mb-[10px] text-[11px] uppercase tracking-[0.5px] text-[var(--text-dim)]">
        {label}
      </div>
      <div className="font-display text-[26px] font-bold tracking-[-0.3px]">{value}</div>
      <div className="mt-[6px] text-[11.5px] text-[var(--text-faint)]">
        {sub.split("|").map((part, i) =>
          i === 1 ? (
            <b key={i} className={warn ? "text-[var(--built)]" : "text-[var(--veg)]"}>
              {part}
            </b>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </div>
    </div>
  )
}

export function DashboardTab({ rows, filterSummary }: { rows: Row[]; filterSummary: string }) {
  const kpis = useMemo(() => {
    const n = rows.length
    const avgPop = mean(rows.map((r) => r[IDX.Population] as number))
    const avgArea = mean(rows.map((r) => r[IDX.Urban_Area_km2] as number))
    const avgGrowth = mean(rows.map((r) => r[IDX["Builtup_Growth_%"]] as number))
    const nHigh = rows.filter((r) => r[IDX.Growth_Category] === "High").length
    const pctHigh = n ? (nHigh / n) * 100 : 0
    const avgNdvi = mean(rows.map((r) => r[IDX.NDVI] as number))
    const nCities = unique(rows.map((r) => r[IDX.City] as string)).length
    return [
      { label: "Total records", value: n.toLocaleString(), sub: `${nCities} cities in current view` },
      { label: "Avg. population", value: fmt(avgPop, 2), sub: `Across ${nCities} cities` },
      { label: "Avg. urban area", value: fmt(avgArea, 1) + " km²", sub: "Mean built-up footprint" },
      { label: "Avg. builtup growth", value: avgGrowth.toFixed(2) + "%", sub: "Annual expansion rate" },
      {
        label: "High-growth share",
        value: pctHigh.toFixed(1) + "%",
        sub: `|${nHigh.toLocaleString()}| of ${n.toLocaleString()} records`,
        warn: pctHigh > 40,
      },
      { label: "Avg. NDVI", value: avgNdvi.toFixed(3), sub: "Vegetation index (0–1)" },
    ]
  }, [rows])

  const donutData = useMemo(
    () =>
      CLASSES.map((c) => ({
        name: c,
        value: rows.filter((r) => r[IDX.Growth_Category] === c).length,
      })),
    [rows],
  )

  const { years, byYear } = useMemo(() => {
    const byYear = groupBy(rows, IDX.Year)
    const years = Object.keys(byYear)
      .map(Number)
      .sort((a, b) => a - b)
    return { years, byYear }
  }, [rows])

  const popData = useMemo(
    () =>
      years.map((y) => ({
        year: y,
        value: mean(byYear[y].map((r) => r[IDX.Population] as number)),
      })),
    [years, byYear],
  )

  const nightData = useMemo(
    () =>
      years.map((y) => ({
        year: y,
        value: mean(byYear[y].map((r) => r[IDX.Night_Light_Index] as number)),
      })),
    [years, byYear],
  )

  const countryData = useMemo(() => {
    const byCountry = groupBy(rows, IDX.Country)
    return Object.entries(byCountry)
      .map(([k, v]) => ({ name: k, value: mean(v.map((r) => r[IDX.Urban_Area_km2] as number)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [rows])

  const dirData = useMemo(() => {
    const byDir = groupBy(rows, IDX.Expansion_Direction)
    return Object.keys(byDir)
      .sort()
      .map((d) => ({
        name: d,
        value: mean(byDir[d].map((r) => r[IDX["Builtup_Growth_%"]] as number)),
      }))
  }, [rows])

  const scatterSeries = useMemo(
    () =>
      CLASSES.map((c) => ({
        cls: c,
        data: rows
          .filter((r) => r[IDX.Growth_Category] === c)
          .map((r) => ({ x: r[IDX.NDVI] as number, y: r[IDX.NDBI] as number })),
      })),
    [rows],
  )

  return (
    <div className="animate-fadein">
      <SectionTitle hint={filterSummary}>Key metrics</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[14px]">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>

      <SectionTitle>Growth patterns</SectionTitle>
      <div className="grid grid-cols-12 gap-[14px]">
        <Card className="col-span-12 lg:col-span-4" title="Growth category split" sub="Share of records by expansion tier">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" stroke="#0F1826" strokeWidth={3}>
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={CLASS_COLOR[d.name as keyof typeof CLASS_COLOR]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-8" title="Population trend" sub="Average city population by year">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={popData} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="popFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB454" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FFB454" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E2A3E" vertical={false} />
                <XAxis dataKey="year" tick={AXIS} stroke="#1E2A3E" />
                <YAxis tick={AXIS} stroke="#1E2A3E" tickFormatter={(v) => fmt(v)} width={48} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmt(v, 0)} />
                <Area type="monotone" dataKey="value" stroke="#FFB454" strokeWidth={2.5} fill="url(#popFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Top countries by urban area" sub="Average urban footprint (km²), top 10">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1E2A3E" horizontal={false} />
                <XAxis type="number" tick={AXIS} stroke="#1E2A3E" tickFormatter={(v) => fmt(v)} />
                <YAxis type="category" dataKey="name" tick={AXIS} stroke="#1E2A3E" width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" fill="#4FA3FF" radius={[0, 5, 5, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Builtup growth by expansion direction" sub="Average annual built-up growth (%) per compass direction">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dirData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1E2A3E" vertical={false} />
                <XAxis dataKey="name" tick={AXIS} stroke="#1E2A3E" interval={0} angle={-25} textAnchor="end" height={54} />
                <YAxis tick={AXIS} stroke="#1E2A3E" width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} formatter={(v: number) => v.toFixed(2) + "%"} />
                <Bar dataKey="value" fill="#3ED598" radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Green cover vs. built-up index" sub="NDVI vegetation vs. NDBI built-up index, coloured by growth tier">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 16, left: 4, bottom: 20 }}>
                <CartesianGrid stroke="#1E2A3E" />
                <XAxis type="number" dataKey="x" name="NDVI" tick={AXIS} stroke="#1E2A3E" domain={["auto", "auto"]}>
                </XAxis>
                <YAxis type="number" dataKey="y" name="NDBI" tick={AXIS} stroke="#1E2A3E" width={40} />
                <ZAxis range={[24, 24]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                {scatterSeries.map((s) => (
                  <Scatter
                    key={s.cls}
                    name={s.cls}
                    data={s.data}
                    fill={CLASS_COLOR[s.cls]}
                    fillOpacity={0.8}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 text-center text-[10.5px] text-[var(--text-faint)]">
            NDVI (vegetation) →&nbsp;&nbsp;·&nbsp;&nbsp;↑ NDBI (built-up)
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Night light intensity by year" sub="Average VIIRS-style night light index — proxy for economic activity">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nightData} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B4A" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FF6B4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E2A3E" vertical={false} />
                <XAxis dataKey="year" tick={AXIS} stroke="#1E2A3E" />
                <YAxis tick={AXIS} stroke="#1E2A3E" width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => v.toFixed(2)} />
                <Area type="monotone" dataKey="value" stroke="#FF6B4A" strokeWidth={2.5} fill="url(#nightFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
