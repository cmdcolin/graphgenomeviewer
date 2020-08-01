import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FeatureDialog } from './FeatureDialog'
import { Graph } from './Graph'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { parseGFA } from './util'
import { serialize } from './util'
import saveAs from 'file-saver'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [featureData, setFeatureData] = useState()
  const [dataset, setDataset] = useState('MT.gfa')
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [color, setColor] = useState('Rainbow')
  const [pathDraw, setPathDraw] = useState(false)
  const [redraw, setRedraw] = useState(0)
  const [drawLabels, setDrawLabels] = useState(false)
  const [settings, setSettings] = useState({
    strengthCenter: -50,
    strengthXY: 0.1,
    forceType: 'center',
    chunkSize: 1000,
    forceSteps: 200,
    linkSteps: 1,
    sequenceThickness: 10,
    linkThickness: 2,
    theta: 0.9,
  })
  const ref = useRef()
  useEffect(() => {
    ;(async () => {
      try {
        const result = await fetch(dataset)
        if (!result.ok) {
          throw new Error(`Failed to fetch ${result.statusText}`)
        }
        const text = await result.text()
        setData(text)
        setError(undefined)
      } catch (e) {
        console.error(e)
        setError(e.message)
      }
    })()
  }, [dataset])

  const graph = useMemo(() => {
    return data ? parseGFA(data) : undefined
  }, [data])

  return (
    <div>
      <Header
        onData={d => {
          setDataset(d)
        }}
        onGraph={d => {
          setData(d)
        }}
        onSettings={d => {
          setSettings(d)
        }}
        onExportSVG={() => {
          saveAs(serialize(ref.current))
        }}
        settings={settings}
      />
      {featureData ? (
        <FeatureDialog
          data={featureData}
          onModal={data => {
            setFeatureData(data)
          }}
          onHide={() => {
            setFeatureData(undefined)
          }}
        />
      ) : null}
      <div className="flexcontainer">
        <div id="sidebar" className="sidebar">
          <Sidebar
            color={color}
            onColorChange={c => setColor(c)}
            onDrawLabels={v => setDrawLabels(v)}
            onPathDraw={d => setPathDraw(d)}
            onRedraw={() => setRedraw(redraw => redraw + 1)}
          />
        </div>
        <div className="body">
          {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          {graph ? (
            <Graph
              graph={graph}
              ref={ref}
              color={color}
              redraw={redraw}
              drawLabels={drawLabels}
              drawPaths={pathDraw}
              onFeatureClick={data => {
                setFeatureData(data)
              }}
              settings={settings}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default App
