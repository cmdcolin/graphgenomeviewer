import React, { useMemo, useEffect } from 'react'
import * as d3 from 'd3'

function reprocessGraph(G, blockSize = 500) {
  const Gp = { nodes: [], links: [] } // G'

  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, ...rest } = G.nodes[i]
    const nodes = []
    let pos = 0
    for (pos = 0; pos < sequence.length - blockSize; pos += blockSize) {
      if (pos === 0) {
        nodes.push({ ...rest, id: `${id}-start`, pos })
      } else {
        nodes.push({ ...rest, id: `${id}-${pos}`, pos })
      }
    }
    nodes.push({ ...rest, id: `${id}-end`, pos })
    for (let j = 0; j < nodes.length - 1; j++) {
      const source = nodes[j].id
      const target = nodes[j + 1].id
      Gp.links.push({
        ...rest,
        source,
        target,
        id,
        linkNum: i,
        length: sequence.length,
        sequence, // could put actual sequence here if needed
      })
    }
    Gp.nodes = Gp.nodes.concat(nodes)
  }
  for (let i = 0; i < G.links.length; i++) {
    const { strand1, strand2, source, target, ...rest } = G.links[i]

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

function* generatePaths(links, graph) {
  let currentLinkId = links[0].linkNum
  let currentLinkSet = []
  let original
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    if (currentLinkId !== link.linkNum) {
      yield { links: currentLinkSet, id: original.id, sequence: original.sequence }
      currentLinkSet = []
      currentLinkId = link.linkNum
    }
    original = graph[i]
    currentLinkSet.push([link.source.x, link.source.y])
    currentLinkSet.push([link.target.x, link.target.y])
  }
  yield { links: currentLinkSet, id: original.id, sequence: original.sequence }
}

function* generateEdges(links, graph) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const original = graph[i]
    if (!original.id) {
      yield {
        links: [
          [link.source.x, link.source.y],
          [link.target.x, link.target.y],
        ],
        original,
      }
    }
  }
}

const Graph = React.forwardRef((props, ref) => {
  const {
    graph,
    blockSize = 500,
    contigThickness = 10,
    edgeThickness = 3,
    color = 'Rainbow',
    width = 1000,
    height = 1000,
    steps = 2000,
    onFeatureClick = () => {
      console.log('no feature click configured')
    },
  } = props
  const data = useMemo(() => {
    return reprocessGraph(graph, blockSize)
  }, [blockSize, graph])
  const total = graph.nodes.length

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
    for (let i = 0; i < steps; ++i) {
      simulation.tick()
    }
    console.log('here', data, links)
    return links
  }, [data, height, steps, width])

  // Add the valueline path.
  // svg.append('path').data([data]).attr('class', 'line').attr('d', valueline)

  // const g = svg
  //   .append('g')
  //   .attr('stroke-opacity', 0.6)
  //   .selectAll('line')
  //   .data(links)
  //   .join('line')
  //   .attr('stroke-width', d => {
  //     return d.sequence ? thickness * 1.5 : 3
  //   })
  //   .attr('stroke', d => {
  //     return d.sequence
  //       ? d3.hsl(d3[`interpolate${color}`](d.linkNum / total)).darker()
  //       : 'grey'
  //   })
  //   .attr('x1', d => d.source.x)
  //   .attr('y1', d => d.source.y)
  //   .attr('x2', d => d.target.x)
  //   .attr('y2', d => d.target.y)
  //   .on('mouseover', (d, i) => {
  //     const link = data.links[i]
  //     div.transition().style('opacity', 0.9)

  //     const text =
  //       link.id ||
  //       `${link.source.replace(/-start|-end/, '')}-${link.target.replace(
  //         /-start|-end/,
  //         '',
  //       )}`
  //     div
  //       .html(text)
  //       .style('left', `${d3.event.pageX}px`)
  //       .style('top', `${d3.event.pageY - 28}px`)
  //   })
  //   .on('mouseout', () => {
  //     div.transition().style('opacity', 0)
  //   })
  //   .on('click', (d, i) => {
  //     div.transition().style('opacity', 0)
  //     const link = data.links[i]
  //     onFeatureClick(link)
  //   })

  // // zoom logic, similar to https://observablehq.com/@d3/zoom
  // function zoomed() {
  //   g.attr('transform', d3.event.transform)
  // }
  // svg.call(
  //   d3
  //     .zoom()
  //     .extent([
  //       [0, 0],
  //       [width, height],
  //     ])
  //     .scaleExtent([0.1, 8])
  //     .on('zoom', zoomed),
  // )

  // ref.current.appendChild(svg.node())
  // }, [
  // color,
  // data,
  // data.links,
  // data.nodes,
  // graph.links,
  // height,
  // links,
  // onFeatureClick,
  // ref,
  // thickness,
  // total,
  // width,
  // ])

  // const edges = []
  // const contigs = []
  // for (let i = 0; i < links.length; i++) {
  //   if (links[i].sequence) {
  //     edges.push(links[i])
  //   } else {
  //     contigs.push(links[i])
  //   }
  // }
  const paths = [...generatePaths(links, data.links)]
  const edges = [...generateEdges(links, data.links)]
  return (
    <svg ref={ref} viewBox={[0, 0, width, height].toString()}>
      {paths.map(p => {
        const line = d3.line().context(null)
        return p.id ? (
          <path
            d={line(p.links)}
            title={p.id}
            strokeWidth={contigThickness}
            stroke="black"
            fill="none"
            onClick={() => onFeatureClick(p)}
          />
        ) : null
      })}
      {edges.map(p => {
        const line = d3.line().context(null)
        return (
          <path
            d={line(p.links)}
            strokeWidth={edgeThickness}
            stroke="black"
            fill="none"
            onClick={() => onFeatureClick(p)}
          />
        )
      })}
    </svg>
  )
})

export { Graph }
