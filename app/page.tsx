"use client"

import { useEffect, useMemo, useState } from "react"
import { DEFAULT_DATA, IDX, type Row } from "@/lib/data"
import { trainModel, type TrainedModel } from "@/lib/ml"
import { unique } from "@/lib/utils"
import { Sidebar, type TabKey } from "@/components/sidebar"
import { Topbar, type Filters } from "@/components/topbar"
import { DashboardTab } from "@/components/dashboard-tab"
import { PredictionTab } from "@/components/prediction-tab"
import { ModelTab } from "@/components/model-tab"
import { ExplorerTab } from "@/components/explorer-tab"
import { AboutTab } from "@/components/about-tab"

const TAB_META: Record<TabKey, { title: string; subtitle: string; filters: boolean }> = {
  dashboard: {
    title: "Urban Growth Dashboard",
    subtitle: "Satellite-derived expansion patterns across African cities, 2000–2025.",
    filters: true,
  },
  prediction: {
    title: "Growth Prediction",
    subtitle: "Estimate a city's growth tier from its satellite & infrastructure indicators.",
    filters: false,
  },
  model: {
    title: "Model Performance",
    subtitle: "How the in-browser softmax classifier performs on held-out data.",
    filters: false,
  },
  explorer: {
    title: "Data Explorer",
    subtitle: "Search, sort, filter and export the full city-year dataset.",
    filters: true,
  },
  about: {
    title: "About",
    subtitle: "Data indicators, methodology and modelling notes.",
    filters: false,
  },
}

const YEARS = unique(DEFAULT_DATA.map((r) => r[IDX.Year] as number))
const YEAR_MIN = YEARS[0]
const YEAR_MAX = YEARS[YEARS.length - 1]

const INITIAL_FILTERS: Filters = {
  country: "",
  city: "",
  direction: "",
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
}

export default function Page() {
  const [tab, setTab] = useState<TabKey>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [model, setModel] = useState<TrainedModel | null>(null)

  const raw = DEFAULT_DATA as Row[]

  useEffect(() => {
    // Train the classifier once on mount, deferred so the first paint is fast.
    const id = setTimeout(() => setModel(trainModel(raw)), 60)
    return () => clearTimeout(id)
  }, [raw])

  const options = useMemo(() => {
    const countries = unique(raw.map((r) => r[IDX.Country] as string))
    const cities = unique(
      raw
        .filter((r) => !filters.country || r[IDX.Country] === filters.country)
        .map((r) => r[IDX.City] as string),
    )
    const directions = unique(raw.map((r) => r[IDX.Expansion_Direction] as string))
    return { countries, cities, directions, years: YEARS }
  }, [raw, filters.country])

  const filtered = useMemo(() => {
    return raw.filter((r) => {
      if (filters.country && r[IDX.Country] !== filters.country) return false
      if (filters.city && r[IDX.City] !== filters.city) return false
      if (filters.direction && r[IDX.Expansion_Direction] !== filters.direction) return false
      const y = r[IDX.Year] as number
      if (y < filters.yearMin || y > filters.yearMax) return false
      return true
    })
  }, [raw, filters])

  const stats = useMemo(
    () => ({
      records: raw.length,
      cities: unique(raw.map((r) => r[IDX.City] as string)).length,
      countries: unique(raw.map((r) => r[IDX.Country] as string)).length,
      minYear: YEAR_MIN,
      maxYear: YEAR_MAX,
    }),
    [raw],
  )

  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (filters.country) parts.push(filters.country)
    if (filters.city) parts.push(filters.city)
    if (filters.direction) parts.push(filters.direction + " expansion")
    parts.push(`${filters.yearMin}–${filters.yearMax}`)
    return `${filtered.length.toLocaleString()} records · ${parts.join(" · ")}`
  }, [filters, filtered.length])

  const meta = TAB_META[tab]

  return (
    <div className="flex min-h-screen">
      <Sidebar
        active={tab}
        onSelect={setTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={stats}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          showFilters={meta.filters}
          filters={filters}
          onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
          onReset={() => setFilters(INITIAL_FILTERS)}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          options={options}
        />
        <div className="flex-1 px-4 py-5 md:px-7 md:py-6">
          {tab === "dashboard" && <DashboardTab rows={filtered} filterSummary={filterSummary} />}
          {tab === "prediction" && <PredictionTab raw={raw} model={model} />}
          {tab === "model" && <ModelTab model={model} />}
          {tab === "explorer" && <ExplorerTab rows={filtered} />}
          {tab === "about" && <AboutTab />}
        </div>
      </main>
    </div>
  )
}
