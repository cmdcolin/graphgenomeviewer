import React, { useMemo, useEffect } from 'react'
import * as d3 from 'd3'

// Given a GFA graph with sequence nodes ('S' tags), it breaks the S tags into
// multiple nodes depending on how long the sequence is, which gives the graph
// an organic look when the layout algorithm is applied
function reprocessGraph(G, blockSize) {
  const Gp = { nodes: [], links: [] }

  const seen = {}
  for (let i = 0; i < G.paths.length; i++) {
    const path = G.paths[i]
    const pathNodes = path.path.split(',')
    for (let j = 0; j < pathNodes.length - 1; j++) {
      const curr = `${pathNodes[j]}_${pathNodes[j + 1]}`
      if (!seen[curr]) {
        seen[curr] = 1
      } else {
        seen[curr]++
      }
    }
  }
  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, ...rest } = G.nodes[i]

    const nodes = []
    nodes.push({ ...rest, id: `${id}-start` })
    for (let i = blockSize; i < sequence.length - blockSize; i += blockSize) {
      nodes.push({ ...rest, id: `${id}-${i}` })
    }
    nodes.push({ ...rest, id: `${id}-end` })
    for (let j = 0; j < nodes.length - 1; j++) {
      const source = nodes[j].id
      const target = nodes[j + 1].id
      Gp.links.push({
        ...rest,
        source,
        target,
        id,
        linkNum: i,
        length: sequence.length,
        sequence, // could put actual sequence here if needed
      })
    }
    Gp.nodes = Gp.nodes.concat(nodes)
  }
  for (let i = 0; i < G.links.length; i++) {
    const { strand1, strand2, source, target, ...rest } = G.links[i]
    const score = seen[`${source}${strand1}_${target}${strand2}`] || 0
    console.log({ score })
    const loop = source === target

    // enumerates cases for which end of source connects to
    // which end of the target
    if (strand1 === '+' && strand2 === '+') {
      Gp.links.push({
        source: `${source}-end`,
        target: `${target}-start`,
        loop,
        score,
        ...rest,
      })
    } else if (strand1 === '-' && strand2 === '+') {
      Gp.links.push({
        source: `${source}-start`,
        target: `${target}-start`,
        loop,
        score,
        ...rest,
      })
    } else if (strand1 === '-' && strand2 === '-') {
      Gp.links.push({
        source: `${source}-start`,
        target: `${target}-end`,
        loop,
        score,
        ...rest,
      })
    } else if (strand1 === '+' && strand2 === '-') {
      Gp.links.push({
        source: `${source}-end`,
        target: `${target}-end`,
        loop,
        score,
        ...rest,
      })
    }
    // else {
    //   Gp.links.push({ source: `${source}-start`, target: `${target}-end`, loop, ...rest })
    // }
  }
  return Gp
}

function* generatePaths(links, graph) {
  let currentLinkId = links[0].linkNum
  let currentLinkSet = []
  let original
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    if (currentLinkId !== link.linkNum) {
      if (original.id) {
        yield { links: currentLinkSet, ...original }
      }
      currentLinkSet = []
      currentLinkId = link.linkNum
    }
    original = graph[i]
    currentLinkSet.push([link.source.x, link.source.y])
    currentLinkSet.push([link.target.x, link.target.y])
  }
}

function* generateEdges(links, graph) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const original = graph[i]
    if (!original.id) {
      yield {
        links: [
          [link.source.x, link.source.y],
          [link.target.x, link.target.y],
        ],
        original,
      }
    }
  }
}

const Graph = React.forwardRef((props, ref) => {
  const {
    graph, // {nodes:[{id}], links:[{source,target}]
    path = 'Edge',
    blockSize = 1000,
    contigThickness = 10,
    edgeThickness = 2,
    color = 'Rainbow',
    width = 1000,
    height = 1000,
    steps = 500,
    onFeatureClick = () => {
      console.log('no feature click configured')
    },
  } = props
  const data = useMemo(() => {
    return reprocessGraph(graph, blockSize)
  }, [blockSize, graph])

  const links = useMemo(() => {
    const links = data.links.map(d => Object.create(d))
    const nodes = data.nodes.map(d => Object.create(d))
    let max = 0
    for (let i = 0; i < data.links.length; i++) {
      max = Math.max(max, (data.links[i].sequence || {}).length || 0)
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(link => {
            return link.sequence ? 1 : 10
          }),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))

    for (let i = 0; i < steps; ++i) {
      simulation.tick()
    }
    return links
  }, [data, height, steps, width])

  useEffect(() => {
    // zoom logic, similar to https://observablehq.com/@d3/zoom
    function zoomed() {
      d3.select('.gref').attr('transform', d3.event.transform)
    }
    d3.select('svg').call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.1, 8])
        .on('zoom', zoomed),
    )
  }, [height, ref, width])

  const paths = [...generatePaths(links, data.links)]
  const edges = [...generateEdges(links, data.links)]
  const maxScore = edges.reduce((a, b) => {
    return Math.max(b.original.score, a)
  }, 0)
  return (
    <svg ref={ref} viewBox={[0, 0, width, height].toString()}>
      <g className="gref">
        {paths.map((p, i) => {
          const line = d3.line().context(null)
          return (
            <path
              d={line(p.links)}
              title={p.id}
              strokeWidth={contigThickness}
              stroke={d3.hsl(d3[`interpolate${color}`](i / paths.length)).darker()}
              fill="none"
              onClick={() => onFeatureClick(p)}
            >
              <title>{p.id}</title>
            </path>
          )
        })}
        {edges.map(p => {
          const line = d3.line().context(null)
          const x1 = p.links[0][0]
          const y1 = p.links[0][1]
          let x2 = p.links[1][0]
          let y2 = p.links[1][1]
          const dx = x2 - x1
          const dy = y2 - y1
          const dr = Math.sqrt(dx * dx + dy * dy)
          // Defaults for normal edge.
          let drx = dr
          let dry = dr
          let xRot = 0 // degrees
          let largeArc = 0 // 1 or 0
          const sweep = 0 // 1 or 0

          let path
          // Self edge.
          if (p.original.loop) {
            // Fiddle with this angle to get loop oriented.
            xRot = 90

            // Needs to be 1.
            largeArc = 1

            // Change sweep to change orientation of loop.
            //sweep = 0;

            // Make drx and dry different to get an ellipse
            // instead of a circle.
            drx = -30
            dry = -20

            // For whatever reason the arc collapses to a point if the beginning
            // and ending points of the arc are the same, so kludge it.
            x2 = x2 + 1
            y2 = y2 + 1
            path = `M${x1},${y1}A${drx},${dry} ${xRot},${largeArc},${sweep} ${x2},${y2}`
          } else {
            path = line(p.links)
          }
          return (
            <path
              key={path.toString()}
              d={path}
              strokeWidth={p.original.score * edgeThickness}
              stroke={d3.interpolateGreys(p.original.score / maxScore)}
              fill="none"
              onClick={() => onFeatureClick(p.original)}
            />
          )
        })}
      </g>
    </svg>
  )
})

export { Graph }
