import React, { useEffect, useState, useRef } from 'react'
import igv from 'igv'
import { Graph } from './Graph'
import { Modal, Button, Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { parseGFA } from './util'
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

function OpenDialog({ show, onHide }) {
  return (
    <Modal show={show}>
      <Modal.Header closeButton>
        <Modal.Title>Modal title</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Modal body text goes here.</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary">Save changes</Button>
      </Modal.Footer>
    </Modal>
  )
}

function App() {
  const [show, setShow] = useState(false)
  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">graphgenome browser</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="File" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => setShow(true)}>
                Open
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#link">About</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <OpenDialog show={show} onHide={() => setShow(false)} />

      <div className="with-sidebar">
        <div id="sidebar" className="sidebar">
          <Graph graph={graph} />
        </div>
        <div className="body">
          <IGV />
        </div>
      </div>
    </div>
  )
}

export default App
