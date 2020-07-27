import React from 'react'
import { Form, Button } from 'react-bootstrap'
import { serialize } from './util'
import saveAs from 'file-saver'
const Sidebar = React.forwardRef(
  ({ onColorChange, onPathDraw, onRedraw, color }, ref) => {
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
        <Button onClick={() => saveAs(serialize(ref.current))}>Export SVG</Button>
        <Form.Group
          onChange={event => {
            onPathDraw(event.target.checked)
          }}
        >
          <Form.Check type="checkbox" label="Draw paths" />
        </Form.Group>
        <Button onClick={onRedraw}>Redraw</Button>
      </div>
    )
  },
)
export { Sidebar }
