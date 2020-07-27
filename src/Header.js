import React, { useRef, useState } from 'react'
import { Button, Col, Form, Modal, Navbar, Nav, NavDropdown, Row } from 'react-bootstrap'

function SettingsDialog({ onHide, settings: paramSettings, onSettings }) {
  const [settings, setSettings] = useState(paramSettings)
  const {
    chunkSize,
    forceSteps,
    linkSteps,
    strength,
    theta,
    sequenceThickness,
    linkThickness,
  } = settings
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
              forceSteps: +forceSteps,
              linkSteps: +linkSteps,
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
              Number of simulation steps for the nodes
              <Form.Text muted>Used in the force-based layout simulation</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={forceSteps}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    forceSteps: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Number of simulation steps for the links
              <Form.Text muted>Used in the force-based layout simulation</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={linkSteps}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    linkSteps: val,
                  }))
                }}
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
                type="number"
                value={chunkSize}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    chunkSize: val,
                  }))
                }}
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
                type="number"
                value={theta}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    theta: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Strength
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={strength}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    strength: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence thickness
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={sequenceThickness}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    sequenceThickness: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Link thickness
            </Form.Label>
            <Col>
              <Form.Control
                type="input"
                value={linkThickness}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    linkThickness: val,
                  }))
                }}
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
