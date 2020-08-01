function parseTag(tag, tags) {
  const [name, type, val] = tag.split(':')
  if (type === 'i') {
    tags[name] = +val
  } else if (type === 'Z') {
    tags[name] = val
  }
}

export function parseGFA(file) {
  const graph = { nodes: [], links: [], paths: [], header: [] }
  for (const line of file.split('\n')) {
    if (line.startsWith('H')) {
      const headerLine = {}
      const [, ...rest] = line.split('\t')
      rest.forEach(tag => parseTag(tag, headerLine))
      graph.header.push(headerLine)
    }
    if (line.startsWith('S')) {
      const [, name, ...rest] = line.split('\t')
      let len = 0
      let seq = ''
      let tagfields
      let gfa1 = false
      if (+rest[0]) {
        len = +rest[0]
        seq = rest[1]
        tagfields = rest.slice(2)
      } else {
        gfa1 = true
        seq = rest[0]
        len = seq.length
        tagfields = rest.slice(1)
      }
      const tags = {}
      for (let i = 0; i < tagfields.length; i++) {
        parseTag(rest[i], tags)
      }
      if (gfa1 && tags.LN) {
        len = tags.LN
      }
      graph.nodes.push({ id: name, length: len, sequence: seq, tags })
    } else if (line.startsWith('E')) {
      // eslint-disable-next-line no-unused-vars
      const [, edgeId, source, target, s1, e1, b2, e2, cigar, ...rest] = line.split('\t')
      const source1 = source.slice(0, -1)
      const target1 = target.slice(0, -1)
      const strand1 = source.charAt(source.length - 1)
      const strand2 = source.charAt(target.length - 1)
      const tags = {}
      for (let i = 0; i < rest.length; i++) {
        parseTag(rest[i], tags)
      }

      graph.links.push({
        source: source1,
        target: target1,
        strand1,
        strand2,
        cigar,
        tags,
      })
    } else if (line.startsWith('L')) {
      const [, source, strand1, target, strand2, cigar, ...rest] = line.split('\t')
      const tags = {}
      for (let i = 0; i < rest.length; i++) {
        parseTag(rest[i], tags)
      }
      graph.links.push({ source, target, strand1, strand2, cigar, tags })
    } else if (line.startsWith('P')) {
      const [, name, path, ...rest] = line.split('\t')

      graph.paths.push({ name, path, rest })
    }
  }
  return graph
}
// adapted from https://observablehq.com/@mbostock/saving-svg
export function serialize(svg) {
  const xmlns = 'http://www.w3.org/2000/xmlns/'
  const xlinkns = 'http://www.w3.org/1999/xlink'
  const svgns = 'http://www.w3.org/2000/svg'

  svg = svg.cloneNode(true)
  const fragment = `${window.location.href}#`
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null, false)
  while (walker.nextNode()) {
    for (const attr of walker.currentNode.attributes) {
      if (attr.value.includes(fragment)) {
        attr.value = attr.value.replace(fragment, '#')
      }
    }
  }
  svg.setAttributeNS(xmlns, 'xmlns', svgns)
  svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns)
  const serializer = new window.XMLSerializer()
  const string = serializer.serializeToString(svg)
  return new Blob([string], { type: 'image/svg+xml' })
}

// Given a GFA graph with sequence nodes ('S' tags), it breaks the S tags into
// multiple nodes depending on how long the sequence is, which gives the graph
// an organic look when the layout algorithm is applied
export function reprocessGraph(G, chunkSize) {
  const Gp = { nodes: [], links: [] }

  const seen = {}
  for (let i = 0; i < (G.paths || {}).length; i++) {
    const path = G.paths[i]
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

  for (let i = 0; i < G.nodes.length; i++) {
    const { id, sequence, length, ...rest } = G.nodes[i]
    const nodes = []

    // break long sequence into multiple nodes, for organic layout
    nodes.push({ ...rest, id: `${id}-start` })
    for (let i = chunkSize; i < length - chunkSize; i += chunkSize) {
      nodes.push({ ...rest, id: `${id}-${i}` })
    }
    nodes.push({ ...rest, id: `${id}-end` })

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
  for (let i = 0; i < G.links.length; i++) {
    const { strand1, strand2, source, target, ...rest } = G.links[i]
    const paths = seen[`${source}${strand1}_${target}${strand2}`] || []
    const loop = source === target

    // enumerates cases for which end of source connects to
    // which end of the target
    const link = {
      source: `${source}-${strand1 === '+' ? 'end' : 'start'}`,
      target: `${target}-${strand2 === '+' ? 'start' : 'end'}`,
      ...rest,
    }
    if (loop) {
      link.loop = true
    }
    if (paths.length) {
      link.paths = paths
    }
    Gp.links.push(link)
  }
  return Gp
}

// source https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
// returns an array that contains groupings of xs by attribute key
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

// connects successive start->end to a path
// param edges: {source:{x,y}, target:{x,y}}[]
function makePath(edges) {
  const path = []
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
export function generatePaths(edges, graph) {
  const ret = groupByArray(edges, 'linkNum')
  return ret.map(entry => ({
    links: makePath(entry.values),
    original: graph[entry.key],
  }))
}

export function generateEdges(links, graph) {
  const result = []
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

// implements this algorithm to project
// a point "forwards" from a given contig node
// translation of simple vector math here
// https://math.stackexchange.com/questions/175896
export function projectLine(x1, y1, x2, y2, dt) {
  const d = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
  const vx = (x2 - x1) / d
  const vy = (y2 - y1) / d
  return [x2 + dt * vx, y2 + dt * vy]
}
