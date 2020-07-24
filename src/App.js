import React, { useEffect, useState, useRef } from 'react'
import { Graph } from './Graph'
import { saveAs } from 'file-saver'
import { OpenDialog } from './OpenDialog'
import { Button, Form, Navbar, Nav, NavDropdown } from 'react-bootstrap'
import igv from 'igv'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import graph from './MT.json'
function IGV() {
  useEffect(() => {
    igv.createBrowser(ref.current, { genome: 'hg38', locus: 'BRCA1' })
  }, [])

  const ref = useRef()
  return (
    <div
      ref={ref}
      style={{
        paddingTop: '10px',
        paddingBottom: '10px',
        margin: '8px',
        border: '1px solid lightgray',
      }}
    />
  )
}
function Header({ onOpen }) {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">graphgenome browser</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="File" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => onOpen(true)}>
              Open
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="#link">About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

// adapted from https://observablehq.com/@mbostock/saving-svg
function serialize(svg) {
  const xmlns = 'http://www.w3.org/2000/xmlns/'
  const xlinkns = 'http://www.w3.org/1999/xlink'
  const svgns = 'http://www.w3.org/2000/svg'

  svg = svg.cloneNode(true)
  const fragment = `${window.location.href}#`
  const walker = document.createTreeWalker(
    svg,
    NodeFilter.SHOW_ELEMENT,
    null,
    false,
  )
  while (walker.nextNode()) {
    for (const attr of walker.currentNode.attributes) {
      if (attr.value.includes(fragment)) {
        attr.value = attr.value.replace(fragment, '#')
      }
    }
  }
  svg.setAttributeNS(xmlns, 'xmlns', svgns)
  svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns)
  const serializer = new window.XMLSerializer()
  const string = serializer.serializeToString(svg)
  return new Blob([string], { type: 'image/svg+xml' })
}

export function GraphContainer(props) {
  const [value, setValue] = useState('Rainbow')
  const ref = useRef()
  return (
    <div>
      <Form.Group>
        <Form.Label>Example select</Form.Label>
        <Form.Control
          value={value}
          onChange={event => setValue(event.target.value)}
          as="select"
        >
          <option>Turbo</option>
          <option>Rainbow</option>
          <option>Spectral</option>
          <option>Viridis</option>
          <option>RdYlBu</option>
        </Form.Control>
        <Button onClick={() => saveAs(serialize(ref.current.children[0]))}>
          Export SVG
        </Button>
      </Form.Group>
      <Graph ref={ref} {...props} color={value} />
    </div>
  )
}
function App() {
  const [show, setShow] = useState(false)
  return (
    <div>
      <Header
        onOpen={() => {
          setShow(true)
        }}
      />
      <OpenDialog show={show} onHide={() => setShow(false)} />
      <div className="flexcontainer">
        <div id="sidebar" className="sidebar">
          <GraphContainer graph={graph} />
        </div>
        <div className="body">
          <IGV />
        </div>
      </div>
    </div>
  )
}

export default App
