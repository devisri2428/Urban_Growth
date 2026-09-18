import rawData from "./urban-growth-data.json"

// Each row is a tuple of mixed string/number values, matching COLS order.
export type Row = (string | number)[]

export const COLS = [
  "City",
  "Country",
  "Year",
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
  "Expansion_Direction",
  "Land_Use_Change_%",
  "Growth_Category",
] as const

export type Col = (typeof COLS)[number]

export const IDX: Record<Col, number> = COLS.reduce(
  (acc, c, i) => {
    acc[c] = i
    return acc
  },
  {} as Record<Col, number>,
)

export const FEATURES = [
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
] as const

export type Feature = (typeof FEATURES)[number]

export const FEATURE_STEP: Record<Feature, number> = {
  Population: 10000,
  Urban_Area_km2: 1,
  "Builtup_Growth_%": 0.1,
  "Green_Cover_%": 0.1,
  "Water_Cover_%": 0.05,
  Road_Density_km_per_km2: 0.1,
  Night_Light_Index: 0.5,
  NDVI: 0.01,
  NDBI: 0.01,
  Urban_Density_persons_per_km2: 50,
  "Land_Use_Change_%": 0.1,
}

export const CLASSES = ["Low", "Medium", "High"] as const
export type GrowthClass = (typeof CLASSES)[number]

export const CLASS_COLOR: Record<GrowthClass, string> = {
  Low: "#4FA3FF",
  Medium: "#FFB454",
  High: "#FF6B4A",
}

export const DEFAULT_DATA = rawData as Row[]

export function num(row: Row, col: Col): number {
  return row[IDX[col]] as number
}

export function str(row: Row, col: Col): string {
  return row[IDX[col]] as string
}
