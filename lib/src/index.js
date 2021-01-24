import React, { useMemo, useEffect } from 'react'
import { hsl } from 'd3-color'
import { path } from 'd3-path'
import * as d3drag from 'd3-drag'
import { select } from 'd3-selection'
import {
  forceManyBody,
  forceLink,
  forceSimulation,
  forceCenter
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
      linkSteps = 3,
      sequenceThickness = 10,
      linkThickness = 2,
      theta = 0.9,
      strengthCenter = -50
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

  useEffect(() => {
    if (ref.current) {
      // clone nodes so that redrawing will reposition them
      const links = data.links.map((d) => ({
        ...d
      }))
      const nodes = data.nodes.map((d) => ({
        ...d
      }))

      ref.current.innerHTML = ''
      function tickActions() {
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

        // from https://stackoverflow.com/questions/16358905/
        link.attr('d', function (d) {
          var x1 = d.source.x,
            y1 = d.source.y,
            x2 = d.target.x,
            y2 = d.target.y,
            drx = 0,
            dry = 0,
            xRotation = 0, // degrees
            largeArc = 0, // 1 or 0
            sweep = 1 // 1 or 0

          // Self edge.
          if (x1 === x2 && y1 === y2) {
            // Fiddle with this angle to get loop oriented.
            xRotation = -45

            // Needs to be 1.
            largeArc = 1

            // Change sweep to change orientation of loop.
            //sweep = 0;

            // Make drx and dry different to get an ellipse
            // instead of a circle.
            drx = 30
            dry = 20

            // For whatever reason the arc collapses to a point if the beginning
            // and ending points of the arc are the same, so kludge it.
            x2 = x2 + 1
            y2 = y2 + 1
          }

          return (
            'M' +
            x1 +
            ',' +
            y1 +
            'A' +
            drx +
            ',' +
            dry +
            ' ' +
            xRotation +
            ',' +
            largeArc +
            ',' +
            sweep +
            ' ' +
            x2 +
            ',' +
            y2
          )
        })

        if (edgepaths) {
          edgepaths.attr(
            'd',
            (d) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`
          )
        }
      }
      const simulation = forceSimulation().nodes(nodes)
      const charge_force = forceManyBody().strength(strengthCenter).theta(theta)
      const center_force = forceCenter(width / 2, height / 2)
      const link_force = forceLink(links)
        .id((d) => d.id)
        .distance((link) => (link.sequence ? 1 : 10))
        .iterations(linkSteps)

      simulation
        .force('charge', charge_force)
        .force('center', center_force)
        .force('links', link_force)

      simulation.on('tick', tickActions)

      const svg = select(ref.current)
      const g = svg.append('g')
      const paths = generatePaths(links, graph.nodes)
      // const edges = generateEdges(links, data.links)

      const link = g
        .selectAll('line')
        .data(links)
        .join('path')
        .attr('stroke', (d) => {
          const same = d.linkNum !== undefined
          if (same) {
            const nodeIndex = paths.findIndex((path) => {
              return path.original.id === d.id
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
          return d.linkNum !== undefined ? sequenceThickness : linkThickness
        })
        .on('click', (event, d) => {
          onFeatureClick(d)
        })

      const node = g
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', 'rgba(255,255,255,0.0)')

      let edgepaths
      if (drawLabels) {
        edgepaths = g
          .selectAll('.edgepath')
          .data(links)
          .enter()
          .append('path')
          .attr(
            'd',
            (d) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`
          )
          .attr('id', (d, i) => 'edgepath-' + i)

        const edgelabels = g
          .selectAll('.edgelabel')
          .data(links)
          .enter()
          .append('text')
          .style('pointer-events', 'none')
          .attr('id', (d, i) => 'edgelabel-' + i)

        edgelabels
          .append('textPath')
          .attr('xlink:href', (d, i) => `#edgepath-${i}`)
          .style('pointer-events', 'none')
          .text((d, i) => {
            const sid = d.source.id.slice(0, d.source.id.lastIndexOf('-'))
            const tid = d.target.id.slice(0, d.target.id.lastIndexOf('-'))
            const same = sid === tid
            return same ? sid : ''
          })
      }

      function drag_start(event, d) {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }
        d.fx = event.x
        d.fy = event.y
      }

      function drag_drag(event, d) {
        d.fx = event.x
        d.fy = event.y
      }

      function drag_end(event, d) {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      var drag_handler = d3drag
        .drag()
        .on('start', drag_start)
        .on('drag', drag_drag)
        .on('end', drag_end)

      drag_handler(node)

      if (drag) {
        const zoom_handler = d3zoom()
        zoom_handler.on('zoom', (event) => {
          if (drag) {
            g.attr('transform', event.transform)
          }
        })

        zoom_handler(svg)
      }
    }
  }, [
    data.links,
    data.nodes,
    color,
    linkSteps,
    strengthCenter,
    drawLabels,
    sequenceThickness,
    linkThickness,
    theta,
    width,
    drag,
    redraw,
    height
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
