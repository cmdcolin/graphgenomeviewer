import React, { useEffect, useRef, useState } from 'react'
import { FeatureDialog } from './FeatureDialog'
import { Graph } from './Graph'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { parseGFA } from './util'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [featureData, setFeatureData] = useState()
  const [dataset, setDataset] = useState('MT.gfa')
  const [graph, setGraph] = useState()
  const [error, setError] = useState()
  const [color, setColor] = useState('Rainbow')
  const [pathDraw, setPathDraw] = useState(false)
  const ref = useRef()
  useEffect(() => {
    ;(async () => {
      try {
        const result = await fetch(dataset)
        if (!result.ok) {
          throw new Error(`Failed to fetch ${result.statusText}`)
        }
        const text = await result.text()
        const d = parseGFA(text)
        setGraph(d)
        setError(undefined)
      } catch (e) {
        console.error(e)
        setError(e.message)
      }
    })()
  }, [dataset])
  return (
    <div>
      <Header
        onData={d => {
          setDataset(d)
        }}
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
            ref={ref}
            color={color}
            onColorChange={c => setColor(c)}
            onPathDraw={d => setPathDraw(d)}
          />
        </div>
        <div className="body">
          {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          {graph ? (
            <Graph
              graph={graph}
              ref={ref}
              color={color}
              drawPaths={pathDraw}
              onFeatureClick={data => {
                setFeatureData(data)
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default App
