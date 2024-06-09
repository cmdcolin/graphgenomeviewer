import React, { useMemo, useEffect, useRef } from 'react'
import { hsl } from 'd3-color'
import * as d3drag from 'd3-drag'
import { select } from 'd3-selection'
import { dot } from 'mathjs'
import {
  forceManyBody,
  forceLink,
  forceSimulation,
  forceCenter,
} from 'd3-force'
import * as d3interpolate from 'd3-scale-chromatic'
import { zoom as d3zoom } from 'd3-zoom'
import { projectLine, reprocessGraph, generatePaths, Link, Graph } from './util'
const { schemeCategory10 } = d3interpolate

function generateLinks(links: Link[]) {
  const newlinks = [] as {
    pathId?: string
    pathIndex?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }[]
  const pathIds = [] as string[]
  for (const { paths, ...rest } of links) {
    if (paths) {
      for (const pathId of paths) {
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

interface Settings {
  chunkSize: number
  linkSteps: number
  sequenceThickness: number
  linkThickness: number
  theta: number
  strengthCenter: number
}
interface Props {
  graph: Graph
  drawPaths?: boolean
  drawLabels?: boolean
  drag?: boolean
  settings?: Settings
  color?: string
  width?: number
  height?: number
  redraw?: number
  onFeatureClick?: (arg?: unknown) => void
}

function Graph(props: Props) {
  const {
    graph,
    drawPaths = false,
    drawLabels = false,
    color = 'Rainbow',
    settings,
    width = 2000,
    height = 1000,
    redraw = 0,
    onFeatureClick = () => {},
  } = props
  const {
    chunkSize = 1000,
    linkSteps = 3,
    sequenceThickness = 10,
    linkThickness = 2,
    theta = 0.9,
    strengthCenter = -50,
  } = settings || {}
  const ref = useRef<SVGSVGElement>(null)
  const data = useMemo(
    () => reprocessGraph(graph, chunkSize),
    [chunkSize, graph],
  )

  const colors = useMemo(
    () =>
      Object.fromEntries(
        graph.paths?.map((p, i) => [p.name, schemeCategory10[i]]) ?? [],
      ),
    [graph.paths],
  )

  useEffect(() => {
    if (!ref.current) {
      return
    }
    // clone links+nodes because these contain an x,y coordinate that is
    // physically modified by animation and so when we redraw/refresh, we
    // want to put them back to normal
    const links = data.links.map(d => ({
      ...d,
    }))
    const nodes = data.nodes.map(d => ({
      ...d,
    }))

    // clear svg on each run
    ref.current.innerHTML = ''

    // animation
    function tickActions() {
      // @ts-expect-error
      node.attr('cx', d => d.x).attr('cy', d => d.y)

      // @ts-expect-error
      const paths = generatePaths(links, graph.nodes)

      const nodePathMap = {}
      for (const p of paths) {
        const l = p.links.length
        // @ts-expect-error
        nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
        // @ts-expect-error
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
          const [s1 = 0, t1 = 0] = nodePathMap[d.source.id] || []
          const [s2 = 0, t2 = 0] = nodePathMap[d.target.id] || []

          // this checks the dot product of the direction that the node is
          // oriented (s1,t1) to where the node is connecting to (t1,t2)
          // other combinations could be chosen here but it helps to
          // determine whether to draw the arc or not, a circular layout is a
          // self-connection but does not need an arc
          const dotresult = dot(
            [t1[0] - s1[0], t1[1] - s1[1]],
            [t1[0] - t2[0], t1[1] - t2[1]],
          )

          if (same && !Number.isNaN(dotresult) && dotresult > 0) {
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
            const dr = Math.hypot(dx, dy) + Math.random() * 40
            const sweep = d.pathIndex % 2
            return `M${x1},${y1}A${dr},${dr} 0 0,${sweep} ${x2},${y2}`
          } else {
            const [cx1, cy1] = projectLine(
              s1[0],
              s1[1],
              t1[0],
              t1[1],
              20 + d.pathIndex * 30,
            )
            const [cx2, cy2] = projectLine(
              s2[0],
              s2[1],
              t2[0],
              t2[1],
              20 + d.pathIndex * 30,
            )

            return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2}, ${y2}`
          }
        }
      })

      link

      if (edgepaths) {
        edgepaths.attr(
          'd',
          // @ts-expect-error
          d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`,
        )
      }
    }
    // @ts-expect-error
    const simulation = forceSimulation().nodes(nodes)
    const charge_force = forceManyBody().strength(strengthCenter).theta(theta)
    const center_force = forceCenter(width / 3, height / 3)
    const link_force = forceLink(links)
      // @ts-expect-error
      .id(d => d.id)
      .distance(link => (link.sequence ? 1 : 10))
      .iterations(linkSteps)

    simulation
      .force('charge', charge_force)
      .force('center', center_force)
      .force('links', link_force)

    simulation.on('tick', tickActions)

    const svg = select(ref.current)

    // create arrowhead marker, from
    // https://observablehq.com/@xianwu/force-directed-graph-network-graph-with-arrowheads-and-lab
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      //the bound of the SVG viewport for the current SVG fragment. defines a
      //coordinate system 10 wide and 10 high starting on (0,-5)
      .attr('refX', 10)
      // x coordinate for the reference point of the marker. If circle is
      // bigger, this need to be bigger.
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'rgba(120,120,120,0.9)')
      .style('stroke', 'none')

    const g = svg.append('g')
    // @ts-expect-error
    const paths = generatePaths(links, graph.nodes)

    const nodePathMap = {}
    for (const p of paths) {
      const l = p.links.length
      // @ts-expect-error
      nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
      // @ts-expect-error
      nodePathMap[`${p.original.id}-end`] = [p.links[l - 2], p.links[l - 1]]
    }

    const link = g
      .selectAll('path')
      .data(drawPaths ? generateLinks(links) : links)
      .join('path')
      .attr('marker-end', d => (d.id ? '' : 'url(#arrowhead)'))
      .attr('stroke', d => {
        const same = d.linkNum !== undefined
        if (same) {
          // @ts-expect-error
          const idx = paths.findIndex(path => path.original.id === d.id)
          return color.startsWith('Just')
            ? color.replace('Just', '').toLowerCase()
            : hsl(d3interpolate[`interpolate${color}`](idx / paths.length))
                .darker()
                .toString()
        } else {
          return drawPaths ? colors[d.pathId ?? ''] : 'rgba(120,120,120,0.8)'
        }
      })
      .attr('fill', 'none')
      .attr('stroke-width', d => {
        return d.linkNum === undefined ? linkThickness : sequenceThickness
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
        // @ts-expect-error
        d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`,
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
      .text(d => {
        // @ts-expect-error
        const sid = d.source.id.slice(0, d.source.id.lastIndexOf('-'))
        // @ts-expect-error
        const tid = d.target.id.slice(0, d.target.id.lastIndexOf('-'))
        const same = sid === tid && d.id
        return same ? sid : ''
      })

    d3drag
      .drag()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('start', (event, d: any) => {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }
        d.fx = event.x
        d.fy = event.y
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('drag', (event, d: any) => {
        d.fx = event.x
        d.fy = event.y
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('end', (event, d: any) => {
        if (!event.active) {
          simulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
        // @ts-expect-error
      })(node)

    d3zoom().on('zoom', event => {
      g.attr('transform', event.transform)
      // @ts-expect-error
    })(svg)
  }, [
    colors,
    graph.nodes,
    onFeatureClick,
    ref,
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
    height,
  ])

  return (
    <svg
      width={2000}
      height={1000}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ fontSize: drawLabels ? 10 : 0 }}
      viewBox={[0, 0, 2000, 1000].toString()}
    />
  )
}

export default Graph
