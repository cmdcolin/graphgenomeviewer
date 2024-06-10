import { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSnapshot } from 'valtio'

export default function SettingsDialog({
  store,
  onHide,
}: {
  store: {
    chunkSize: number
    linkSteps: number
    strengthCenter: number
    dataset: string
    theta: number
    linkThickness: number
    sequenceThickness: number
  }
  onHide: () => void
}) {
  const snap = useSnapshot(store)
  const [chunkSize, setChunkSize] = useState(`${snap.chunkSize}`)
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={event => {
            store.chunkSize = +chunkSize
            event.preventDefault()
            onHide()
          }}
        >
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Number of simulation steps for the links
              <br />
              <Form.Text muted>
                Increases the rigidity of the simulation, higher numbers e.g. 10
                makes things much less floppy
              </Form.Text>
            </Form.Label>
            <Col>
              <input
                type="range"
                min={1}
                max={20}
                style={{ width: '100%' }}
                value={snap.linkSteps}
                onChange={event => (store.linkSteps = +event.target.value)}
              />
              Current value: {snap.linkSteps}
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence chunk size
              <br />
              <Form.Text muted>
                If a contig is of length 5000, then chunk length 1000 would
                become 5 segments. Note: contigs smaller than the chunk length
                may be less proportionally sized (they do not get spaghettified)
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                value={chunkSize}
                onChange={event => setChunkSize(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Strength (particle charge)
              <br />
              <Form.Text muted>
                Akin to charged particle force, a large negative number
                increases the repulsive force
              </Form.Text>
            </Form.Label>
            <Col>
              <input
                type="range"
                min={-100}
                max={-1}
                style={{ width: '100%' }}
                value={snap.strengthCenter}
                onChange={event => (store.strengthCenter = +event.target.value)}
              />
              Current value: {snap.strengthCenter}
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence thickness
              <br />
              <Form.Text muted>
                Visual thickness in px for the sequence chunks
              </Form.Text>
            </Form.Label>
            <Col>
              <input
                type="range"
                min={1}
                max={20}
                style={{ width: '100%' }}
                value={snap.sequenceThickness}
                onChange={event =>
                  (store.sequenceThickness = +event.target.value)
                }
              />
              Current value: {snap.sequenceThickness}px
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Link thickness
              <br />
              <Form.Text muted>Visual thickness in px for the links</Form.Text>
            </Form.Label>
            <Col>
              <input
                type="range"
                min={1}
                max={20}
                style={{ width: '100%' }}
                value={snap.linkThickness}
                onChange={event => (store.linkThickness = +event.target.value)}
              />
              Current value: {snap.linkThickness}px
            </Col>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
