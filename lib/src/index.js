import React, { useRef, useMemo, useEffect } from 'react'
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
import { projectLine, reprocessGraph, generatePaths } from './util'
const { schemeCategory10 } = d3interpolate

function generateLinks(links) {
  let newlinks = []
  let pathIds = []
  for (let i = 0; i < links.length; i++) {
    const { paths, ...rest } = links[i]
    if (paths) {
      for (let j = 0; j < paths.length; j++) {
        const pathId = paths[j]
        let pathIndex = pathIds.indexOf(pathId)
        if (pathIndex === -1) {
          pathIds.push(pathId)
          pathIndex = pathIds.length - 1
        }
        newlinks.push({ ...rest, pathId, pathIndex })
      }
    } else {
      newlinks.push(rest)
    }
  }
  return newlinks
}

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

  const dragRef = useRef()
  dragRef.current = drag

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

  useEffect(() => {
    if (ref.current) {
      // clone links+nodes because these contain an x,y coordinate that is
      // physically modified by animation and so when we redraw/refresh, we
      // want to put them back to normal
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

        const paths = generatePaths(links, graph.nodes)

        const nodePathMap = {}
        for (let i = 0; i < paths.length; i++) {
          const p = paths[i]
          const l = p.links.length
          nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
          nodePathMap[`${p.original.id}-end`] = [p.links[l - 2], p.links[l - 1]]
        }

        // from https://stackoverflow.com/questions/16358905/
        link.attr('d', function (d) {
          const x1 = d.source.x
          const y1 = d.source.y
          const x2 = d.target.x
          const y2 = d.target.y
          if (d.pathIndex === undefined) {
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
          } else {
            const [s1, t1] = nodePathMap[d.source.id]
            const [s2, t2] = nodePathMap[d.target.id]
            const m1 = (y2 - y1) / (x2 - x1)
            const m2 = (s1[1] - t1[1]) / (s1[0] - t1[0])
            const m3 = (s2[1] - t2[1]) / (s2[0] - t2[0])

            if (Math.abs(m1 - m2) < 0.2 || Math.abs(m1 - m3) < 0.2) {
              const dx = x2 - x1
              const dy = y2 - y1
              const dr = Math.sqrt(dx * dx + dy * dy) + Math.random() * 40
              const sweep = d.pathIndex % 2
              return `M${x1},${y1}A${dr},${dr} 0 0,${sweep} ${x2},${y2}`
            } else {
              const [cx1, cy1] = projectLine(
                s1[0],
                s1[1],
                t1[0],
                t1[1],
                20 + d.pathIndex * 30
              )
              const [cx2, cy2] = projectLine(
                s2[0],
                s2[1],
                t2[0],
                t2[1],
                20 + d.pathIndex * 30
              )

              return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2}, ${y2}`
            }
          }
        })

        link

        if (edgepaths) {
          edgepaths.attr(
            'd',
            (d) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
          )
        }
      }
      const simulation = forceSimulation().nodes(nodes)
      const charge_force = forceManyBody().strength(strengthCenter).theta(theta)
      const center_force = forceCenter(width / 3, height / 3)
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

      const nodePathMap = {}
      for (let i = 0; i < paths.length; i++) {
        const p = paths[i]
        const l = p.links.length
        nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
        nodePathMap[`${p.original.id}-end`] = [p.links[l - 2], p.links[l - 1]]
      }

      const link = g
        .selectAll('line')
        .data(drawPaths ? generateLinks(links) : links)
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
            if (drawPaths) {
              return colors[d.pathId]
            } else {
              return 'grey'
            }
          }
        })
        .attr('fill', 'none')
        .attr('stroke-width', (d) => {
          return d.linkNum !== undefined ? sequenceThickness : linkThickness
        })
        .on('click', (_, d) => {
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
          (d) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
        )
        .attr('id', (_, i) => 'edgepath-' + i)

      const edgelabels = g
        .selectAll('.edgelabel')
        .data(links)
        .enter()
        .append('text')
        .attr('dy', 12)
        .attr('id', (_, i) => 'edgelabel-' + i)

      edgelabels
        .append('textPath')
        .attr('href', (_, i) => `#edgepath-${i}`)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text((d) => {
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
      const zoom_handler = d3zoom()
      zoom_handler.on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
      zoom_handler(svg)
    }
  }, [
    data.links,
    data.nodes,
    color,
    linkSteps,
    drawPaths,
    strengthCenter,
    sequenceThickness,
    linkThickness,
    theta,
    width,
    redraw,
    height
  ])

  return (
    <svg
      width='100%'
      height='100%'
      ref={ref}
      style={{ fontSize: drawLabels ? 10 : 0 }}
      viewBox={[0, 0, width, height].toString()}
    ></svg>
  )
})

export default Graph
