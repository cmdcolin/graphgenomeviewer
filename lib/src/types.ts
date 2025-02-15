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
  tags?: Record<string, unknown>
  cigar?: string
  length?: number
}
export interface Graph {
  nodes: Node[]
  links: Link[]
  paths?: Path[]
}
export interface Coord {
  x: number
  y: number
}

export type TupleCoord = [number, number]

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
