import React from 'react'
import { Button, Modal } from 'react-bootstrap'

export function FeatureDialog({ show, data, onHide }) {
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Feature details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {Object.entries(data)
          .filter(entry => !['source', 'target', 'linkNum'].includes(entry[0]))
          .map(([key, value]) => (
            <div key={`${key}_${value}`} style={{ display: 'flex', margin: 3 }}>
              <div style={{ backgroundColor: '#dda', minWidth: 100 }}>{key}</div>
              <div style={{ wordBreak: 'break-word' }}>{value}</div>
            </div>
          ))}
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}
