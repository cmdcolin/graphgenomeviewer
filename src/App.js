import React, { useEffect, useRef } from 'react'
import './App.css'
import igv from 'igv'
import { Graph } from './Graph'
import graph from './MT.json'

function App() {
  const ref = useRef()
  useEffect(() => {
    var igvOptions = { genome: 'hg38', locus: 'BRCA1' }
    return igv.createBrowser(ref.current, igvOptions)
  }, [])

  return (
    <div>
      <div className="header">
        <h1>graphgenome browser</h1>
      </div>
      <div className="with-sidebar">
        <div id="sidebar" className="sidebar">
          Test
          <Graph graph={graph} />
        </div>
        <div className="body">
          Body
          <div
            ref={ref}
            style={{
              paddingTop: '10px',
              paddingBottom: '10px',
              margin: '8px',
              border: '1px solid lightgray',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
