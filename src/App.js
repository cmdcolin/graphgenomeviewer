import React, { useEffect, useState } from 'react'
import { OpenDialog } from './OpenDialog'
import { FeatureDialog } from './FeatureDialog'
import { GraphContainer } from './GraphContainer'
import { Header } from './Header'
import { parseGFA } from './util'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [show, setShow] = useState(false)
  const [featureData, setFeatureData] = useState()
  const [dataset, setDataset] = useState('toy_pangenome.gfa')
  const [graph, setGraph] = useState()
  const [error, setError] = useState()
  useEffect(() => {
    ;(async () => {
      try {
        const result = await fetch(dataset)
        if (!result.ok) {
          throw new Error(`Failed to fetch ${result.statusText}`)
        }
        const text = await result.text()
        const d = parseGFA(text)
        console.log(text, d)
        setGraph(d)
        setError(undefined)
      } catch (e) {
        console.error(e)
        setError(e.message)
      }
    })()
  }, [dataset])
  console.log(graph)
  return (
    <div>
      <Header
        onOpen={() => {
          setShow(true)
        }}
        onData={d => {
          setDataset(d)
        }}
      />
      <OpenDialog show={show} onHide={() => setShow(false)} />
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
          {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          {graph ? (
            <GraphContainer
              graph={graph}
              onFeatureClick={data => {
                setFeatureData(data)
              }}
            />
          ) : null}
        </div>
        <div className="body" />
      </div>
    </div>
  )
}

export default App
