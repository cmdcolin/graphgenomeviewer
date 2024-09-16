import { create } from 'zustand'
import queryString from 'query-string'
import { defaults } from './util'

export interface AppState {
  strengthCenter: number
  chunkSize: number
  forceSteps: number
  linkSteps: number
  sequenceThickness: number
  linkThickness: number
  theta: number
  dataset: string
  colorScheme: string
  drawLabels: boolean
  drawNodeHandles: boolean
  drawPaths: boolean
  setStrengthCenter: (arg: number) => void
  setChunkSize: (arg: number) => void
  setForceSteps: (arg: number) => void
  setLinkSteps: (arg: number) => void
  setSequenceThickness: (arg: number) => void
  setLinkThickness: (arg: number) => void
  setTheta: (arg: number) => void
  setDataset: (arg: string) => void
  setColorScheme: (arg: string) => void
  setDrawLabels: (arg: boolean) => void
  setDrawNodeHandles: (arg: boolean) => void
  setDrawPaths: (arg: boolean) => void
}

const {
  strengthCenter,
  chunkSize,
  linkSteps,
  forceSteps,
  sequenceThickness,
  linkThickness,
  theta,
  dataset,
  colorScheme,
  drawLabels,
  drawPaths,
  drawNodeHandles,
} = queryString.parse(window.location.search)

export function getBool(key: string, def = false): boolean {
  try {
    return JSON.parse(
      localStorage.getItem(key) ?? JSON.stringify(def),
    ) as boolean
  } catch (error) {
    console.error(error)
    return def
  }
}

export function setBool(key: string, val: boolean) {
  localStorage.setItem(key, JSON.stringify(val))
}

export function getStringArray(key: string, def = [] as string[]): string[] {
  try {
    return JSON.parse(
      localStorage.getItem(key) ?? JSON.stringify(def),
    ) as string[]
  } catch (error) {
    console.error(error)
    return def
  }
}

export function setStringArray(key: string, val: string[]) {
  localStorage.setItem(key, JSON.stringify(val))
}

const coerceN = (a: unknown) => (a ? Number(a) : undefined)
const coerceS = (a: unknown) => (a ? String(a) : undefined)
const coerceB = (a: unknown) => (a ? Boolean(JSON.parse(`${a}`)) : undefined)

export const useAppStore = create<AppState>()(set => ({
  strengthCenter: coerceN(strengthCenter) ?? defaults.strengthCenter,
  chunkSize: coerceN(chunkSize) ?? defaults.chunkSize,
  forceSteps: coerceN(forceSteps) ?? defaults.forceSteps,
  linkSteps: coerceN(linkSteps) ?? defaults.linkSteps,
  sequenceThickness: coerceN(sequenceThickness) ?? defaults.sequenceThickness,
  linkThickness: coerceN(linkThickness) ?? defaults.linkThickness,
  theta: coerceN(theta) ?? defaults.theta,
  dataset: coerceS(dataset) ?? defaults.dataset,
  colorScheme: coerceS(colorScheme) ?? defaults.colorScheme,
  drawLabels: coerceB(drawLabels) ?? defaults.drawLabels,
  drawNodeHandles: coerceB(drawNodeHandles) ?? defaults.drawNodeHandles,
  drawPaths: coerceB(drawPaths) ?? defaults.drawPaths,
  setStrengthCenter: arg => {
    set(() => ({ strengthCenter: arg }))
  },
  setChunkSize: arg => {
    set(() => ({ chunkSize: arg }))
  },
  setForceSteps: arg => {
    set(() => ({ forceSteps: arg }))
  },
  setLinkSteps: arg => {
    set(() => ({ linkSteps: arg }))
  },
  setSequenceThickness: arg => {
    set(() => ({ sequenceThickness: arg }))
  },
  setLinkThickness: arg => {
    set(() => ({ linkThickness: arg }))
  },
  setTheta: arg => {
    set(() => ({ theta: arg }))
  },
  setDataset: arg => {
    set(() => ({ dataset: arg }))
  },
  setColorScheme: arg => {
    set(() => ({ colorScheme: arg }))
  },
  setDrawLabels: arg => {
    set(() => ({ drawLabels: arg }))
  },
  setDrawNodeHandles: arg => {
    set(() => ({ drawNodeHandles: arg }))
  },
  setDrawPaths: arg => {
    set(() => ({ drawPaths: arg }))
  },
}))
