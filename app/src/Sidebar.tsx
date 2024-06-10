import { Form, Button } from 'react-bootstrap'
import { useSnapshot } from 'valtio'

export default function Sidebar({
  store,
  onExportSVG,
  onRedraw,
}: {
  store: {
    colorScheme: string
    drawPaths: boolean
    drawLabels: boolean
  }
  onExportSVG: () => void
  onRedraw: () => void
}) {
  const snap = useSnapshot(store)
  return (
    <div id="sidebar" className="sidebar">
      <Form.Label>Color</Form.Label>
      <Form.Control
        value={snap.colorScheme}
        onChange={event => (store.colorScheme = event.target.value)}
        as="select"
      >
        <option>JustGrey</option>
        <option>Turbo</option>
        <option>Rainbow</option>
        <option>Spectral</option>
        <option>Viridis</option>
        <option>RdYlBu</option>
      </Form.Control>
      <br />
      <Form.Group>
        <Form.Check
          onChange={event => (store.drawPaths = event.target.checked)}
          type="checkbox"
          label="Draw paths"
          checked={snap.drawPaths}
        />
      </Form.Group>

      <Form.Group>
        <Form.Check
          onChange={event => (store.drawLabels = event.target.checked)}
          type="checkbox"
          label="Draw labels"
          checked={snap.drawLabels}
        />
      </Form.Group>
      <Button onClick={() => onExportSVG()}>Export SVG</Button>
      <Button style={{ marginLeft: 2 }} onClick={() => onRedraw()}>
        Redraw
      </Button>
    </div>
  )
}
