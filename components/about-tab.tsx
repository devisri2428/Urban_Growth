"use client"

import { Card, SectionTitle } from "./ui"

const INDICATORS: { name: string; desc: string }[] = [
  { name: "Population", desc: "Estimated city population for the year." },
  { name: "Urban Area (km²)", desc: "Built-up urban footprint derived from satellite imagery." },
  { name: "Builtup Growth %", desc: "Annual rate of built-up surface expansion." },
  { name: "Green Cover %", desc: "Share of the city covered by vegetation." },
  { name: "Water Cover %", desc: "Share of surface water within the city extent." },
  { name: "Road Density", desc: "Kilometres of road per square kilometre." },
  { name: "Night Light Index", desc: "VIIRS-style night-time luminosity, a proxy for economic activity." },
  { name: "NDVI", desc: "Normalized Difference Vegetation Index (0–1)." },
  { name: "NDBI", desc: "Normalized Difference Built-up Index." },
  { name: "Urban Density", desc: "Persons per square kilometre." },
  { name: "Land Use Change %", desc: "Net change in land classification vs. baseline." },
]

export function AboutTab() {
  return (
    <div className="animate-fadein">
      <SectionTitle>About this dashboard</SectionTitle>
      <div className="grid grid-cols-12 gap-[14px]">
        <Card className="col-span-12 lg:col-span-7" title="Overview">
          <p className="mt-3 text-[13px] leading-[1.7] text-[var(--text-dim)]">
            This dashboard explores satellite-derived urban growth across African cities between 2000
            and 2025. Each record combines demographic, infrastructure and remote-sensing indicators
            into a single yearly snapshot per city, and every city-year is labelled with a growth
            tier: <b className="text-[var(--water)]">Low</b>, <b className="text-[var(--light)]">Medium</b>{" "}
            or <b className="text-[var(--built)]">High</b>.
          </p>
          <p className="mt-3 text-[13px] leading-[1.7] text-[var(--text-dim)]">
            A multinomial logistic-regression classifier (softmax regression) is trained entirely in
            your browser when the page loads. It standardizes the eleven numeric indicators, learns
            weights with batch gradient descent, and is evaluated on a held-out 20% test split — so
            the accuracy, confusion matrix and feature-importance figures reflect a live model rather
            than pre-computed numbers.
          </p>
          <p className="mt-3 text-[13px] leading-[1.7] text-[var(--text-dim)]">
            Use the <b className="text-[var(--text)]">Growth Prediction</b> tab to run what-if
            scenarios, the <b className="text-[var(--text)]">Model Performance</b> tab to inspect how
            well the classifier generalizes, and the <b className="text-[var(--text)]">Data Explorer</b>{" "}
            to search, sort and export the underlying records.
          </p>
        </Card>

        <Card className="col-span-12 lg:col-span-5" title="Methodology notes">
          <ul className="mt-3 list-none space-y-[10px] p-0 text-[12.5px] leading-[1.6] text-[var(--text-dim)]">
            {[
              "Features are z-score standardized using statistics from the training split only.",
              "Softmax regression with L2 regularization, learning rate 0.5, 400 epochs.",
              "80 / 20 shuffle split; metrics are macro-averaged across the three tiers.",
              "Feature importance = mean absolute standardized weight per indicator.",
              "All computation runs client-side — no data leaves your browser.",
            ].map((t, i) => (
              <li key={i} className="flex gap-[10px]">
                <span className="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-[var(--light)]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="col-span-12" title="Indicator glossary">
          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-[10px] sm:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.map((ind) => (
              <div key={ind.name} className="border-b border-[var(--border-soft)] pb-[10px]">
                <div className="text-[12.5px] font-semibold text-[var(--text)]">{ind.name}</div>
                <div className="mt-[2px] text-[11.5px] leading-[1.5] text-[var(--text-faint)]">
                  {ind.desc}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
