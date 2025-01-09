import { useRef, useState } from 'react'

import { Button, Form, Modal } from 'react-bootstrap'

export default function OpenFileDialog({
  onHide,
  onGraph,
}: {
  onHide: () => void
  onGraph: (arg: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<unknown>()
  return (
    <Modal show={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Open file</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? <div style={{ color: 'red' }}>{`${error}`}</div> : null}
        <Form
          onSubmit={event => {
            event.preventDefault()
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            ;(async () => {
              try {
                setError('')
                const data = await ref.current?.files?.[0].text()
                if (data) {
                  onGraph(data)
                  onHide()
                } else {
                  setError('Failed to read file')
                }
              } catch (error) {
                console.error(error)
                setError(error)
              }
            })()
          }}
        >
          <Form.Group>
            <Form.Label>Open file</Form.Label>
            <Form.Control ref={ref} type="file" />
          </Form.Group>
          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
