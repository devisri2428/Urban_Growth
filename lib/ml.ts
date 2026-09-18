import { CLASSES, FEATURES, IDX, type Row } from "./data"
import { mean } from "./utils"

export interface PerClassMetric {
  cls: string
  precision: number
  recall: number
  f1: number
  support: number
}

export interface TrainedModel {
  W: number[][]
  b: number[]
  meanArr: number[]
  stdArr: number[]
  accuracy: number
  cm: number[][]
  perClass: PerClassMetric[]
  macroF1: number
  macroPrecision: number
  macroRecall: number
  importance: number[]
  testSize: number
  trainSize: number
  standardize: (row: number[]) => number[]
  softmaxRow: (row: number[]) => number[]
}

/**
 * Softmax (multinomial logistic) regression trained from scratch with batch
 * gradient descent. Ported 1:1 from the original in-browser implementation:
 * z-score standardization on the train split, 80/20 shuffle, and a live
 * evaluation (accuracy / precision / recall / F1 / confusion matrix).
 */
export function trainModel(data: Row[]): TrainedModel {
  const X = data.map((r) => FEATURES.map((f) => r[IDX[f]] as number))
  const y = data.map((r) => CLASSES.indexOf(r[IDX.Growth_Category] as (typeof CLASSES)[number]))

  // shuffle + split 80/20
  const idx = X.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  const nTest = Math.floor(idx.length * 0.2)
  const testIdx = idx.slice(0, nTest)
  const trainIdx = idx.slice(nTest)

  const Xtr = trainIdx.map((i) => X[i])
  const ytr = trainIdx.map((i) => y[i])
  const Xte = testIdx.map((i) => X[i])
  const yte = testIdx.map((i) => y[i])

  const d = FEATURES.length
  const k = CLASSES.length
  const meanArr = new Array(d).fill(0)
  const stdArr = new Array(d).fill(1)
  for (let j = 0; j < d; j++) {
    const col = Xtr.map((r) => r[j])
    meanArr[j] = mean(col)
    stdArr[j] = Math.sqrt(mean(col.map((v) => (v - meanArr[j]) ** 2))) || 1
  }
  const standardize = (row: number[]) => row.map((v, j) => (v - meanArr[j]) / stdArr[j])
  const XtrS = Xtr.map(standardize)
  const XteS = Xte.map(standardize)

  const W: number[][] = Array.from({ length: d }, () => new Array(k).fill(0))
  const b: number[] = new Array(k).fill(0)
  const n = XtrS.length
  const lr = 0.5
  const l2 = 0.001
  const epochs = 400

  function softmaxRow(row: number[]): number[] {
    const logits = new Array(k).fill(0)
    for (let c = 0; c < k; c++) {
      let s = b[c]
      for (let j = 0; j < d; j++) s += row[j] * W[j][c]
      logits[c] = s
    }
    const m = Math.max(...logits)
    const exps = logits.map((v) => Math.exp(v - m))
    const sum = exps.reduce((a, v) => a + v, 0)
    return exps.map((v) => v / sum)
  }

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gW: number[][] = Array.from({ length: d }, () => new Array(k).fill(0))
    const gb: number[] = new Array(k).fill(0)
    for (let i = 0; i < n; i++) {
      const p = softmaxRow(XtrS[i])
      for (let c = 0; c < k; c++) {
        const err = p[c] - (ytr[i] === c ? 1 : 0)
        gb[c] += err
        for (let j = 0; j < d; j++) gW[j][c] += XtrS[i][j] * err
      }
    }
    for (let j = 0; j < d; j++)
      for (let c = 0; c < k; c++) {
        W[j][c] -= lr * (gW[j][c] / n + l2 * W[j][c])
      }
    for (let c = 0; c < k; c++) b[c] -= lr * (gb[c] / n)
  }

  // Evaluate on the held-out test split
  const cm: number[][] = Array.from({ length: k }, () => new Array(k).fill(0))
  let correct = 0
  for (let i = 0; i < XteS.length; i++) {
    const p = softmaxRow(XteS[i])
    const pred = p.indexOf(Math.max(...p))
    cm[yte[i]][pred]++
    if (pred === yte[i]) correct++
  }
  const accuracy = correct / XteS.length
  const perClass: PerClassMetric[] = CLASSES.map((c, ci) => {
    const tp = cm[ci][ci]
    const fp = cm.reduce((s, row, ri) => (ri === ci ? s : s + row[ci]), 0)
    const fn = cm[ci].reduce((s, v, cj) => (cj === ci ? s : s + v), 0)
    const precision = tp / (tp + fp) || 0
    const recall = tp / (tp + fn) || 0
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0
    return { cls: c, precision, recall, f1, support: cm[ci].reduce((a, v) => a + v, 0) }
  })
  const macroF1 = mean(perClass.map((p) => p.f1))
  const macroPrecision = mean(perClass.map((p) => p.precision))
  const macroRecall = mean(perClass.map((p) => p.recall))

  const importance = FEATURES.map((_, j) => mean(CLASSES.map((_, c) => Math.abs(W[j][c]))))

  return {
    W,
    b,
    meanArr,
    stdArr,
    accuracy,
    cm,
    perClass,
    macroF1,
    macroPrecision,
    macroRecall,
    importance,
    testSize: XteS.length,
    trainSize: XtrS.length,
    standardize,
    softmaxRow,
  }
}
