import { useEffect, useRef, useState } from 'react'
import { GFAGraph } from 'graphgenomeviewer'
import { proxy, subscribe, useSnapshot } from 'valtio'
import { saveAs } from 'file-saver'

// locals
import FeatureDialog from './FeatureDialog'
import Sidebar from './Sidebar'
import Header from './Header'
import { defaults } from './util'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

interface StoreProps {
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
}
const coerceN = (a: unknown) => (a ? Number(a) : undefined)
const coerceS = (a: unknown) => (a ? String(a) : undefined)
const coerceB = (a: unknown) => (a ? Boolean(JSON.parse(`${a}`)) : undefined)

function ParamAdapter() {
  const params = new URLSearchParams(window.location.search)
  const store = proxy({
    strengthCenter:
      coerceN(params.get('strengthCenter')) ?? defaults.strengthCenter,
    chunkSize: coerceN(params.get('chunkSize')) ?? defaults.chunkSize,
    linkSteps: coerceN(params.get('linkSteps')) ?? defaults.linkSteps,
    forceSteps: coerceN(params.get('forceSteps')) ?? defaults.forceSteps,
    sequenceThickness:
      coerceN(params.get('sequenceThickness')) ?? defaults.sequenceThickness,
    linkThickness:
      coerceN(params.get('linkThickness')) ?? defaults.linkThickness,
    theta: coerceN(params.get('theta')) ?? defaults.theta,
    dataset: coerceS(params.get('dataset')) ?? defaults.dataset,
    colorScheme: coerceS(params.get('colorScheme')) ?? defaults.colorScheme,
    drawLabels: coerceB(params.get('drawLabels')) ?? defaults.drawLabels,
    drawPaths: coerceB(params.get('drawPaths')) ?? defaults.drawPaths,
    drawNodeHandles:
      coerceB(params.get('drawNodeHandles')) ?? defaults.drawPaths,
  })
  useEffect(
    () =>
      subscribe(store, () => {
        const s = new URLSearchParams(
          Object.fromEntries(
            Object.entries(store)
              .map(([key, val]) =>
                val === defaults[key as keyof typeof defaults]
                  ? undefined
                  : [key, `${val}`],
              )
              .filter((f): f is [string, string] => !!f),
          ),
        )
        window.history.replaceState(null, '', '?' + s.toString())
      }),
    [store],
  )
  return <App store={store} />
}

function App({ store }: { store: StoreProps }) {
  const [exportSVG, setExportSVG] = useState(0)
  const [redraw, setRedraw] = useState(0)

  return (
    <div>
      <Header store={store} onExportSVG={() => setExportSVG(exportSVG + 1)} />

      <div className="flexcontainer">
        <Sidebar
          store={store}
          onExportSVG={() => setExportSVG(exportSVG + 1)}
          onRedraw={() => setRedraw(redraw + 1)}
        />
        <GraphArea store={store} exportSVG={exportSVG} redraw={redraw} />
      </div>
    </div>
  )
}

function GraphArea({
  exportSVG,
  store,
  redraw,
}: {
  exportSVG: number
  store: StoreProps
  redraw: number
}) {
  const [featureData, setFeatureData] = useState<Record<string, unknown>>()
  const ref = useRef<HTMLDivElement>(null)
  const snap = useSnapshot(store)
  const [data, setData] = useState<string>()
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    if (!ref.current) {
      return
    }
    if (exportSVG) {
      saveAs(
        new Blob([ref.current.innerHTML || ''], { type: 'image/svg+xml' }),
        'out.svg',
      )
    }
  }, [exportSVG])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        setError(undefined)
        const result = await fetch(snap.dataset)
        if (!result.ok) {
          throw new Error(
            `HTTP ${result.status} fetching ${snap.dataset} (${await result.text()})`,
          )
        }
        const text = await result.text()
        setData(text)
      } catch (error) {
        console.error(error)
        setError(error)
      }
    })()
  }, [snap.dataset])

  return (
    <div className="body" ref={ref}>
      {featureData ? (
        <FeatureDialog
          data={featureData}
          onHide={() => setFeatureData(undefined)}
        />
      ) : null}

      {error ? (
        <ErrorMessage error={error} />
      ) : data ? (
        <GFAGraph
          key={data + '-' + redraw + '-' + snap.chunkSize}
          data={data}
          onFeatureClick={data => setFeatureData(data)}
          {...snap}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

function ErrorMessage({ error }: { error: unknown }) {
  return <div style={{ color: 'red' }}>{`${error}`}</div>
}

export default ParamAdapter
