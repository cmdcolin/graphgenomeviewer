import React from 'react'
import { Button, Modal } from 'react-bootstrap'

export default function FeatureDialog({
  data,
  onHide,
}: {
  data: Record<string, string>
  onHide: () => void
}) {
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Feature details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div>Attributes</div>
        {Object.entries(data)
          .filter(
            entry =>
              !['source', 'target', 'linkNum', 'tags'].includes(entry[0]),
          )
          .map(([key, value]) => (
            <div
              key={`${key}_${value}`}
              style={{ display: 'flex', maxHeight: 150, margin: 3 }}
            >
              <div style={{ backgroundColor: '#dda', minWidth: 100 }}>
                {key}
              </div>
              <div style={{ wordBreak: 'break-word', overflow: 'auto' }}>
                {String(value)}
              </div>
            </div>
          ))}
        <hr />
        {data.tags && Object.keys(data.tags).length > 0 ? (
          <>
            <div>Tags</div>
            {Object.entries(data.tags).map(([key, value]) => (
              <div
                key={`${key}_${value}`}
                style={{ display: 'flex', maxHeight: 150, margin: 3 }}
              >
                <div style={{ backgroundColor: '#dda', minWidth: 100 }}>
                  {key}
                </div>
                <div style={{ wordBreak: 'break-word', overflow: 'auto' }}>
                  {String(value)}
                </div>
              </div>
            ))}
          </>
        ) : null}

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}
