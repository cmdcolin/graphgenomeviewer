import React from 'react'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'

export function Header({ onOpen, onData }) {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">graphgenome browser</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="File" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => onOpen(true)}>Open</NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Examples" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => onData('MT.gfa')}>
              MT GFA-spec example
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => onData('toy_pangenome.gfa')}>
              Paths example
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
