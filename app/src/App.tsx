import { useEffect, useRef, useState } from 'react'
import { GFAGraph } from 'graphgenomeviewer'
import { saveAs } from 'file-saver'

// locals
import FeatureDialog from './FeatureDialog'
import Sidebar from './Sidebar'
import Header from './Header'

// utils
import { defaults } from './util'
import { useAppStore } from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [exportSVG, setExportSVG] = useState(0)
  const [redraw, setRedraw] = useState(0)

  useEffect(
    () =>
      useAppStore.subscribe(state => {
        const {
          strengthCenter,
          chunkSize,
          forceSteps,
          linkSteps,
          sequenceThickness,
          linkThickness,
          theta,
          dataset,
          colorScheme,
          drawLabels,
          drawNodeHandles,
          drawPaths,
        } = state
        const s = new URLSearchParams(
          Object.fromEntries(
            Object.entries({
              strengthCenter,
              chunkSize,
              forceSteps,
              linkSteps,
              sequenceThickness,
              linkThickness,
              theta,
              dataset,
              colorScheme,
              drawLabels,
              drawNodeHandles,
              drawPaths,
            })
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
    [],
  )

  return (
    <div>
      <Header
        onExportSVG={() => {
          setExportSVG(exportSVG + 1)
        }}
      />

      <div className="flexcontainer">
        <Sidebar
          onExportSVG={() => {
            setExportSVG(exportSVG + 1)
          }}
          onRedraw={() => {
            setRedraw(redraw + 1)
          }}
        />
        <GraphArea exportSVG={exportSVG} redraw={redraw} />
      </div>
    </div>
  )
}

function GraphArea({
  exportSVG,
  redraw,
}: {
  exportSVG: number
  redraw: number
}) {
  const store = useAppStore()
  const [featureData, setFeatureData] = useState<Record<string, unknown>>()
  const ref = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<string>()
  const [error, setError] = useState<unknown>()
  const { dataset, chunkSize } = store

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
        const result = await fetch(dataset)
        if (!result.ok) {
          throw new Error(
            `HTTP ${result.status} fetching ${dataset} (${await result.text()})`,
          )
        }
        const text = await result.text()
        setData(text)
      } catch (error) {
        console.error(error)
        setError(error)
      }
    })()
  }, [dataset])

  return (
    <div className="body" ref={ref}>
      {featureData ? (
        <FeatureDialog
          data={featureData}
          onHide={() => {
            setFeatureData(undefined)
          }}
        />
      ) : null}

      {error ? (
        <ErrorMessage error={error} />
      ) : data ? (
        <GFAGraph
          key={data + '-' + redraw + '-' + chunkSize}
          data={data}
          onFeatureClick={data => {
            setFeatureData(data)
          }}
          {...store}
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

export default App
