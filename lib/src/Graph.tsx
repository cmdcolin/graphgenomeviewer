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
  const pathIds = new Map<string, number>()
  for (const { paths, ...rest } of links) {
    if (paths) {
      for (const pathId of paths) {
        if (!pathIds.has(pathId)) {
          pathIds.set(pathId, pathIds.size)
        }
        newlinks.push({ ...rest, pathId, pathIndex: pathIds.get(pathId) })
      }
    } else {
      newlinks.push(rest)
    }
  }
  return newlinks
}

function Graph({
  graph,
  drawPaths = false,
  drawLabels = false,
  colorScheme = 'Rainbow',
  chunkSize = 1000,
  linkSteps = 10,
  sequenceThickness = 10,
  linkThickness = 2,
  theta = 0.9,
  strengthCenter = -50,
  width = 2000,
  height = 1000,
  onFeatureClick = () => {},
}: {
  graph: Graph
  drawPaths?: boolean
  drawLabels?: boolean
  colorScheme?: string
  width?: number
  height?: number
  chunkSize?: number
  linkSteps?: number
  sequenceThickness?: number
  linkThickness?: number
  theta?: number
  strengthCenter?: number
  onFeatureClick?: (arg?: Record<string, unknown>) => void
}) {
  const ref = useRef<SVGSVGElement>(null)
  const { colors, links, nodes } = useMemo(() => {
    const data = reprocessGraph(graph, chunkSize)

    // clone links/nodes because the x,y positions will be mutated by d3 force layout
    const links = data.links.map(d => ({ ...d }))
    const nodes = data.nodes.map(d => ({ ...d }))
    const colors = Object.fromEntries(
      graph.paths?.map((p, i) => [p.name, schemeCategory10[i]]) ?? [],
    )
    return {
      data,
      links,
      nodes,
      colors,
    }
  }, [chunkSize, graph])

  useEffect(() => {
    if (!ref.current) {
      return
    }

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
  }, [])

  useEffect(() => {
    if (!ref.current) {
      return
    }

    // @ts-expect-error
    const sim = forceSimulation().nodes(nodes)
    const chargeForce = forceManyBody().strength(strengthCenter).theta(theta)
    const centerForce = forceCenter(width / 3, height / 3)
    const linkForce = forceLink(links)
      // @ts-expect-error
      .id(d => d.id)
      .distance(link => (link.sequence ? 10 : 10))
      .iterations(linkSteps)

    sim
      .force('charge', chargeForce)
      .force('center', centerForce)
      .force('links', linkForce)

    sim.on('tick', () => {
      // @ts-expect-error
      node.attr('cx', d => d.x).attr('cy', d => d.y)

      const nodePathMap = {} as Record<
        string,
        [[number, number], [number, number]]
      >
      // @ts-expect-error
      const paths = generatePaths(links, graph.nodes)
      for (const p of paths) {
        const l = p.links.length
        // @ts-expect-error
        nodePathMap[`${p.original.id}-start`] = [p.links[1], p.links[0]]
        // @ts-expect-error
        nodePathMap[`${p.original.id}-end`] = [p.links[l - 2], p.links[l - 1]]
      }
      const c = d3interpolate[
        `interpolate${colorScheme}` as keyof typeof d3interpolate
      ] as (n: number) => string

      select('#nodearea')
        .selectAll('path')
        .data(drawPaths ? generateLinks(links) : links)
        .join('path')
        .attr('marker-end', d => (d.id ? '' : 'url(#arrowhead)'))
        .attr('stroke', d => {
          const same = d.linkNum !== undefined
          if (same) {
            // @ts-expect-error
            const idx = paths.findIndex(path => path.original.id === d.id)
            return colorScheme.startsWith('Just')
              ? colorScheme.replace('Just', '').toLowerCase()
              : hsl(c(idx / paths.length))
                  .darker()
                  .toString()
          } else {
            return drawPaths ? colors[d.pathId ?? ''] : 'rgba(120,120,120,0.8)'
          }
        })
        .attr('fill', 'none')
        .attr('stroke-width', d =>
          d.linkNum === undefined ? linkThickness : sequenceThickness,
        )
        .on('click', (_, d) => onFeatureClick(d))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('d', (d: any) => {
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

            const dsource = d.source.id || ''
            const dtarget = d.target.id || ''
            const sid = dsource.slice(0, dsource.lastIndexOf('-'))
            const tid = dtarget.slice(0, dtarget.lastIndexOf('-'))
            const same = sid === tid && !d.id
            const [s1 = [0, 0], t1 = [0, 0]] = nodePathMap[dsource] || []
            const [_s2, t2 = [0, 0]] = nodePathMap[dtarget] || []

            // check dot product of the direction that the node is oriented
            // (s1,t1) -> (t1,t2) other combinations could be chosen here but
            // it helps to determine whether to draw the arc or not, a circular
            // layout is a self-connection but does not need an arc
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
            const dsource = d.source.id || ''
            const dtarget = d.target.id || ''
            const [s1, t1] = nodePathMap[dsource]
            const [s2, t2] = nodePathMap[dtarget]
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
              const p = 20 + d.pathIndex * 30
              const [cx1, cy1] = projectLine(s1[0], s1[1], t1[0], t1[1], p)
              const [cx2, cy2] = projectLine(s2[0], s2[1], t2[0], t2[1], p)
              return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2}, ${y2}`
            }
          }
        })
        .attr('id', (_, i) => 'edgepath-' + i)
    })

    const svg = select(ref.current)

    const g = select('#nodearea')
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

    g.selectAll('.edgelabel')
      .data(links)
      .enter()
      .append('text')
      .attr('dy', 12)
      .attr('id', (_, i) => 'edgelabel-' + i)
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

    // add 10px large click handlers invisible (alpha=0) "node handles"
    // and uses raise to keep them on top
    // todo: add an onclick to map to onFeatureClick
    const node = g
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 7)
      .attr('fill', 'rgba(255,255,255,0.0)')
      .raise()

    d3drag
      .drag()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('start', (event, d: any) => {
        if (!event.active) {
          sim.alphaTarget(0.3).restart()
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
          sim.alphaTarget(0)
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
    drawPaths,
    drawLabels,
    linkSteps,
    theta,
    colorScheme,
    sequenceThickness,
    linkThickness,
    strengthCenter,
    width,
    height,
    onFeatureClick,
    colors,
    nodes,
    links,
    graph.nodes,
  ])

  return (
    <svg
      width={width}
      height={height}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ fontSize: drawLabels ? 8 : 0 }}
      viewBox={[0, 0, width, height].toString()}
    >
      <g id="nodearea"></g>
    </svg>
  )
}

export default Graph
