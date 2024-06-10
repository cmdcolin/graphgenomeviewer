import React from 'react'
import Graph from '../dist/Graph'
import GFAGraph from '../dist/GFAGraph'

function BasicExample() {
  return (
    <Graph
      graph={{
        nodes: [
          { id: 'id1', length: 5000 },
          { id: 'id2', length: 10000 },
        ],
        links: [{ source: 'id1', target: 'id2', id: 'edge1' }],
      }}
    />
  )
}

function MTGraph() {
  return <GFAGraph url="MT.gfa" />
}

export { BasicExample, MTGraph }

export default { title: 'Examples' }
