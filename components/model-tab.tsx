"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { CLASS_COLOR, CLASSES, FEATURES } from "@/lib/data"
import type { TrainedModel } from "@/lib/ml"
import { Card, SectionTitle, TOOLTIP_STYLE } from "./ui"

const AXIS = { fontSize: 11, fill: "#7C8AA3" }

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] border border-[var(--border-soft)] bg-[var(--panel)] p-4 text-center">
      <div className="font-display text-[24px] font-bold">{value}</div>
      <div className="mt-1 text-[10.5px] uppercase tracking-[0.5px] text-[var(--text-faint)]">
        {label}
      </div>
    </div>
  )
}

export function ModelTab({ model }: { model: TrainedModel | null }) {
  const importanceData = useMemo(() => {
    if (!model) return []
    return FEATURES.map((f, i) => ({ name: f, value: model.importance[i] })).sort(
      (a, b) => b.value - a.value,
    )
  }, [model])

  if (!model) {
    return (
      <div className="animate-fadein">
        <SectionTitle>Model performance</SectionTitle>
        <Card>
          <div className="py-10 text-center text-[13px] text-[var(--text-dim)]">
            Training the in-browser classifier…
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fadein">
      <SectionTitle hint="Evaluated on a held-out 20% test split (computed in-browser, not pre-baked)">
        Model performance
      </SectionTitle>

      <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[14px]">
        <Metric value={(model.accuracy * 100).toFixed(1) + "%"} label="Accuracy" />
        <Metric value={(model.macroPrecision * 100).toFixed(1) + "%"} label="Macro precision" />
        <Metric value={(model.macroRecall * 100).toFixed(1) + "%"} label="Macro recall" />
        <Metric value={(model.macroF1 * 100).toFixed(1) + "%"} label="Macro F1" />
        <Metric value={model.trainSize.toLocaleString()} label="Train rows" />
        <Metric value={model.testSize.toLocaleString()} label="Test rows" />
      </div>

      <div className="grid grid-cols-12 gap-[14px]">
        <Card className="col-span-12 lg:col-span-6" title="Confusion matrix" sub="Rows = actual tier, columns = predicted tier (test set)">
          <div className="mt-[10px] overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <th className="border border-[var(--border-soft)] p-[9px]" />
                  {CLASSES.map((c) => (
                    <th
                      key={c}
                      className="border border-[var(--border-soft)] p-[9px] text-[11px] font-semibold uppercase text-[var(--text-dim)]"
                    >
                      Pred {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLASSES.map((c, ri) => (
                  <tr key={c}>
                    <td className="border border-[var(--border-soft)] bg-[var(--panel-2)] p-[9px] font-semibold text-[var(--text-dim)]">
                      Actual {c}
                    </td>
                    {CLASSES.map((_, ci) => (
                      <td
                        key={ci}
                        className={`border border-[var(--border-soft)] p-[9px] text-center ${
                          ri === ci ? "font-bold text-[var(--veg)]" : ""
                        }`}
                      >
                        {model.cm[ri][ci]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Precision / recall / F1 by class">
          <div className="mt-[10px] overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  {["Class", "Precision", "Recall", "F1", "Support"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-[var(--border-soft)] p-[8px] text-left text-[10.5px] font-semibold uppercase text-[var(--text-faint)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {model.perClass.map((p) => (
                  <tr key={p.cls}>
                    <td className="border-b border-[var(--border-soft)] p-[8px]">
                      <span className="inline-flex items-center gap-[6px] font-semibold">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: CLASS_COLOR[p.cls as keyof typeof CLASS_COLOR] }}
                        />
                        {p.cls}
                      </span>
                    </td>
                    <td className="border-b border-[var(--border-soft)] p-[8px]">{(p.precision * 100).toFixed(1)}%</td>
                    <td className="border-b border-[var(--border-soft)] p-[8px]">{(p.recall * 100).toFixed(1)}%</td>
                    <td className="border-b border-[var(--border-soft)] p-[8px]">{(p.f1 * 100).toFixed(1)}%</td>
                    <td className="border-b border-[var(--border-soft)] p-[8px]">{p.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12" title="Feature importance" sub="Mean absolute standardized weight across the three growth classes">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importanceData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1E2A3E" horizontal={false} />
                <XAxis type="number" tick={AXIS} stroke="#1E2A3E" />
                <YAxis type="category" dataKey="name" tick={AXIS} stroke="#1E2A3E" width={190} tickFormatter={(v: string) => v.replace(/_/g, " ")} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} formatter={(v: number) => v.toFixed(3)} />
                <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={20}>
                  {importanceData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#FFB454" : "#2A3B54"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
