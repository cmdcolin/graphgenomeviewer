import { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useAppStore } from './store'

export default function SettingsDialog({ onHide }: { onHide: () => void }) {
  const store = useAppStore()
  const {
    chunkSize: storeChunkSize,
    strengthCenter,
    linkThickness,
    sequenceThickness,
    linkSteps,
  } = store
  const [chunkSize, setChunkSize] = useState(`${storeChunkSize}`)
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={event => {
            store.setChunkSize(+chunkSize)
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
                value={linkSteps}
                onChange={event => store.setLinkSteps(+event.target.value)}
              />
              Current value: {linkSteps}
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
                value={strengthCenter}
                onChange={event => store.setStrengthCenter(+event.target.value)}
              />
              Current value: {strengthCenter}
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
                value={sequenceThickness}
                onChange={event =>
                  (store.sequenceThickness = +event.target.value)
                }
              />
              Current value: {sequenceThickness}px
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
                value={linkThickness}
                onChange={event => (store.linkThickness = +event.target.value)}
              />
              Current value: {linkThickness}px
            </Col>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
