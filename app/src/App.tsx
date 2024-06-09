import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Graph from 'graphgenomeviewer'
import saveAs from 'file-saver'

// locals
import FeatureDialog from './FeatureDialog'
import Sidebar from './Sidebar'
import Header from './Header'
import { parseGFA } from './util'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { proxy, useSnapshot } from 'valtio'

interface StoreProps {
  strengthCenter: number
  strengthXY: number
  chunkSize: number
  forceSteps: number
  linkSteps: number
  sequenceThickness: number
  linkThickness: number
  theta: number
  dataset: string
  colorScheme: string
  drawLabels: boolean
  drawPaths: boolean
  drag: boolean
}
const coerceN = (a: unknown) => (a ? Number(a) : undefined)
const coerceS = (a: unknown) => (a ? String(a) : undefined)
const coerceB = (a: unknown) => (a ? Boolean(JSON.parse(`${a}`)) : undefined)

function App() {
  const [data, setData] = useState<string>()
  const [error, setError] = useState<unknown>()
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
  const [exportSVG, setExportSVG] = useState(0)

  const { dataset } = store

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        setError(undefined)
        const result = await fetch(dataset)
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
  }, [dataset])

  const graph = useMemo(() => (data ? parseGFA(data) : undefined), [data])

  return (
    <div>
      <Header store={store} onExportSVG={() => setExportSVG(exportSVG + 1)} />

      <div className="flexcontainer">
        <div id="sidebar" className="sidebar">
          <Sidebar
            store={store}
            onExportSVG={() => setExportSVG(exportSVG + 1)}
          />
        </div>
        <div>
          {error ? (
            <ErrorMessage error={error} />
          ) : (
            <GraphArea exportSVG={exportSVG} graph={graph} store={store} />
          )}
        </div>
      </div>
    </div>
  )
}

function GraphArea({
  graph,
  exportSVG,
  store,
}: {
  graph: Graph
  exportSVG: number
  store: { colorScheme: string; drawLabels: boolean; drawPaths: boolean }
}) {
  const [featureData, setFeatureData] = useState<Record<string, unknown>>()
  const ref = useRef<HTMLDivElement>(null)
  const snap = useSnapshot(store)

  const onFeatureClick = useCallback(
    (data?: Record<string, unknown>) => setFeatureData(data),
    [],
  )
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
  return (
    <div className="body" ref={ref}>
      {featureData ? (
        <FeatureDialog
          data={featureData}
          onHide={() => setFeatureData(undefined)}
        />
      ) : null}
      {graph ? (
        <Graph graph={graph} onFeatureClick={onFeatureClick} {...snap} />
      ) : null}
    </div>
  )
}

function ErrorMessage({ error }: { error: unknown }) {
  return <div style={{ color: 'red' }}>{`${error}`}</div>
}

export default App
