import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FeatureDialog } from './FeatureDialog'
import Graph from 'graphgenomeviewer'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { parseGFA, serialize } from './util'
import saveAs from 'file-saver'
import {
  useQueryParams,
  BooleanParam,
  StringParam,
  NumberParam,
  withDefault,
} from 'use-query-params'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [featureData, setFeatureData] = useState()
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [, updateState] = useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])
  const [redraw, setRedraw] = useState(0)
  const [query, setQuery] = useQueryParams({
    strengthCenter: withDefault(NumberParam, -50),
    strengthXY: withDefault(NumberParam, 0.1),
    chunkSize: withDefault(NumberParam, 1000),
    forceSteps: withDefault(NumberParam, 200),
    linkSteps: withDefault(NumberParam, 1),
    sequenceThickness: withDefault(NumberParam, 10),
    linkThickness: withDefault(NumberParam, 2),
    theta: withDefault(NumberParam, 0.9),
    forceType: withDefault(StringParam, 'center'),
    dataset: withDefault(StringParam, 'MT.gfa'),
    colorScheme: withDefault(StringParam, 'Rainbow'),
    drawLabels: withDefault(BooleanParam, false),
    drawPaths: withDefault(BooleanParam, false),
    drag: withDefault(BooleanParam, true),
  })

  const { dataset, drawLabels, drawPaths, colorScheme, drag, ...settings } =
    query

  const ref = useRef()
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        setError()
        const result = await fetch(dataset)
        if (!result.ok) {
          throw new Error(`Failed to fetch ${result.statusText}`)
        }
        const text = await result.text()
        setData(text)
      } catch (error) {
        console.error(error)
        setError(error.message)
      }
    })()
  }, [dataset])

  const graph = useMemo(() => {
    return data ? parseGFA(data) : undefined
  }, [data])

  return (
    <div>
      <Header
        onData={value => {
          setQuery({ dataset: value })
          forceUpdate()
        }}
        onGraph={graph => {
          setData(graph)
        }}
        onSettings={settings => {
          setQuery(settings)
          forceUpdate()
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
            setFeatureData()
          }}
        />
      ) : null}
      <div className="flexcontainer">
        <div id="sidebar" className="sidebar">
          <Sidebar
            colorScheme={colorScheme}
            drawPaths={drawPaths}
            drawLabels={drawLabels}
            drag={drag}
            onColorChange={value => {
              setQuery({ colorScheme: value })
              forceUpdate()
            }}
            onDrawLabels={value => {
              setQuery({ drawLabels: value })
              forceUpdate()
            }}
            onDrag={value => {
              setQuery({ drag: value })
              forceUpdate()
            }}
            onPathDraw={value => {
              setQuery({ drawPaths: value })
              forceUpdate()
            }}
            onRedraw={() => setRedraw(redraw => redraw + 1)}
          />
        </div>
        <div className="body">
          {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          {graph ? (
            <Graph
              graph={graph}
              ref={ref}
              redraw={redraw}
              drag={drag}
              color={colorScheme}
              drawLabels={drawLabels}
              drawPaths={drawPaths}
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
