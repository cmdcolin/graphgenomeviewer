import React, { useRef, useState } from 'react'
import { Button, Form, Modal, Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { SettingsDialog } from './SettingsDialog'
import pkg from '../package.json'

function AboutDialog({ onHide }) {
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>graphgenome browser {pkg.version}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          This is a small demo of browsing simple graph genomes. The app can
          read GFA format URLs and local files, all processing is done client
          side currently.
        </p>
        <p>
          Contact <a href="mainto:colin.diesh@gmail.com">Colin Diesh</a>
        </p>
        <p>
          Thanks to the BCC2020 pangenome team, and{' '}
          <a href="https://github.com/rrwick/Bandage">Bandage</a> for
          inspiration.
        </p>
        <p>
          Sample data from GFA-spec repo (MT.gfa), Andrea Guarracino (path
          example), and gfalint (Shaun Jackman)
        </p>
        <p>
          This app attempts to support GFA2 but does not properly render
          fragments, intricate edge details, or U and O paths
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

export function Header({ onData, settings, onGraph, onExportSVG, onSettings }) {
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
              <NavDropdown.Item onClick={() => onExportSVG()}>
                Export SVG
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Examples" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => onData('MT.gfa')}>
                MT GFA-spec example
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('toy_pangenome.gfa')}>
                Paths example
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('example1.gfa')}>
                Paths example 2
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('big1.gfa')}>
                Big1
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('ir1.gfa')}>
                Ir1
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() =>
                  onData('test_contig_placement_assembly_graph.gfa')
                }
              >
                Unicycler example
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('circle.gfa')}>
                Simple circle
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => onData('example1.gfa2')}>
                GFA2.0 example
              </NavDropdown.Item>
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
        <OpenFileDialog
          onGraph={onGraph}
          onHide={() => setShowOpenFile(false)}
        />
      ) : null}
    </>
  )
}
