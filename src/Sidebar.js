import React from 'react'
import { Form, Button } from 'react-bootstrap'

export function Sidebar({ onColorChange, onPathDraw, onRedraw, color }) {
  return (
    <div>
      <p>Settings</p>
      <Form.Label>Color</Form.Label>
      <Form.Control
        value={color}
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
      <Form.Group
        onChange={event => {
          onPathDraw(event.target.checked)
        }}
      >
        <Form.Check type="checkbox" label="Draw paths" />
      </Form.Group>
      <br />
      <Button onClick={() => onRedraw()}>Redraw</Button>
    </div>
  )
}
