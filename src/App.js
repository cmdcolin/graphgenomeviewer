import React, { useEffect, useRef } from 'react'
import './App.css'
import igv from 'igv'
import { Graph } from './Graph'
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button,
} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import graph from './MT.json'

function App() {
  const ref = useRef()
  useEffect(() => {
    var igvOptions = { genome: 'hg38', locus: 'BRCA1' }
    return igv.createBrowser(ref.current, igvOptions)
  }, [])

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">graphgenome browser</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="with-sidebar">
        <div id="sidebar" className="sidebar">
          <Graph graph={graph} />
        </div>
        <div className="body">
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
