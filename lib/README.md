# graphgenomeviewer

## Install

The graphgenomeviewer NPM module is a React component that can be installed with
yarn or npm

    yarn add graphgenomeviewer

## Usage with React

```typescript
import Graph from 'graphgenomeviewer'

function App() {
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
```

## API

Here are all the props for the Graph component

```typescript
function Graph({
  graph,
  drawPaths = false,
  drawLabels = false,
  colorScheme = 'Rainbow',
  chunkSize = 1000,
  linkSteps = 10,
  sequenceThickness = 10,
  linkThickness = 2,
  theta = 0.9,
  strengthCenter = -50,
  width = 2000,
  height = 1000,
  onFeatureClick = () => {},
}: {
  graph: Graph
  drawPaths?: boolean
  drawLabels?: boolean
  colorScheme?: string
  width?: number
  height?: number
  chunkSize?: number
  linkSteps?: number
  sequenceThickness?: number
  linkThickness?: number
  theta?: number
  strengthCenter?: number
  onFeatureClick?: (arg?: Record<string, unknown>) => void
}) {
  /*...*/
}
```

the Graph type is as follows

```
export interface Path {
  name: string
  path: string
}
export interface Node {
  id: string
  sequence?: string
  tags?: Record<string, unknown>
  cigar?: string
  length?: number
}
export interface Graph {
  nodes: Node[]
  links: Link[]
  paths?: Path[]
}
```
