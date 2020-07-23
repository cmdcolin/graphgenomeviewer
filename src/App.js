import React, { useEffect, useRef } from 'react'
import './App.css'
import igv from 'igv'
import data from './MT.json'
import * as d3 from 'd3'
function App() {
  const ref = useRef()
  const svgRef = useRef()
  useEffect(() => {
    var igvOptions = { genome: 'hg38', locus: 'BRCA1' }
    return igv.createBrowser(ref.current, igvOptions)
  }, [])
  let width = 400
  let height = 500

  useEffect(() => {
    console.log('here')
    const links = data.links.map(d => Object.create(d))
    const nodes = data.nodes.map(d => Object.create(d))
    const scale = d3.scaleOrdinal(d3.schemeCategory10)
    const color = d => scale(d.group)

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id(d => d.id),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))

    const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
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

    svgRef.current.appendChild(svg.node())
  }, [height, width])
  return (
    <div>
      <div className="header">
        <h1>graphgenome browser</h1>
      </div>
      <div className="with-sidebar">
        <div id="sidebar" className="sidebar">
          Test
          <svg ref={svgRef} width="100%" height="100%" id="graph">
            {' '}
          </svg>
        </div>
        <div className="body">
          Body
          <div
            ref={ref}
            style={{
              paddingTop: '10px',
              paddingBottom: '10px',
              margin: '8px',
              border: '1px solid lightgray',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
