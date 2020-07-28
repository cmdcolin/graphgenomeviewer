import React, { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { reprocessGraph, generatePaths, generateEdges } from './util'

const Graph = React.forwardRef((props, ref) => {
  const gref = useRef()
  const {
    graph,
    drawPaths = false,
    settings: {
      chunkSize = 1000,
      forceSteps = 500,
      linkSteps = 3,
      sequenceThickness = 10,
      linkThickness = 2,
      strength = -50,
      theta = 0.9,
    },
    color = 'Rainbow',
    width = 2000,
    height = 1000,
    redraw = 0,
    onFeatureClick = () => {
      console.log('no feature click configured')
    },
  } = props

  const data = useMemo(() => {
    return reprocessGraph(graph, chunkSize)
  }, [chunkSize, graph])
  const colors = useMemo(() => {
    return Object.fromEntries(
      (graph.paths || []).map((p, i) => {
        return [p.name, d3.schemeCategory10[i]]
      }),
    )
  }, [graph.paths])
  const links = useMemo(() => {
    const links = data.links.map(d =>
      Object.create({ ...d, x: Math.random(), y: Math.random() }),
    )
    const nodes = data.nodes.map(d =>
      Object.create({ ...d, x: Math.random(), y: Math.random() }),
    )
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(link => {
            return link.sequence ? 1 : 10
          })
          .iterations(linkSteps),
      )
      .force('charge', d3.forceManyBody().strength(strength).theta(theta))
      .force('center', d3.forceCenter(width / 2, height / 2))

    for (let i = 0; i < forceSteps; ++i) {
      simulation.tick()
    }
    // used for redrawing
    // eslint-disable-next-line no-unused-vars
    const m = redraw
    return links
  }, [
    data.links,
    redraw,
    data.nodes,
    forceSteps,
    height,
    linkSteps,
    strength,
    theta,
    width,
  ])

  useEffect(() => {
    // zoom logic, similar to https://observablehq.com/@d3/zoom
    function zoomed() {
      d3.select(gref.current).attr('transform', d3.event.transform)
    }
    d3.select(ref.current).call(
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

  const map = {}
  paths.forEach(path => {
    const { source, target, linkNum } = path.original
    if (source.endsWith('start')) {
      map[source] = {
        source: links[linkNum].target,
        target: links[linkNum].source,
      }
      map[target] = {
        target: links[linkNum].target,
        source: links[linkNum].source,
      }
    } else {
      map[source] = {
        source: links[linkNum].source,
        target: links[linkNum].target,
      }
      map[target] = {
        target: links[linkNum].source,
        source: links[linkNum].target,
      }
    }
  })

  if (drawPaths && !edges[0].original.paths) {
    return <h1>no paths found</h1>
  }
  return (
    <svg width="100%" height="100%" ref={ref} viewBox={[0, 0, width, height].toString()}>
      <g ref={gref}>
        {edges.map(p => {
          const x1 = p.links[0][0]
          const y1 = p.links[0][1]
          const x2 = p.links[1][0]
          const y2 = p.links[1][1]

          if (drawPaths) {
            const { source: s1, target: t1 } = map[p.original.source]
            const { source: s2, target: t2 } = map[p.original.target]
            // implements this algorithm to calculate a control point
            // that points "forwards" of a given contig node
            // https://math.stackexchange.com/questions/175896
            const dp1 = Math.sqrt((t1.y - s1.y) ** 2 + (t1.x - s1.x) ** 2)
            const dp2 = Math.sqrt((t2.y - s2.y) ** 2 + (t2.x - s2.x) ** 2)

            return p.original.paths.map((pp, index) => {
              const d1 = (60 + index * 50) / dp1
              const d2 = (60 + index * 50) / dp2
              const cx1 = (1 - d1) * s1.x + d1 * t1.x
              const cy1 = (1 - d1) * s1.y + d1 * t1.y
              const cx2 = (1 - d2) * s2.x + d2 * t2.x
              const cy2 = (1 - d2) * s2.y + d2 * t2.y
              const cpath = d3.path()
              cpath.moveTo(x1, y1)
              cpath.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2)
              return (
                <path
                  key={cpath.toString()}
                  d={cpath}
                  strokeWidth={linkThickness}
                  stroke={colors[pp]}
                  fill="none"
                  onClick={() => onFeatureClick(p.original)}
                />
              )
            })
          } else {
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
                strokeWidth={linkThickness}
                stroke="black"
                fill="none"
                onClick={() => onFeatureClick(p.original)}
              />
            )
          }
        })}

        {paths.map((p, i) => {
          const line = d3.line().context(null)
          const path = line(p.links)
          return (
            <path
              key={path.toString()}
              d={path}
              strokeWidth={sequenceThickness}
              stroke={
                color.startsWith('Just')
                  ? color.replace('Just', '').toLowerCase()
                  : d3.hsl(d3[`interpolate${color}`](i / paths.length)).darker()
              }
              fill="none"
              onClick={() => onFeatureClick(p.original)}
            >
              <title>{p.original.id}</title>
            </path>
          )
        })}
      </g>
    </svg>
  )
})
export { Graph }
