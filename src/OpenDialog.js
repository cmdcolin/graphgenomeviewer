import React from 'react'
import { Button, Modal } from 'react-bootstrap'

export function OpenDialog({ show, onHide, onResult }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modal title</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Contents
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}
