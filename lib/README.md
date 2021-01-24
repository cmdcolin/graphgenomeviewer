# graphgenomeviewer

## Install

The graphgenomeviewer NPM module is a React component that can be installed
with yarn or npm

    yarn add graphgenomeviewer

## Usage

```js
import Graph from 'graphgenomeviewer'

function App() {
  return (
    <Graph
      graph={{
        nodes: [{ id: 'id1' }, { id: 'id2' }],
        links: [{ source: 'id1', target: 'id2' }]
      }}
    />
  )
}
```

Here are all the props for the Graph component

```
    graph,
    drawPaths = false,
    drawLabels = false,
    drag = false,
    settings: {
      chunkSize = 1000,
      forceSteps = 500,
      linkSteps = 3,
      sequenceThickness = 10,
      linkThickness = 2,
      theta = 0.9,
      forceType = 'center',
      strengthCenter = -50,
      strengthXY = 0.3
    },
    color = 'Rainbow',
    width = 2000,
    height = 1000,
    redraw = 0,
    onFeatureClick = () => {
      console.log('no feature click configured')
    }
```
