import React, { useMemo, useEffect } from 'react'
import { hsl } from 'd3-color'
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
      // clone links+nodes so that redrawing will reposition them
      const links = data.links.map((d) => ({
        ...d
      }))
      const nodes = data.nodes.map((d) => ({
        ...d
      }))

      // clear svg on each run
      ref.current.innerHTML = ''

      // animation
      function tickActions() {
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

        // from https://stackoverflow.com/questions/16358905/
        link.attr('d', function (d) {
          const x1 = d.source.x
          const y1 = d.source.y
          let x2 = d.target.x
          let y2 = d.target.y
          let drx = 0
          let dry = 0
          let xRotation = 0 // degrees
          let largeArc = 0 // 1 or 0
          const sweep = 0 // 1 or 0

          const sid = d.source.id.slice(0, d.source.id.lastIndexOf('-'))
          const tid = d.target.id.slice(0, d.target.id.lastIndexOf('-'))
          const same = sid === tid && !d.id
          if (same) {
            xRotation = -45
            largeArc = 1
            drx = 25
            dry = 20
          }

          return `M${x1},${y1}A${drx},${dry},${xRotation},${largeArc},${sweep} ${x2},${y2}`
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
        .attr('fill', 'none')
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
        .attr('r', 7)
        .attr('fill', 'rgba(255,255,255,0.0)')

      const edgepaths = g
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
        .attr('dy', 12)
        .attr('id', (d, i) => 'edgelabel-' + i)

      edgelabels
        .append('textPath')
        .attr('href', (d, i) => `#edgepath-${i}`)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text((d, i) => {
          const sid = d.source.id.slice(0, d.source.id.lastIndexOf('-'))
          const tid = d.target.id.slice(0, d.target.id.lastIndexOf('-'))
          const same = sid === tid && d.id
          return same ? sid : ''
        })

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
    sequenceThickness,
    linkThickness,
    theta,
    width,
    drag,
    redraw,
    height
  ])

  return (
    <svg
      width='100%'
      height='100%'
      ref={ref}
      style={{ fontSize: drawLabels ? 10 : 0 }}
    ></svg>
  )
})

export default Graph
