"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CLASS_COLOR, CLASSES, FEATURE_STEP, FEATURES, IDX, type Row } from "@/lib/data"
import type { TrainedModel } from "@/lib/ml"
import { fmt, mean } from "@/lib/utils"
import { Card, SectionTitle } from "./ui"

interface FeatureMeta {
  name: string
  min: number
  max: number
  start: number
  step: number
}

interface PredictionResult {
  predIdx: number
  predClass: string
  probs: number[]
  contribs: { f: string; val: number }[]
}

function Gauge({ predIdx }: { predIdx: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h - 6
    const r = 90
    const segColors = ["#4FA3FF", "#FFB454", "#FF6B4A"]
    const startAngle = Math.PI
    const sweep = Math.PI / 3
    segColors.forEach((col, i) => {
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle + i * sweep, startAngle + (i + 1) * sweep)
      ctx.lineWidth = 18
      ctx.strokeStyle = col + (i === predIdx ? "FF" : "33")
      ctx.stroke()
    })
    if (predIdx !== null && predIdx !== undefined) {
      const needleAngle = startAngle + (predIdx + 0.5) * sweep
      const nx = cx + (r - 24) * Math.cos(needleAngle)
      const ny = cy + (r - 24) * Math.sin(needleAngle)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(nx, ny)
      ctx.lineWidth = 3
      ctx.strokeStyle = "#EAF0F7"
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#EAF0F7"
      ctx.fill()
    }
  }, [predIdx])

  return <canvas ref={canvasRef} width={220} height={130} className="mx-auto block" />
}

export function PredictionTab({ raw, model }: { raw: Row[]; model: TrainedModel | null }) {
  const featureMeta: FeatureMeta[] = useMemo(
    () =>
      FEATURES.map((f) => {
        const vals = raw.map((r) => r[IDX[f]] as number)
        const min = Math.min(...vals)
        const max = Math.max(...vals)
        const start = mean(vals)
        return { name: f, min, max, start, step: FEATURE_STEP[f] || (max - min) / 100 }
      }),
    [raw],
  )

  const [values, setValues] = useState<Record<string, number>>({})
  const [result, setResult] = useState<PredictionResult | null>(null)

  useEffect(() => {
    const init: Record<string, number> = {}
    featureMeta.forEach((m) => (init[m.name] = m.start))
    setValues(init)
    setResult(null)
  }, [featureMeta])

  function predict() {
    if (!model) return
    const input = FEATURES.map((f) => values[f] ?? 0)
    const z = model.standardize(input)
    const probs = model.softmaxRow(z)
    const predIdx = probs.indexOf(Math.max(...probs))
    const contribs = FEATURES.map((f, j) => ({ f, val: z[j] * model.W[j][predIdx] }))
    contribs.sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
    setResult({ predIdx, predClass: CLASSES[predIdx], probs, contribs })
  }

  const maxAbs = result ? Math.max(...result.contribs.map((c) => Math.abs(c.val)), 0.001) : 1

  return (
    <div className="animate-fadein">
      <SectionTitle hint="Client-side softmax regression, trained on load">
        Growth category prediction
      </SectionTitle>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="City indicators" sub="Adjust satellite & infrastructure indicators to estimate the growth tier">
          <div className="mt-4">
            {featureMeta.map((m) => (
              <div key={m.name} className="mb-4">
                <div className="mb-[6px] flex justify-between text-[12.5px]">
                  <span>{m.name.replace(/_/g, " ")}</span>
                  <span className="font-display font-semibold text-[var(--light)]">
                    {(values[m.name] ?? m.start).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={m.min}
                  max={m.max}
                  step={m.step}
                  value={values[m.name] ?? m.start}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [m.name]: parseFloat(e.target.value) }))
                  }
                />
                <div className="mt-[2px] flex justify-between text-[10px] text-[var(--text-faint)]">
                  <span>{fmt(m.min)}</span>
                  <span>{fmt(m.max)}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={predict}
            className="mt-[6px] w-full cursor-pointer rounded-[7px] border-none px-[14px] py-2 text-[12.5px] font-semibold text-[#1a1206] transition-[filter] hover:brightness-110"
            style={{ background: "linear-gradient(135deg, var(--light), #ff9640)" }}
          >
            Predict growth category
          </button>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="text-center" title="Predicted tier">
            <div className="relative mx-auto mt-[10px] h-[130px] w-[220px]">
              <Gauge predIdx={result ? result.predIdx : null} />
            </div>
            <div
              className="mt-[6px] font-display text-[30px] font-bold"
              style={{ color: result ? CLASS_COLOR[result.predClass as keyof typeof CLASS_COLOR] : undefined }}
            >
              {result ? result.predClass : "—"}
            </div>
            <div className="text-[12.5px] text-[var(--text-dim)]">
              {result
                ? `${(result.probs[result.predIdx] * 100).toFixed(1)}% confidence`
                : "Adjust indicators and predict"}
            </div>
            <div className="mx-auto mt-[6px] flex w-[220px] justify-between text-[10px] uppercase tracking-[0.4px] text-[var(--text-faint)]">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            {result && (
              <div className="mt-[14px] flex flex-col gap-[10px]">
                {CLASSES.map((c, i) => (
                  <div key={c} className="flex items-center gap-[10px] text-[12px]">
                    <span className="w-[60px] flex-none text-left text-[var(--text-dim)]">{c}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-[5px] bg-[var(--panel-2)]">
                      <span
                        className="block h-full rounded-[5px]"
                        style={{ width: `${(result.probs[i] * 100).toFixed(1)}%`, background: CLASS_COLOR[c] }}
                      />
                    </span>
                    <span className="w-[42px] text-right font-display font-semibold">
                      {(result.probs[i] * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="What's driving this prediction?" sub="Standardized contribution of each indicator toward the predicted tier">
            <div className="mt-[14px]">
              {!result && (
                <div className="text-[12px] text-[var(--text-faint)]">
                  Run a prediction to see indicator contributions.
                </div>
              )}
              {result &&
                result.contribs.slice(0, 8).map((c) => {
                  const pct = (Math.abs(c.val) / maxAbs) * 50
                  const pos = c.val >= 0
                  return (
                    <div key={c.f} className="mb-[9px] flex items-center gap-[10px] text-[12px]">
                      <span className="w-[150px] flex-none text-[11.5px] text-[var(--text-dim)]">
                        {c.f.replace(/_/g, " ")}
                      </span>
                      <span className="relative h-4 flex-1 overflow-hidden rounded-[4px] bg-[var(--panel-2)]">
                        <span className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border)]" />
                        <span
                          className="absolute top-0 bottom-0 rounded-[4px]"
                          style={
                            pos
                              ? {
                                  left: "50%",
                                  width: `${pct}%`,
                                  background: "linear-gradient(90deg, rgba(62,213,152,0.35), var(--veg))",
                                }
                              : {
                                  right: "50%",
                                  width: `${pct}%`,
                                  background: "linear-gradient(90deg, var(--built), rgba(255,107,74,0.35))",
                                }
                          }
                        />
                      </span>
                      <span
                        className="w-[52px] text-right font-display text-[11px] font-semibold"
                        style={{ color: pos ? "var(--veg)" : "var(--built)" }}
                      >
                        {pos ? "+" : ""}
                        {c.val.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
