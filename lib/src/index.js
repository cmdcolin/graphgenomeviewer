import React, { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import {
  projectLine,
  reprocessGraph,
  generatePaths,
  generateEdges
} from './util'

const Graph = React.forwardRef((props, ref) => {
  const gref = useRef()
  const {
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
  } = props

  const zoom = useRef(
    d3
      .zoom()
      .extent([
        [0, 0],
        [width, height]
      ])
      .scaleExtent([0.1, 8])
  )

  const data = useMemo(() => {
    return reprocessGraph(graph, chunkSize)
  }, [chunkSize, graph])

  const colors = useMemo(() => {
    return Object.fromEntries(
      (graph.paths || []).map((p, i) => {
        return [p.name, d3.schemeCategory10[i]]
      })
    )
  }, [graph.paths])
  const links = useMemo(() => {
    const links = data.links.map((d) =>
      Object.create({ ...d, x: Math.random(), y: Math.random() })
    )
    const nodes = data.nodes.map((d) =>
      Object.create({ ...d, x: Math.random(), y: Math.random() })
    )
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((link) => {
            return link.sequence ? 1 : 10
          })
          .iterations(linkSteps)
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
            .strength(strengthXY)
        )
        .force(
          'y',
          d3
            .forceY()
            .y(height / 3)
            .strength(strengthXY)
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
    forceSteps
  ])

  useEffect(() => {
    // zoom logic, similar to https://observablehq.com/@d3/zoom
    // toggling logic from https://stackoverflow.com/a/29762389/2129219
    const svg = d3.select(ref.current)
    if (drag) {
      svg.call(
        zoom.current.on('zoom', (event) => {
          d3.select(gref.current).attr('transform', event.transform)
        })
      )
    } else {
      svg.on('.zoom', null)
    }
  }, [drag, height, ref, width, zoom])

  const paths = generatePaths(links, graph.nodes)
  const edges = generateEdges(links, data.links)

  const nodePathMap = {}
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i]
    const l = p.links.length
    nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
    nodePathMap[`${p.original.id}-end`] = [p.links[l - 2], p.links[l - 1]]
  }

  return (
    <svg
      width='100%'
      height='100%'
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
            const [s1, t1] = nodePathMap[p.original.source]
            const [s2, t2] = nodePathMap[p.original.target]
            const m1 = (y2 - y1) / (x2 - x1)
            const m2 = (s1[1] - t1[1]) / (s1[0] - t1[0])
            const m3 = (s2[1] - t2[1]) / (s2[0] - t2[0])
            if (Math.abs(m1 - m2) < 0.2 || Math.abs(m1 - m3) < 0.2) {
              return p.original.paths
                ? p.original.paths.map((pp, index) => {
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
                        fill='none'
                        onClick={() => onFeatureClick(p.original)}
                      >
                        <title>{pp}</title>
                      </path>
                    )
                  })
                : null
            }

            return p.original.paths
              ? p.original.paths.map((pp, index) => {
                  const [cx1, cy1] = projectLine(
                    s1[0],
                    s1[1],
                    t1[0],
                    t1[1],
                    60 + index * 30
                  )
                  const [cx2, cy2] = projectLine(
                    s2[0],
                    s2[1],
                    t2[0],
                    t2[1],
                    60 + index * 30
                  )

                  const cpath = d3.path()
                  cpath.moveTo(x1, y1)
                  cpath.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2)

                  return (
                    <path
                      key={`${cpath.toString()}-${index}`}
                      d={cpath}
                      strokeWidth={linkThickness}
                      stroke={colors[pp]}
                      fill='none'
                      onClick={() => onFeatureClick(p.original)}
                    >
                      <title>{pp}</title>
                    </path>
                  )
                })
              : null
          } else {
            const [s1, t1] = nodePathMap[p.original.source]
            const [s2, t2] = nodePathMap[p.original.target]
            const m1 = (y2 - y1) / (x2 - x1)
            const m2 = (s1[1] - t1[1]) / (s1[0] - t1[0])
            const m3 = (s2[1] - t2[1]) / (s2[0] - t2[0])
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
                stroke='black'
                fill='none'
                onClick={() => onFeatureClick(p.original)}
              />
            )
          }
        })}

        {paths.map((p, i) => {
          const stroke = color.startsWith('Just')
            ? color.replace('Just', '').toLowerCase()
            : d3.hsl(d3[`interpolate${color}`](i / paths.length)).darker()
          return (
            <Path
              key={p.original.id}
              sequenceThickness={sequenceThickness}
              drawLabels={drawLabels}
              path={p}
              stroke={stroke}
              onFeatureClick={onFeatureClick}
            />
          )
        })}
      </g>
    </svg>
  )
})

function Path({ path, drawLabels, sequenceThickness, stroke, onFeatureClick }) {
  const line = d3.line().context(null)
  const t1 = path.links[0]
  const s1 = path.links[1]
  const t2 = path.links[path.links.length - 1]
  const s2 = path.links[path.links.length - 2]
  const [cx1, cy1] = projectLine(s1[0], s1[1], t1[0], t1[1], 100)
  const [cx2, cy2] = projectLine(s2[0], s2[1], t2[0], t2[1], 100)
  const invisibleTextPath = line([[cx1, cy1], ...path.links, [cx2, cy2]])

  return (
    <React.Fragment>
      <path
        id={path.original.id}
        d={line(path.links)}
        strokeWidth={sequenceThickness}
        stroke={stroke}
        fill='none'
        onClick={() => onFeatureClick(path.original)}
      >
        <title>{path.original.id}</title>
      </path>
      {drawLabels ? (
        <React.Fragment>
          <path
            id={`${path.original.id}_invisible`}
            d={invisibleTextPath}
            fill='none'
          />
          <text dy={12}>
            <textPath
              startOffset='50%'
              textAnchor='middle'
              href={`#${path.original.id}_invisible`}
            >
              {path.original.id}
            </textPath>
          </text>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  )
}

export default Graph
