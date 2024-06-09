import React from 'react'
import { Form, Button } from 'react-bootstrap'

export default function Sidebar({
  colorScheme,
  drawLabels,
  drawPaths,
  onDrawLabels,
  onColorChange,
  onPathDraw,
  onRedraw,
  onExportSVG,
}: {
  drawLabels: boolean
  drawPaths: boolean
  colorScheme: string
  onDrawLabels: (arg: boolean) => void
  onColorChange: (arg: string) => void
  onPathDraw: (arg: boolean) => void
  onRedraw: () => void
  onExportSVG: () => void
}) {
  return (
    <div>
      <Form.Label>Color</Form.Label>
      <Form.Control
        value={colorScheme}
        onChange={event => onColorChange(event.target.value)}
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
          onChange={event => onPathDraw(event.target.checked)}
          type="checkbox"
          label="Draw paths"
          checked={drawPaths}
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          onChange={event => onDrawLabels(event.target.checked)}
          type="checkbox"
          label="Draw labels"
          checked={drawLabels}
        />
      </Form.Group>
      <Button onClick={() => onRedraw()}>Redraw</Button>
      <Button onClick={() => onExportSVG()}>Export SVG</Button>
    </div>
  )
}
