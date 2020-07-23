import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function reprocessGraph(G) {
  const Gp = { nodes: [], links: [] } // G'

  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, ...rest } = G.nodes[i]
    let step = 1000
    let nodes = []
    let done = false
    let last = 0
    for (let j = 0; j < sequence.length; j += step) {
      let source
      if (j === 0) {
        source = id + '-' + 'start'
      } else if (j + step >= sequence.length) {
        source = id + '-' + 'end'
        done = true
      } else {
        source = id + '-' + j
      }
      nodes.push({ ...rest, id: source, pos: j })
      last = j
    }
    if (!done) {
      nodes.push({ ...rest, id: id + '-' + 'end', pos: last })
    }
    Gp.nodes = Gp.nodes.concat(nodes)
    for (let j = 0; j < nodes.length - 1; j++) {
      const pos = nodes[j].pos
      const source = nodes[j].id
      const target = nodes[j + 1].id
      console.log({ sequence, pos, len: sequence.length })
      Gp.links.push({
        source,
        target,
        sequence: !!sequence,
      })
    }
  }
  for (let i = 0; i < G.links.length; i++) {
    const { strand1, strand2, source, target, rest } = G.links[i]
    if (strand1 === '+' && strand2 === '+') {
      Gp.links.push({
        source: source + '-end',
        target: target + '-start',
        ...rest,
      })
    }
    if (strand1 === '-' && strand2 === '+') {
      Gp.links.push({
        source: source + '-start',
        target: target + '-start',
        ...rest,
      })
    }
    if (strand1 === '-' && strand2 === '-') {
      Gp.links.push({
        source: source + '-start',
        target: target + '-end',
        ...rest,
      })
    }
    if (strand1 === '+' && strand2 === '-') {
      Gp.links.push({
        source: source + '-end',
        target: target + '-end',
        ...rest,
      })
    }
  }
  return Gp
}
export function Graph(props) {
  const { graph: pre } = props
  const ref = useRef()
  const graph = reprocessGraph(pre)
  let width = 400
  let height = 500

  useEffect(() => {
    const links = graph.links.map(d => Object.create(d))
    const nodes = graph.nodes.map(d => Object.create(d))
    const scale = d3.scaleOrdinal(d3.schemeCategory10)
    const color = d => scale(d.group)
    let max = 0
    for (let i = 0; i < graph.links.length; i++) {
      max = Math.max(max, (graph.links[i].sequence || {}).length || 0)
    }
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(link => {
            console.log(link, link.sequence ? 0.1 : 1)
            return link.sequence ? 1 : 10
          }),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
    for (var i = 0; i < 1000; ++i) {
      simulation.tick()
    }

    const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
    let thickness = 10

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => (d.sequence ? thickness * 1.5 : 3))

    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    ref.current.appendChild(svg.node())
  }, [graph.links, graph.nodes, height, width])

  return (
    <svg ref={ref} width="100%" height="100%" id="graph">
      {' '}
    </svg>
  )
}
