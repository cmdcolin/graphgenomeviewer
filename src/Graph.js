import React, { useMemo, useEffect } from 'react'
import * as d3 from 'd3'

// Given a GFA graph with sequence nodes ('S' tags), it breaks the S tags into
// multiple nodes depending on how long the sequence is, which gives the graph
// an organic look when the layout algorithm is applied
function reprocessGraph(G, blockSize) {
  const Gp = { nodes: [], links: [] }

  const seen = {}
  for (let i = 0; i < (G.paths || {}).length; i++) {
    const path = G.paths[i]
    const pathNodes = path.path.split(',')
    for (let j = 0; j < pathNodes.length - 1; j++) {
      const curr = `${pathNodes[j]}_${pathNodes[j + 1]}`
      if (!seen[curr]) {
        seen[curr] = [path.name]
      } else {
        seen[curr].push(path.name)
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
    const paths = seen[`${source}${strand1}_${target}${strand2}`] || []
    const loop = source === target

    // enumerates cases for which end of source connects to
    // which end of the target
    if (strand1 === '+' && strand2 === '+') {
      Gp.links.push({
        source: `${source}-end`,
        target: `${target}-start`,
        loop,
        paths,
        ...rest,
      })
    } else if (strand1 === '-' && strand2 === '+') {
      Gp.links.push({
        source: `${source}-start`,
        target: `${target}-start`,
        loop,
        paths,
        ...rest,
      })
    } else if (strand1 === '-' && strand2 === '-') {
      Gp.links.push({
        source: `${source}-start`,
        target: `${target}-end`,
        loop,
        paths,
        ...rest,
      })
    } else if (strand1 === '+' && strand2 === '-') {
      Gp.links.push({
        source: `${source}-end`,
        target: `${target}-end`,
        loop,
        paths,
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
  const colors = {}
  ;(graph.paths || []).forEach(p => {
    colors[p.name] = d3.interpolateTurbo(Math.random())
  })
  console.log({ paths, links })

  const map = {}
  paths.forEach(path => {
    console.log(path.source, path.target)
    if (path.source.endsWith('start')) {
      map[path.source] = {
        source: links[path.linkNum].target,
        target: links[path.linkNum].source,
      }
      map[path.target] = {
        target: links[path.linkNum].target,
        source: links[path.linkNum].source,
      }
    } else {
      console.log('here')
      map[path.source] = {
        source: links[path.linkNum].source,
        target: links[path.linkNum].target,
      }
      map[path.target] = {
        target: links[path.linkNum].source,
        source: links[path.linkNum].target,
      }
    }
  })
  return (
    <svg ref={ref} viewBox={[0, 0, width, height].toString()}>
      <g className="gref">
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
          if (p.original.loop) {
            xRot = 90
            largeArc = 1
            drx = -30
            dry = -20
            x2 = x2 + 1
            y2 = y2 + 1
            path = `M${x1},${y1}A${drx},${dry} ${xRot},${largeArc},${sweep} ${x2},${y2}`
          } else {
            path = line(p.links)
          }
          const { source: s1, target: t1 } = map[p.original.source]
          const { source: s2, target: t2 } = map[p.original.target]
          // implements https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point/175906
          const m1 = (t1.y - s1.y) / (t1.x - s1.x)
          const m2 = (t2.y - s2.y) / (t2.x - s2.x)
          const dp1 = Math.sqrt(
            (t1.y - s1.y) * (t1.y - s1.y) + (t1.x - s1.x) * (t1.x - s1.x),
          )
          const dp2 = Math.sqrt(
            (t2.y - s2.y) * (t2.y - s2.y) + (t2.x - s2.x) * (t2.x - s2.x),
          )

          return (
            <>
              {p.original.paths.map(pp => {
                const d1 = (60 + Math.random() * 50) / dp1
                const d2 = (60 + Math.random() * 50) / dp2
                const cx1 = (1 - d1) * s1.x + d1 * t1.x
                const cy1 = (1 - d1) * s1.y + d1 * t1.y
                const cx2 = (1 - d2) * s2.x + d2 * t2.x
                const cy2 = (1 - d2) * s2.y + d2 * t2.y
                const cpath = d3.path()
                cpath.moveTo(x1, y1)
                cpath.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2) //(cx1, cy1, cx2, cy2, x2, y2, 1)
                console.log(colors, pp)
                return (
                  <path
                    d={cpath}
                    strokeWidth={2}
                    stroke={colors[pp]}
                    fill="none"
                    onClick={() => onFeatureClick(p.original)}
                  />
                )
              })}
            </>
          )
        })}

        {paths.map((p, i) => {
          const line = d3.line().context(null)
          return (
            <path
              d={line(p.links)}
              title={p.id}
              strokeWidth={contigThickness}
              stroke={
                color.startsWith('Just')
                  ? color.replace('Just', '').toLowerCase()
                  : d3.hsl(d3[`interpolate${color}`](i / paths.length)).darker()
              }
              fill="none"
              onClick={() => onFeatureClick(p)}
            >
              <title>{p.id}</title>
            </path>
          )
        })}
      </g>
    </svg>
  )
})

// // <path
//                 key={path.toString()}
//                 d={path}
//                 strokeWidth={score * edgeThickness}
//                 stroke={d3.interpolateGreys(score / maxScore)}
//                 fill="none"
//                 onClick={() => onFeatureClick(p.original)}
//               />
//
//
//
//const cx1 = ((x1 + x2) * 1) / 4
//const cy1 = ((y1 + y2) * 1) / 4
//const cx2 = ((x1 + x2) * 3) / 4
//const cy2 = ((y1 + y2) * 3) / 4
////const yp = (y1 + y2) / 2
//const cpath = d3.path()
//cpath.moveTo(x1, y1)
//const c1 = 20
//if (x1 < x2 && y1 < y2) {
//}
//
//
//
//
//debugging
//<line x1={s1.x} x2={t1.x} y1={s1.y} y2={t1.y} stroke="rgba(0,0,0,0.5)" />
// <rect x={cx2} y={cy2} width={2} height={2} fill="red" />
// <rect x={cx2} y={cy2} width={2} height={2} fill="green" />
// <rect x={x2} y={y2} width={2} height={2} fill="blue" />
// <rect x={x2} y={y2} width={2} height={2} fill="yellow" />
export { Graph }
