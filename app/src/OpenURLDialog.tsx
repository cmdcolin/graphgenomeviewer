import { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

export default function OpenURLDialog({
  onHide,
  onData,
}: {
  onHide: () => void
  onData: (arg: string) => void
}) {
  const [value, setValue] = useState<string>()
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>graphgenomeviewer</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={() => {
            if (value) {
              onData(value)
            }
            onHide()
          }}
        >
          <Form.Group>
            <Form.Label>Enter URL</Form.Label>
            <Form.Control
              type="input"
              value={value}
              onChange={event => {
                setValue(event.target.value)
              }}
            />
          </Form.Group>
          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
