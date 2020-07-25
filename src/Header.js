import React from 'react'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'

export function Header({ onData }) {
  return (
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
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
