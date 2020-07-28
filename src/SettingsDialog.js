import React, { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'

export function SettingsDialog({ onHide, settings: paramSettings, onSettings }) {
  const [settings, setSettings] = useState(paramSettings)
  const {
    chunkSize,
    forceSteps,
    linkSteps,
    strength,
    theta,
    sequenceThickness,
    linkThickness,
  } = settings
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={event => {
            event.preventDefault()
            onSettings({
              ...settings,
              chunkSize: +chunkSize,
              forceSteps: +forceSteps,
              linkSteps: +linkSteps,
              strength: +strength,
              theta: +theta,
              sequenceThickness: +sequenceThickness,
              linkThickness: +linkThickness,
            })
            onHide()
          }}
        >
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Number of simulation steps for the nodes
              <Form.Text muted>Used in the force-based layout simulation</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={forceSteps}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    forceSteps: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Number of simulation steps for the links
              <Form.Text muted>Used in the force-based layout simulation</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={linkSteps}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    linkSteps: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Sequence chunk size
              <Form.Text muted>
                If a contig is of length 5000, then chunk length 1000 would become 5
                segments. Note that contigs smaller than the chunk length may not be
                proportionally sized
              </Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={chunkSize}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    chunkSize: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Theta
              <Form.Text muted>Parameter for the force directed layout</Form.Text>
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={theta}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    theta: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Strength
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={strength}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    strength: val,
                  }))
                }}
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
                value={sequenceThickness}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    sequenceThickness: val,
                  }))
                }}
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
                value={linkThickness}
                onChange={event => {
                  const val = event.target.value
                  setSettings(settings => ({
                    ...settings,
                    linkThickness: val,
                  }))
                }}
              />
            </Col>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
