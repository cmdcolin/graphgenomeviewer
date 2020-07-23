import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function reprocessGraph(G) {
  const Gp = { nodes: [], links: [] } // G'

  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, ...rest } = G.nodes[i]
    Gp.nodes.push({ ...rest, id: id + 'start' })
    Gp.nodes.push({ ...rest, id: id + 'end' })
    Gp.links.push({
      source: id + 'start',
      target: id + 'end',
      sequence,
    })
  }
  for (let i = 0; i < G.links.length; i++) {
    const { strand1, strand2, source, target, rest } = G.links[i]
    if (strand1 === '+' && strand2 === '+') {
      Gp.links.push({
        source: source + 'end',
        target: target + 'start',
        ...rest,
      })
    }
    if (strand1 === '-' && strand2 === '+') {
      Gp.links.push({
        source: source + 'start',
        target: target + 'start',
        ...rest,
      })
    }
    if (strand1 === '-' && strand2 === '-') {
      Gp.links.push({
        source: source + 'start',
        target: target + 'end',
        ...rest,
      })
    }
    if (strand1 === '+' && strand2 === '-') {
      Gp.links.push({
        source: source + 'end',
        target: target + 'end',
        ...rest,
      })
    }
  }
  return Gp
}
export function Graph(props) {
  const { graph: pre } = props
  let graph = reprocessGraph(pre)
  let max = 0
  for (let i = 0; i < graph.links.length; i++) {
    max = Math.max(max, (graph.links[i].sequence || {}).length || 0)
  }
  const ref = useRef()
  let width = 400
  let height = 500

  useEffect(() => {
    const links = graph.links.map(d => Object.create(d))
    const nodes = graph.nodes.map(d => Object.create(d))
    const scale = d3.scaleOrdinal(d3.schemeCategory10)
    const color = d => scale(d.group)

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(link =>
            link.sequence ? 100 * (link.sequence.length / max) : 4,
          ),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
    //.distance(function (link) {
    //  console.log(link)
    //  return link.sequence ? link.sequence.length : 1
    //  //graph === 0 ? height / 2 : height / 4
    //})

    const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
    let thickness = 5

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => (d.sequence ? thickness * 1.5 : 3))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', thickness)
      .attr('fill', color)
    //.call(drag(simulation));

    node.append('title').text(d => d.id)

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('cx', d => d.x).attr('cy', d => d.y)
    })

    //invalidation.then(() => simulation.stop());

    ref.current.appendChild(svg.node())
  }, [graph.links, graph.nodes, height, max, width])

  return (
    <svg ref={ref} width="100%" height="100%" id="graph">
      {' '}
    </svg>
  )
}
