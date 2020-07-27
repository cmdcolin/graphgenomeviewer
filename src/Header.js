import React, { useRef, useState } from 'react'
import { Button, Form, Modal, Navbar, Nav, NavDropdown } from 'react-bootstrap'

function AboutDialog({ onHide }) {
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

function OpenURLDialog({ onHide, onData }) {
  const [value, setValue] = useState()
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>graphgenome browser</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={() => {
            onData(value)
            onHide()
          }}
        >
          <Form.Group>
            <Form.Label>Enter URL</Form.Label>
            <Form.Control
              type="input"
              value={value}
              onChange={event => setValue(event.target.value)}
            />
          </Form.Group>
          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

function OpenFileDialog({ onHide, onGraph }) {
  const ref = useRef()
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Open file</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={async event => {
            event.preventDefault()
            const data = await ref.current.files[0].text()
            onGraph(data)
            onHide()
          }}
        >
          <Form.Group>
            <Form.Label>Open file</Form.Label>
            <Form.Control ref={ref} type="file" />
          </Form.Group>
          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export function Header({ onData, onGraph }) {
  const [showAbout, setShowAbout] = useState()
  const [showOpenURL, setShowOpenURL] = useState()
  const [showOpenFile, setShowOpenFile] = useState()
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">graphgenome browser</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="File" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => setShowOpenURL(true)}>
                Open URL
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setShowOpenFile(true)}>
                Open file
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Examples" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => onData('MT.gfa')}>
                MT GFA-spec example
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('toy_pangenome.gfa')}>
                Paths example
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('big1.gfa')}>Big1</NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('ir1.gfa')}>Ir1</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link
              onClick={() => {
                setShowAbout(true)
              }}
            >
              About
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {showAbout ? <AboutDialog onHide={() => setShowAbout(false)} /> : null}
      {showOpenURL ? (
        <OpenURLDialog onData={onData} onHide={() => setShowOpenURL(false)} />
      ) : null}
      {showOpenFile ? (
        <OpenFileDialog onGraph={onGraph} onHide={() => setShowOpenFile(false)} />
      ) : null}
    </>
  )
}
