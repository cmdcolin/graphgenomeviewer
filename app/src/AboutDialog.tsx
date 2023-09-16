import React from 'react'
import { Modal } from 'react-bootstrap'
import pkg from '../package.json'

export default function AboutDialog({ onHide }: { onHide: () => void }) {
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
