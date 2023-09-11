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
  linkNum: number
  length?: number
  source: string
  loop?: boolean
  sequence?: string
  paths?: string[]
  id: string
  target: string
}
export function reprocessGraph(G: Graph, chunkSize: number) {
  const Gp = { nodes: [] as Node[], links: [] as Link[] }

  const seen = {} as Record<string, string[]>
  if (G.paths) {
    for (const path of G.paths) {
      const pathNodes = path.path.split(',')
      for (let j = 0; j < pathNodes.length - 1; j++) {
        const curr = `${pathNodes[j]}_${pathNodes[j + 1]}`
        if (!seen[curr]) {
          seen[curr] = [path.name]
        } else {
          seen[curr].push(path.name)
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
    Gp.nodes = Gp.nodes.concat(nodes)
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
      paths: paths.length ? paths : undefined,
      ...rest,
    })
  }

  return Gp
}

// source https://stackoverflow.com/questions/14446511/ returns an array that
// contains groupings of xs by attribute key
function groupByArray(xs, key) {
  return xs.reduce(function (rv, x) {
    const v = key instanceof Function ? key(x) : x[key]
    if (v !== undefined) {
      const el = rv.find(r => r && r.key === v)
      if (el) {
        el.values.push(x)
      } else {
        rv.push({ key: v, values: [x] })
      }
    }
    return rv
  }, [])
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
  const ret = groupByArray(edges, 'linkNum')
  return ret.map(entry => ({
    links: makePath(entry.values),
    original: graph[entry.key],
  }))
}

type Coord2 = [number, number]

export function generateLinks(links: Edge[], graph: Graph[]) {
  const result = [] as {
    links: [Coord2, Coord2]
    original: { id: string }
  }[]
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const original = graph[i]
    if (!original.id) {
      result.push({
        links: [
          [link.source.x, link.source.y],
          [link.target.x, link.target.y],
        ],
        original,
      })
    }
  }
  return result
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
  const d = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
  const vx = (x2 - x1) / d
  const vy = (y2 - y1) / d
  return [x2 + dt * vx, y2 + dt * vy]
}
