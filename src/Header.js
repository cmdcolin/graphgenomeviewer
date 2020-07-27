import React, { useRef, useState } from 'react'
import { Button, Col, Form, Modal, Navbar, Nav, NavDropdown, Row } from 'react-bootstrap'

function SettingsDialog({ onHide, settings, onSettings }) {
  const [numSteps, setNumSteps] = useState(settings.numSteps)
  const [chunkSize, setChunkSize] = useState(settings.chunkSize)
  const [strength, setStrength] = useState(settings.strength)
  const [theta, setTheta] = useState(settings.theta)
  const [sequenceThickness, setSequenceThickness] = useState(settings.sequenceThickness)
  const [linkThickness, setLinkThickness] = useState(settings.linkThickness)
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={event => {
            event.preventDefault()
            onSettings({
              ...settings,
              chunkSize: +chunkSize,
              numSteps: +numSteps,
              strength: +strength,
              theta: +theta,
              sequenceThickness: +sequenceThickness,
              linkThickness: +linkThickness,
            })
            onHide()
          }}
        >
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Number of simulation steps
              <Form.Text muted>Used in the force-based layout simulation</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                column
                type="number"
                value={numSteps}
                onChange={event => setNumSteps(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence chunk size
              <Form.Text muted>
                If a contig is of length 5000, then chunk length 1000 would become 5
                segments. Note that contigs smaller than the chunk length may not be
                proportionally sized
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                column
                type="number"
                value={chunkSize}
                onChange={event => setChunkSize(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Theta
              <Form.Text muted>Parameter for the force directed layout</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                column
                type="number"
                value={theta}
                onChange={event => setTheta(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Force directed layout strength
              <Form.Text muted>
                Used in the force-based layout simulation, larger values have more
                repulsion
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                column
                type="number"
                value={strength}
                onChange={event => setStrength(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence thickness
            </Form.Label>
            <Col>
              <Form.Control
                column
                type="number"
                value={sequenceThickness}
                onChange={event => setSequenceThickness(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Link thickness
            </Form.Label>
            <Col>
              <Form.Control
                column
                type="input"
                value={linkThickness}
                onChange={event => setLinkThickness(event.target.value)}
              />
            </Col>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

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
          <a href="https://github.com/rrwick/Bandage">Bandage</a> for inspiration.
        </p>
        <p>
          Sample data from GFA-spec repo (MT.gfa), Andrea Guarracino (path example), and
          gfalint (Shaun Jackman)
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

export function Header({ onData, settings, onGraph, onSettings }) {
  const [showAbout, setShowAbout] = useState()
  const [showSettings, setShowSettings] = useState()
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
                setShowSettings(true)
              }}
            >
              Settings
            </Nav.Link>
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
      {showSettings ? (
        <SettingsDialog
          settings={settings}
          onHide={() => setShowSettings(false)}
          onSettings={onSettings}
        />
      ) : null}
      {showOpenURL ? (
        <OpenURLDialog onData={onData} onHide={() => setShowOpenURL(false)} />
      ) : null}
      {showOpenFile ? (
        <OpenFileDialog onGraph={onGraph} onHide={() => setShowOpenFile(false)} />
      ) : null}
    </>
  )
}
