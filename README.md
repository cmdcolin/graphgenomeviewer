# graphgenomeviewer

This repo provides an NPM module https://www.npmjs.com/package/graphgenomeviewer

There is also an example app https://cmdcolin.github.io/graphgenomeviewer/

## Install

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

## Demo

Visit https://cmdcolin.github.io/graphgenomeviewer/

or run from the repo

```
git clone https://github.com/cmdcolin/graphgenomeviewer
cd graphgenomeviewer
yarn
yarn start
# now in another tab
cd examples
yarn
yarn start
```

## Screenshot

![](img/1.png)

Here is a screemshot of the example app

### File type support

This app currently supports GFA1 and a subset of GFA2. It does not fully
attempt to resolve the GFA2 edge spec with dovetails, but makes a basic attempt
to at least link the nodes specified by GFA2 edges

### Notes

Project started during BCC2020 pangenome virtual conference CoFest hackathon
team. Thanks to everyone! See [CREDITS](CREDITS.md)
