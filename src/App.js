import React, { useCallback, useEffect, useState, useRef } from 'react'
import { OpenDialog } from './OpenDialog'
import { FeatureDialog } from './FeatureDialog'
import { GraphContainer } from './GraphContainer'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import igv from 'igv'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import graph from './toy_example.json'
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
            <NavDropdown.Item onClick={() => onOpen(true)}>Open</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="#link">About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

function App() {
  const [show, setShow] = useState(false)
  const [featureData, setFeatureData] = useState()
  const callback = useCallback(data => {
    setFeatureData(data)
  }, [])
  return (
    <div>
      <Header
        onOpen={() => {
          setShow(true)
        }}
      />
      <OpenDialog show={show} onHide={() => setShow(false)} />
      {featureData ? (
        <FeatureDialog
          data={featureData}
          onModal={data => {
            setFeatureData(data)
          }}
          onHide={() => {
            setFeatureData(undefined)
          }}
        />
      ) : null}
      <div className="flexcontainer">
        <div id="sidebar" className="sidebar">
          <GraphContainer graph={graph} onFeatureClick={callback} />
        </div>
        <div className="body">
          <IGV />
        </div>
      </div>
    </div>
  )
}

export default App
