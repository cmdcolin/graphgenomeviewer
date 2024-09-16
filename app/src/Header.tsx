import { useState } from 'react'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'

// locals
import SettingsDialog from './SettingsDialog'
import AboutDialog from './AboutDialog'
import OpenURLDialog from './OpenURLDialog'
import OpenFileDialog from './OpenFileDialog'
import { useAppStore } from './store'

export default function Header({ onExportSVG }: { onExportSVG: () => void }) {
  const store = useAppStore()
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showOpenURL, setShowOpenURL] = useState(false)
  const [showOpenFile, setShowOpenFile] = useState(false)
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">graphgenomeviewer</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="File" id="basic-nav-dropdown">
              <NavDropdown.Item
                onClick={() => {
                  setShowOpenURL(true)
                }}
              >
                Open URL
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  setShowOpenFile(true)
                }}
              >
                Open file
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  onExportSVG()
                }}
              >
                Export SVG
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Examples" id="basic-nav-dropdown">
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('MT.gfa')
                }}
              >
                MT GFA-spec example
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('toy_pangenome.gfa')
                }}
              >
                Paths example
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('example1.gfa')
                }}
              >
                Paths example 2
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('big1.gfa')
                }}
              >
                Big1
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('ir1.gfa')
                }}
              >
                Ir1
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('test_contig_placement_assembly_graph.gfa')
                }}
              >
                Unicycler example
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('circle.gfa')
                }}
              >
                Simple circle
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  store.setDataset('example1.gfa2')
                }}
              >
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
      {showAbout ? (
        <AboutDialog
          onHide={() => {
            setShowAbout(false)
          }}
        />
      ) : null}
      {showSettings ? (
        <SettingsDialog
          onHide={() => {
            setShowSettings(false)
          }}
        />
      ) : null}
      {showOpenURL ? (
        <OpenURLDialog
          onData={() => {}}
          onHide={() => {
            setShowOpenURL(false)
          }}
        />
      ) : null}
      {showOpenFile ? (
        <OpenFileDialog
          onGraph={() => {}}
          onHide={() => {
            setShowOpenFile(false)
          }}
        />
      ) : null}
    </>
  )
}
