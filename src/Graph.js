import React, { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { projectLine, reprocessGraph, generatePaths, generateEdges } from './util'

const Graph = React.forwardRef((props, ref) => {
  const gref = useRef()
  const {
    graph,
    drawPaths = false,
    drawLabels = false,
    settings: {
      chunkSize = 1000,
      forceSteps = 500,
      linkSteps = 3,
      sequenceThickness = 10,
      linkThickness = 2,
      theta = 0.9,
      forceType = 'center',
      strengthCenter = -50,
      strengthXY = 0.3,
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
      .force('charge', d3.forceManyBody().strength(strengthCenter).theta(theta))

    if (forceType === 'center') {
      simulation.force('center', d3.forceCenter(width / 3, height / 3))
    } else if (forceType === 'xy') {
      simulation
        .force(
          'x',
          d3
            .forceX()
            .x(width / 3)
            .strength(strengthXY),
        )
        .force(
          'y',
          d3
            .forceY()
            .y(height / 3)
            .strength(strengthXY),
        )
    }

    for (let i = 0; i < forceSteps; ++i) {
      simulation.tick()
    }
    // used for redrawing
    // eslint-disable-next-line no-unused-vars
    const m = redraw
    return links
  }, [
    data.links,
    data.nodes,
    linkSteps,
    strengthCenter,
    theta,
    forceType,
    redraw,
    width,
    height,
    strengthXY,
    forceSteps,
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

  const paths = generatePaths(links, graph.nodes)
  const edges = generateEdges(links, data.links)

  const nodePositionMap = {}
  for (let i = 0; i < links.length; i++) {
    const { source, target } = data.links[i]
    const { linkNum } = links[i]
    if (linkNum !== undefined) {
      if (source.endsWith('start')) {
        nodePositionMap[source] = {
          source: links[linkNum].target,
          target: links[linkNum].source,
        }
        nodePositionMap[target] = {
          target: links[linkNum].target,
          source: links[linkNum].source,
        }
      } else {
        nodePositionMap[source] = {
          source: links[linkNum].source,
          target: links[linkNum].target,
        }
        nodePositionMap[target] = {
          target: links[linkNum].source,
          source: links[linkNum].target,
        }
      }
    }
  }

  return (
    <svg
      width="100%"
      height="100%"
      ref={ref}
      style={{ fontSize: 10 }}
      viewBox={[0, 0, width, height].toString()}
    >
      <g ref={gref}>
        {edges.map((p, j) => {
          const x1 = p.links[0][0]
          const y1 = p.links[0][1]
          const x2 = p.links[1][0]
          const y2 = p.links[1][1]

          if (drawPaths) {
            if (!p.original.paths) {
              return null
            }

            const { source: s1, target: t1 } = nodePositionMap[p.original.source]
            const { source: s2, target: t2 } = nodePositionMap[p.original.target]
            const m1 = (y2 - y1) / (x2 - x1)
            const m2 = (s1.y - t1.y) / (s1.x - t1.x)
            const m3 = (s2.y - t2.y) / (s2.x - t2.x)
            if (Math.abs(m1 - m2) < 0.5 || Math.abs(m1 - m3) < 0.5) {
              return p.original.paths.map((pp, index) => {
                const dx = x2 - x1
                const dy = y2 - y1
                const dr = Math.sqrt(dx * dx + dy * dy) + Math.random() * 40
                const sweep = index % 2
                const cpath = `M${x1},${y1}A${dr},${dr} 0 0,${sweep} ${x2},${y2}`
                return (
                  <path
                    key={`${cpath}-${index}`}
                    d={cpath}
                    strokeWidth={linkThickness}
                    stroke={colors[pp]}
                    fill="none"
                    onClick={() => onFeatureClick(p.original)}
                  >
                    <title>{pp}</title>
                  </path>
                )
              })
            }

            return p.original.paths.map((pp, index) => {
              const [cx1, cy1] = projectLine(s1.x, s1.y, t1.x, t1.y, 60 + index * 50)
              const [cx2, cy2] = projectLine(s2.x, s2.y, t2.x, t2.y, 60 + index * 50)

              const cpath = d3.path()
              cpath.moveTo(x1, y1)
              cpath.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2)
              return (
                <path
                  key={`${cpath.toString()}-${index}`}
                  d={cpath}
                  strokeWidth={linkThickness}
                  stroke={colors[pp]}
                  fill="none"
                  onClick={() => onFeatureClick(p.original)}
                >
                  <title>{pp}</title>
                </path>
              )
            })
          } else {
            const { source: s1, target: t1 } = nodePositionMap[p.original.source]
            const { source: s2, target: t2 } = nodePositionMap[p.original.target]
            const m1 = (y2 - y1) / (x2 - x1)
            const m2 = (s1.y - t1.y) / (s1.x - t1.x)
            const m3 = (s2.y - t2.y) / (s2.x - t2.x)
            const line = d3.line().context(null)
            const xRot = 90
            const sweep = 0 // 1 or 0
            const largeArc = 1
            const drx = -30
            const dry = -20
            const path =
              p.original.loop && !(m1 - m2 < 0.5 || m1 - m3 < 0.5)
                ? `M${x1},${y1}A${drx},${dry} ${xRot},${largeArc},${sweep} ${x2},${y2}`
                : line(p.links)

            return (
              <path
                key={`${path.toString()}-${j}`}
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
          const t1 = p.links[0]
          const s1 = p.links[1]
          const t2 = p.links[p.links.length - 1]
          const s2 = p.links[p.links.length - 2]
          const [cx1, cy1] = projectLine(s1[0], s1[1], t1[0], t1[1], 100)
          const [cx2, cy2] = projectLine(s2[0], s2[1], t2[0], t2[1], 100)
          const invisibleTextPath = line([[cx1, cy1], ...p.links, [cx2, cy2]])
          const stroke = color.startsWith('Just')
            ? color.replace('Just', '').toLowerCase()
            : d3.hsl(d3[`interpolate${color}`](i / paths.length)).darker()
          return (
            <React.Fragment key={`${path}_${i}`}>
              <path
                id={p.original.id}
                d={path}
                strokeWidth={sequenceThickness}
                stroke={stroke}
                fill="none"
                onClick={() => onFeatureClick(p.original)}
              >
                <title>{p.original.id}</title>
              </path>
              {drawLabels ? (
                <>
                  <path
                    id={`${p.original.id}_invisible`}
                    d={invisibleTextPath}
                    fill="none"
                  />
                  <text dy={12}>
                    <textPath
                      startOffset="50%"
                      textAnchor="middle"
                      href={`#${p.original.id}_invisible`}
                    >
                      {p.original.id}
                    </textPath>
                  </text>
                </>
              ) : null}
            </React.Fragment>
          )
        })}
      </g>
    </svg>
  )
})
export { Graph }
