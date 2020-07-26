import React, { useState } from 'react'
import { Modal, Navbar, Nav, NavDropdown } from 'react-bootstrap'

function About({ onHide }) {
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>graphgenome browser</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          This is a small demo of browsing a simple graph genomes. The samples are
          provided via GFA format
        </p>
        <p>
          Contact <a href="mainto:colin.diesh@gmail.com">Colin Diesh</a>
        </p>
        <p>
          Thanks to the BCC2020 pangenome team, and{' '}
          <a href="https://github.com/rrwick/Bandage">Bandage</a> for inspiration
        </p>
        <a href="https://github.com/cmdcolin/graphgenomeviewer">GitHub</a>
      </Modal.Body>
    </Modal>
  )
}
export function Header({ onData }) {
  const [show, setShow] = useState()
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">graphgenome browser</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="Examples" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => onData('MT.gfa')}>
                MT GFA-spec example
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('toy_pangenome.gfa')}>
                Paths example
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link
              onClick={() => {
                setShow(true)
              }}
            >
              About
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {show ? <About onHide={() => setShow(false)} /> : null}
    </>
  )
}
