import React, { useMemo, useEffect } from 'react'
import * as d3 from 'd3'
function reprocessGraph(G, step = 1000) {
  const Gp = { nodes: [], links: [] } // G'

  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, ...rest } = G.nodes[i]
    let nodes = []
    let done = false
    let last = 0
    for (let j = 0; j < sequence.length; j += step) {
      let source
      if (j === 0) {
        source = `${id}-start`
      } else if (j + step >= sequence.length) {
        source = `${id}-end`
        done = true
      } else {
        source = `${id}-${j}`
      }
      nodes.push({ ...rest, id: source, pos: j })
      last = j
    }
    if (!done) {
      nodes.push({ ...rest, id: `${id}-end`, pos: last })
    }
    Gp.nodes = Gp.nodes.concat(nodes)
    for (let j = 0; j < nodes.length - 1; j++) {
      const source = nodes[j].id
      const target = nodes[j + 1].id
      Gp.links.push({
        source,
        target,
        originalId: id,
        linkNum: i,
        sequence: !!sequence, // could put actual sequence here if needed
      })
    }
  }
  for (let i = 0; i < G.links.length; i++) {
    const { strand1, strand2, source, target, rest } = G.links[i]

    // enumerates cases for which end of source connects to
    // which end of the target
    if (strand1 === '+' && strand2 === '+') {
      Gp.links.push({
        source: `${source}-end`,
        target: `${target}-start`,
        ...rest,
      })
    }
    if (strand1 === '-' && strand2 === '+') {
      Gp.links.push({
        source: `${source}-start`,
        target: `${target}-start`,
        ...rest,
      })
    }
    if (strand1 === '-' && strand2 === '-') {
      Gp.links.push({
        source: `${source}-start`,
        target: `${target}-end`,
        ...rest,
      })
    }
    if (strand1 === '+' && strand2 === '-') {
      Gp.links.push({
        source: `${source}-end`,
        target: `${target}-end`,
        ...rest,
      })
    }
  }
  return Gp
}

const Graph = React.forwardRef((props, ref) => {
  const { graph, thickness = 10, color, width = 400, height = 500 } = props
  const data = useMemo(() => {
    return reprocessGraph(graph)
  }, [graph])
  let total = graph.nodes.length

  const links = useMemo(() => {
    const links = data.links.map(d => Object.create(d))
    const nodes = data.nodes.map(d => Object.create(d))
    let max = 0
    for (let i = 0; i < data.links.length; i++) {
      max = Math.max(max, (data.links[i].sequence || {}).length || 0)
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(link => {
            return link.sequence ? 1 : 10
          }),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))

    /// run a 1000 simulation node ticks
    for (var i = 0; i < 1000; ++i) {
      simulation.tick()
    }
    return links
  }, [data.links, data.nodes, height, width])

  useEffect(() => {
    ref.current.innerHTML = ''
    const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
    const g = svg
      .append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => {
        return d.sequence ? thickness * 1.5 : 3
      })
      .attr('stroke', d => {
        return d.sequence
          ? d3.hsl(d3[`interpolate${color}`](d.linkNum / total)).darker()
          : 'grey'
      })
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    // zoom logic, similar to https://observablehq.com/@d3/zoom
    function zoomed() {
      g.attr('transform', d3.event.transform)
    }
    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.1, 8])
        .on('zoom', zoomed),
    )

    ref.current.appendChild(svg.node())
  }, [
    color,
    data.links,
    data.nodes,
    height,
    links,
    ref,
    thickness,
    total,
    width,
  ])

  return <div ref={ref} />
})

export { Graph }
