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
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={event => {
            event.preventDefault()
            onHide()
          }}
        >
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Number of simulation steps for the links
              <Form.Text muted>
                Increases the rigidity of the link based constraints. May be
                helpful for circular contigs to increase
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={snap.linkSteps}
                onChange={event => (store.linkSteps = +event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence chunk size
              <Form.Text muted>
                If a contig is of length 5000, then chunk length 1000 would
                become 5 segments. Note that contigs smaller than the chunk
                length may not be proportionally sized
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={snap.chunkSize}
                onChange={event => (store.chunkSize = +event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Theta
              <Form.Text muted>
                Parameter for the force directed layout
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={snap.theta}
                onChange={event => (store.theta = +event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Strength (particle charge)
              <Form.Text muted>
                This value is like a charged particle force, by being negative
                it keeps things farther apart
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={snap.strengthCenter}
                onChange={event => (store.strengthCenter = +event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence thickness
            </Form.Label>
            <Col>
              <input
                type="range"
                min={1}
                max={100}
                style={{ width: '100%' }}
                value={snap.sequenceThickness}
                onChange={event =>
                  (store.sequenceThickness = +event.target.value)
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Link thickness
            </Form.Label>
            <Col>
              <input
                type="range"
                min={1}
                max={100}
                style={{ width: '100%' }}
                value={snap.linkThickness}
                onChange={event => (store.linkThickness = +event.target.value)}
              />
            </Col>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
