import React, { useMemo, useRef, useEffect } from 'react'
import { hsl } from 'd3-color'
import { path } from 'd3-path'
import * as d3drag from 'd3-drag'
import { select } from 'd3-selection'
import {
  forceManyBody,
  forceLink,
  forceSimulation,
  forceCenter,
  forceX,
  forceY
} from 'd3-force'
import * as d3interpolate from 'd3-scale-chromatic'
import { zoom as d3zoom } from 'd3-zoom'
import * as d3shape from 'd3-shape'
import {
  projectLine,
  reprocessGraph,
  generatePaths,
  generateEdges
} from './util'

const { schemeCategory10 } = d3interpolate

const Graph = React.forwardRef((props, ref) => {
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

  const data = useMemo(() => {
    return reprocessGraph(graph, chunkSize)
  }, [chunkSize, graph])

  const colors = useMemo(() => {
    return Object.fromEntries(
      (graph.paths || []).map((p, i) => {
        return [p.name, schemeCategory10[i]]
      })
    )
  }, [graph.paths])

  console.log({ colors })
  useEffect(() => {
    if (ref.current) {
      const links = data.links.map((d) => ({
        ...d
      }))
      const nodes = data.nodes.map((d) => ({
        ...d
      }))

      // const simulation = forceSimulation(nodes)
      //   .force(
      //     'link',
      //     forceLink(links)
      //       .id((d) => d.id)
      //       .distance((link) => {
      //         return link.sequence ? 1 : 10
      //       })
      //       .iterations(linkSteps)
      //   )
      //   .force('charge', forceManyBody().strength(strengthCenter).theta(theta))

      // if (forceType === 'center') {
      //   simulation.force('center', forceCenter(width / 3, height / 3))
      // } else if (forceType === 'xy') {
      //   simulation
      //     .force(
      //       'x',
      //       forceX()
      //         .x(width / 3)
      //         .strength(strengthXY)
      //     )
      //     .force(
      //       'y',
      //       forceY()
      //         .y(height / 3)
      //         .strength(strengthXY)
      //     )
      // }

      // for (let i = 0; i < forceSteps; ++i) {
      // simulation.tick()
      // }

      ref.current.innerHTML = ''
      function tickActions() {
        //update circle positions each tick of the simulation
        node
          .attr('cx', function (d) {
            return d.x
          })
          .attr('cy', function (d) {
            return d.y
          })

        //update link positions
        link
          .attr('x1', function (d) {
            return d.source.x
          })
          .attr('y1', function (d) {
            return d.source.y
          })
          .attr('x2', function (d) {
            return d.target.x
          })
          .attr('y2', function (d) {
            return d.target.y
          })
      }
      const simulation = forceSimulation().nodes(nodes)

      const link_force = forceLink(links).id((d) => d.id)
      const charge_force = forceManyBody().strength(-50)
      const center_force = forceCenter(width / 2, height / 2)

      simulation
        .force('charge_force', charge_force)
        .force('center_force', center_force)
        .force('links', link_force)

      //add tick instructions:
      simulation.on('tick', tickActions)

      const svg = select(ref.current)
      const g = svg.append('g')

      const paths = generatePaths(links, graph.nodes)
      const link = g
        .append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', (d) => {
          const st = d.source.id.lastIndexOf('-')
          const dt = d.target.id.lastIndexOf('-')
          const same = d.source.id.slice(0, st) === d.target.id.slice(0, dt)
          if (same) {
            const id = d.source.id.slice(0, st)
            const nodeIndex = paths.findIndex((path) => {
              return path.original.id === id
            })
            return color.startsWith('Just')
              ? color.replace('Just', '').toLowerCase()
              : hsl(
                  d3interpolate[`interpolate${color}`](nodeIndex / paths.length)
                ).darker()
          } else {
            return 'grey'
          }
        })
        .attr('stroke-width', (d) => {
          const st = d.source.id.lastIndexOf('-')
          const dt = d.target.id.lastIndexOf('-')
          const same = d.source.id.slice(0, st) === d.target.id.slice(0, dt)
          return same ? 10 : 1
        })

      const node = g
        .append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', 'rgba(255,255,255,0.0)')

      function drag_start(event, d) {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }
        d.fx = event.x
        d.fy = event.y
      }

      //make sure you can't drag the circle outside the box
      function drag_drag(event, d) {
        d.fx = event.x
        d.fy = event.y
      }

      function drag_end(event, d) {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      //add drag capabilities
      var drag_handler = d3drag
        .drag()
        .on('start', drag_start)
        .on('drag', drag_drag)
        .on('end', drag_end)

      drag_handler(node)

      if (drag) {
        const zoomer = d3zoom()
        zoomer.on('zoom', (event) => {
          if (drag) {
            g.attr('transform', event.transform)
          }
        })

        zoomer(svg)
      }
    }
  }, [
    data.links,
    data.nodes,
    linkSteps,
    strengthCenter,
    theta,
    forceType,
    width,
    drag,
    redraw,
    height,
    strengthXY,
    forceSteps,
    ref.current
  ])
  // const paths = generatePaths(links, graph.nodes)
  // const edges = generateEdges(links, data.links)

  // const nodePathMap = {}
  // for (let i = 0; i < paths.length; i++) {
  //   const p = paths[i]
  //   const l = p.links.length
  //   nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
  //   nodePathMap[`${p.original.id}-end`] = [p.links[l - 2], p.links[l - 1]]
  // }

  return (
    <svg
      width='100%'
      height='100%'
      ref={ref}
      style={{ fontSize: 10 }}
      viewBox={[0, 0, width, height].toString()}
    ></svg>
  )
})

function Path({ path, drawLabels, sequenceThickness, stroke, onFeatureClick }) {
  const line = d3shape.line().context(null)
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
