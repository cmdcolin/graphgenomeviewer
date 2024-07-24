import { Form, Button } from 'react-bootstrap'
import { useAppStore } from './store'

export default function Sidebar({
  onExportSVG,
  onRedraw,
}: {
  onExportSVG: () => void
  onRedraw: () => void
}) {
  const store = useAppStore()
  const { drawPaths, drawLabels, colorScheme, drawNodeHandles } = store
  return (
    <div id="sidebar" className="sidebar">
      <Form.Label>Color</Form.Label>
      <Form.Control
        value={colorScheme}
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
          onChange={event => store.setDrawPaths(event.target.checked)}
          type="checkbox"
          label="Draw paths"
          checked={drawPaths}
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          onChange={event => store.setDrawNodeHandles(event.target.checked)}
          type="checkbox"
          label="Draw node handles"
          checked={drawNodeHandles}
        />
      </Form.Group>

      <Form.Group>
        <Form.Check
          onChange={event => store.setDrawLabels(event.target.checked)}
          type="checkbox"
          label="Draw labels"
          checked={drawLabels}
        />
      </Form.Group>
      <Button onClick={() => onExportSVG()}>Export SVG</Button>
      <Button style={{ marginLeft: 2 }} onClick={() => onRedraw()}>
        Redraw
      </Button>
    </div>
  )
}
