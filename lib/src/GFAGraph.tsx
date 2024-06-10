import React, { useEffect, useState } from 'react'
import Graph from './Graph'
import { parseGFA } from './gfa'

export default function GFAGraph(props: {
  url: string
  drawPaths?: boolean
  drawLabels?: boolean
  colorScheme?: string
  width?: number
  height?: number
  chunkSize?: number
  linkSteps?: number
  sequenceThickness?: number
  linkThickness?: number
  theta?: number
  strengthCenter?: number
  onFeatureClick?: (arg?: Record<string, unknown>) => void
}) {
  const { url, ...rest } = props
  const [data, setData] = useState<string>()
  const [error, setError] = useState<unknown>()
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} fetching ${url}`)
        }
        const data = await res.text()
        setData(data)
      } catch (e) {
        setError(e)
      }
    })()
  }, [url])

  return error ? (
    <div style={{ color: 'red' }}>{`${error}`}</div>
  ) : data ? (
    <Graph graph={parseGFA(data)} {...rest} />
  ) : (
    <div>Loading...</div>
  )
}
