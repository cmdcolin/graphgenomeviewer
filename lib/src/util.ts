// Given a GFA graph with sequence nodes ('S' tags), it breaks the S tags into
// multiple nodes depending on how long the sequence is, which gives the graph
// an organic look when the layout algorithm is applied
export interface Path {
  name: string
  path: string
}
export interface Node {
  id: string
  sequence?: string
  length?: number
}
export interface Graph {
  nodes: Node[]
  links: Link[]
  paths?: Path[]
  id: string
}
export interface Coord {
  x: number
  y: number
}

export interface Link {
  strand1?: string
  strand2?: string
  linkNum?: number
  length?: number
  source: string
  loop?: boolean
  sequence?: string
  paths?: string[]
  id?: string
  target: string
}
export function reprocessGraph(G: Graph, chunkSize: number) {
  console.log({ G, chunkSize })
  const Gp = { nodes: [] as Node[], links: [] as Link[] }

  const seen = {} as Record<string, string[]>
  if (G.paths) {
    for (const path of G.paths) {
      const pathNodes = path.path.split(',')
      for (let j = 0; j < pathNodes.length - 1; j++) {
        const curr = `${pathNodes[j]}_${pathNodes[j + 1]}`
        if (seen[curr]) {
          seen[curr].push(path.name)
        } else {
          seen[curr] = [path.name]
        }
      }
    }
  }

  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, length, ...rest } = G.nodes[i]
    const nodes = [] as Node[]

    // break long sequence into multiple nodes, for organic layout
    if (length) {
      nodes.push({ ...rest, id: `${id}-start` })
      for (let i = chunkSize; i < length - chunkSize; i += chunkSize) {
        nodes.push({ ...rest, id: `${id}-${i}` })
      }
      nodes.push({ ...rest, id: `${id}-end` })
    }

    // recreate links
    for (let j = 0; j < nodes.length - 1; j++) {
      const source = nodes[j].id
      const target = nodes[j + 1].id
      Gp.links.push({
        ...rest,
        source,
        target,
        id,
        length,
        sequence,
        linkNum: i,
      })
    }
    Gp.nodes = [...Gp.nodes, ...nodes]
  }

  for (const { strand1, strand2, source, target, ...rest } of G.links) {
    const paths = seen[`${source}${strand1}_${target}${strand2}`] || []
    const loop = source === target

    // enumerates cases for which end of source connects to
    // which end of the target
    Gp.links.push({
      source: `${source}-${strand1 === '+' ? 'end' : 'start'}`,
      target: `${target}-${strand2 === '+' ? 'start' : 'end'}`,
      loop,
      paths: paths.length > 0 ? paths : undefined,
      ...rest,
    })
  }

  return Gp
}

export function groupBy<T>(
  array: T[],
  predicate: (v: T) => string | undefined,
) {
  const result = {} as Record<string, T[]>
  for (const value of array) {
    const p = predicate(value)
    if (!p) {
      continue
    }
    const entry = (result[p] ||= [])
    entry.push(value)
  }
  return result
}

export interface Edge {
  linkNum: number
  source: Coord
  target: Coord
}
// connects successive start->end to a path
// param edges: {source:{x,y}, target:{x,y}}[]
function makePath(edges: Edge[]) {
  const path = [] as [number, number][]
  let i = 0
  for (; i < edges.length; i++) {
    const st = edges[i]
    path.push([st.source.x, st.source.y])
  }
  const last = edges[i - 1]
  path.push([last.target.x, last.target.y])
  return path
}

// groups the edges data structure by the linkNum attribute
export function generatePaths(edges: Edge[], graph: Record<string, unknown>) {
  const ret2 = groupBy(edges, e =>
    e.linkNum === undefined ? undefined : `${e.linkNum}`,
  )
  return Object.entries(ret2).map(([key, value]) => ({
    links: makePath(value),
    original: graph[key],
  }))
}

// implements this algorithm to project a point "forwards" from a given contig
// node translation of simple vector math here
// https://math.stackexchange.com/questions/175896
export function projectLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dt: number,
) {
  const d = Math.hypot(y2 - y1, x2 - x1)
  const vx = (x2 - x1) / d
  const vy = (y2 - y1) / d
  return [x2 + dt * vx, y2 + dt * vy]
}

export function generateLinks(links: Link[]) {
  const newlinks = [] as {
    pathId?: string
    pathIndex?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }[]
  const pathIds = [] as string[]
  for (const { paths, ...rest } of links) {
    if (paths) {
      for (const pathId of paths) {
        let pathIndex = pathIds.indexOf(pathId)
        if (pathIndex === -1) {
          pathIds.push(pathId)
          pathIndex = pathIds.length - 1
        }
        newlinks.push({ ...rest, pathId, pathIndex })
      }
    } else {
      newlinks.push(rest)
    }
  }
  return newlinks
}
