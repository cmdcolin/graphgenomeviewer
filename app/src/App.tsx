import { useEffect, useMemo, useRef, useState } from 'react'
import Graph from 'graphgenomeviewer'
import saveAs from 'file-saver'
import { proxy, useSnapshot } from 'valtio'

// locals
import FeatureDialog from './FeatureDialog'
import Sidebar from './Sidebar'
import Header from './Header'
import { parseGFA } from './util'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

interface StoreProps {
  strengthCenter: number
  strengthXY: number
  chunkSize: number
  forceSteps: number
  linkSteps: number
  sequenceThickness: number
  linkThickness: number
  theta: number
  runSimulation: boolean
  dataset: string
  colorScheme: string
  drawLabels: boolean
  drawPaths: boolean
}
const coerceN = (a: unknown) => (a ? Number(a) : undefined)
const coerceS = (a: unknown) => (a ? String(a) : undefined)
const coerceB = (a: unknown) => (a ? Boolean(JSON.parse(`${a}`)) : undefined)

function ParamAdapter() {
  const params = new URLSearchParams(window.location.search)
  const store = proxy({
    runSimulation: true,
    strengthCenter: coerceN(params.get('strengthCenter')) ?? -50,
    strengthXY: coerceN(params.get('strengthXY')) ?? 0.1,
    chunkSize: coerceN(params.get('chunkSize')) ?? 1000,
    linkSteps: coerceN(params.get('linkSteps')) ?? 3,
    forceSteps: coerceN(params.get('forceSteps')) ?? 200,
    sequenceThickness: coerceN(params.get('sequenceThickness')) ?? 10,
    linkThickness: coerceN(params.get('linkThickness')) ?? 2,
    theta: coerceN(params.get('theta')) ?? 0.9,
    forceType: coerceS(params.get('forceType')) ?? 'center',
    dataset: coerceS(params.get('dataset')) ?? 'MT.gfa',
    colorScheme: coerceS(params.get('colorScheme')) ?? 'Rainbow',
    drawLabels: coerceB(params.get('drawLabels')) ?? false,
    drawPaths: coerceB(params.get('drawPaths')) ?? false,
  })
  return <App store={store} />
}

function App({ store }: { store: StoreProps }) {
  const [exportSVG, setExportSVG] = useState(0)

  return (
    <div>
      <Header store={store} onExportSVG={() => setExportSVG(exportSVG + 1)} />

      <div className="flexcontainer">
        <Sidebar
          store={store}
          onExportSVG={() => setExportSVG(exportSVG + 1)}
        />
        <GraphArea store={store} exportSVG={exportSVG} />
      </div>
    </div>
  )
}

function GraphArea({
  exportSVG,
  store,
}: {
  exportSVG: number
  store: StoreProps
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
          throw new Error(`Failed to fetch ${result.statusText}`)
        }
        const text = await result.text()
        setData(text)
      } catch (error) {
        console.error(error)
        setError(error)
      }
    })()
  }, [snap.dataset])

  const graph = useMemo(() => (data ? parseGFA(data) : undefined), [data])
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
      ) : graph ? (
        <Graph
          key={JSON.stringify(graph)}
          graph={graph}
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
