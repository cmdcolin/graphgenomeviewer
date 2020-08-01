import React from 'react'
import { Form, Button } from 'react-bootstrap'

export function Sidebar({
  onDrawLabels,
  drawLabels,
  drawPaths,
  drag,
  onDrag,
  onColorChange,
  onPathDraw,
  onRedraw,
  colorScheme,
}) {
  return (
    <div>
      <p>Settings</p>
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
          onChange={event => {
            onPathDraw(event.target.checked)
          }}
          type="checkbox"
          label="Draw paths"
          checked={drawPaths}
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          onChange={event => {
            onDrawLabels(event.target.checked)
          }}
          type="checkbox"
          label="Draw labels"
          checked={drawLabels}
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          onChange={event => {
            onDrag(event.target.checked)
          }}
          type="checkbox"
          label="Enable panning/zooming?"
          checked={drag}
        />
      </Form.Group>
      <br />
      <Button onClick={() => onRedraw()}>Redraw</Button>
    </div>
  )
}
