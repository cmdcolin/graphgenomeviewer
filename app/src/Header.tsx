import React, { useState } from 'react'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import SettingsDialog, { Settings } from './SettingsDialog'
import AboutDialog from './AboutDialog'
import OpenURLDialog from './OpenURLDialog'
import OpenFileDialog from './OpenFileDialog'

export default function Header({
  onData,
  settings,
  onGraph,
  onExportSVG,
  onSettings,
}: {
  onData: (arg: string) => void
  onGraph: () => void
  onExportSVG: () => void
  onSettings: () => void
  settings: Settings
}) {
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showOpenURL, setShowOpenURL] = useState(false)
  const [showOpenFile, setShowOpenFile] = useState(false)
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
            <Nav.Link onClick={() => setShowSettings(true)}>Settings</Nav.Link>
            <Nav.Link onClick={() => setShowAbout(true)}>About</Nav.Link>
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
