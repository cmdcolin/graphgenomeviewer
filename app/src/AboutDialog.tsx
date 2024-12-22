import { Modal } from 'react-bootstrap'

export default function AboutDialog({ onHide }: { onHide: () => void }) {
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>graphgenomeviewer</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          This is a small demo of browsing simple graph genomes. The app can
          read GFA (primarily v1) format URLs and local files, all processing is
          done client side currently.
        </p>

        <a href="https://github.com/cmdcolin/graphgenomeviewer">GitHub</a>
      </Modal.Body>
    </Modal>
  )
}
