import React, { useEffect, useMemo, useState } from 'react'
import Graph from './Graph'
import { parseGFA } from './gfa'

export default function GFAGraph(props: {
  url?: string
  data?: string
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
  const { url, data, ...rest } = props
  const [resultData, setResultData] = useState<string | undefined>(data)
  const [error, setError] = useState<unknown>()
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        if (!url) {
          return
        }
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} fetching ${url}`)
        }
        const data = await res.text()
        setResultData(data)
      } catch (error_) {
        setError(error_)
        console.error(error_)
      }
    })()
  }, [url])

  // not ideal but memo important for stability of re-rendering, otherwise restarts force sim
  const graph = useMemo(
    () => (resultData ? parseGFA(resultData) : undefined),
    [resultData],
  )

  return error ? (
    <div style={{ color: 'red' }}>{`${error}`}</div>
  ) : graph ? (
    <Graph graph={graph} {...rest} />
  ) : (
    <div>Loading...</div>
  )
}
