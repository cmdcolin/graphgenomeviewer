import React, { useState, useRef } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Graph } from './Graph'
import { saveAs } from 'file-saver'
import { serialize } from './util'

export function GraphContainer(props) {
  const [color, setColor] = useState('Rainbow')
  const [path, setPath] = useState('Edge')
  const ref = useRef()
  return (
    <div>
      <Form.Group>
        <Form.Control
          value={color}
          onChange={event => setColor(event.target.value)}
          as="select"
        >
          <option>JustGrey</option>
          <option>Turbo</option>
          <option>Rainbow</option>
          <option>Spectral</option>
          <option>Viridis</option>
          <option>RdYlBu</option>
        </Form.Control>
        <Form.Control
          value={path}
          onChange={event => setPath(event.target.value)}
          as="select"
        >
          <option>Edge</option>
          <option>Node</option>
          <option>Edge+node</option>
          <option>None</option>
        </Form.Control>
        <Button onClick={() => saveAs(serialize(ref.current))}>Export SVG</Button>
      </Form.Group>
      <Graph ref={ref} {...props} color={color} path={path} />
    </div>
  )
}
