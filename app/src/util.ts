// adapted from https://observablehq.com/@mbostock/saving-svg
export function serialize(svgPre: SVGSVGElement) {
  const xmlns = 'http://www.w3.org/2000/xmlns/'
  const xlinkns = 'http://www.w3.org/1999/xlink'
  const svgns = 'http://www.w3.org/2000/svg'

  const svg = svgPre.cloneNode(true) as SVGSVGElement
  const fragment = `${window.location.href}#`
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null)
  while (walker.nextNode()) {
    // @ts-expect-error
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

function parseTag(tag: string, tags: Record<string, string | number>) {
  const [name, type, val] = tag.split(':')
  if (type === 'i') {
    tags[name] = +val
  } else if (type === 'Z') {
    tags[name] = val
  }
}

export function parseGFA(file: string) {
  const graph = {
    nodes: [] as {
      id: string
      length: number
      sequence: string
      tags: Record<string, string | number>
    }[],
    links: [] as {
      source: string
      target: string
      strand1?: string
      strand2?: string
      cigar: string
      tags: Record<string, string>
    }[],
    paths: [] as {
      name: string
      path: string
      rest: string[]
    }[],
    header: [] as Record<string, string | number>[],
    id: '',
  }
  for (const line of file.split('\n')) {
    if (line.startsWith('H')) {
      const headerLine = {} as Record<string, string | number>
      const [, ...rest] = line.split('\t')
      for (const tag of rest) {
        parseTag(tag, headerLine)
      }
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
      const tags = {} as Record<string, string | number>
      for (let i = 0; i < tagfields.length; i++) {
        parseTag(rest[i], tags)
      }
      if (gfa1 && tags.LN) {
        len = +tags.LN
      }
      graph.nodes.push({ id: name, length: len, sequence: seq, tags })
    } else if (line.startsWith('E')) {
      // eslint-disable-next-line no-unused-vars,unicorn/no-unreadable-array-destructuring
      const [, , source, target, , , , , cigar, ...rest] = line.split('\t')
      const source1 = source.slice(0, -1)
      const target1 = target.slice(0, -1)
      const strand1 = source.at(-1)
      const strand2 = source.at(-1)
      const tags = {}
      for (const element of rest) {
        parseTag(element, tags)
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
      const [, source, strand1, target, strand2, cigar, ...rest] =
        line.split('\t')
      const tags = {}
      for (const element of rest) {
        parseTag(element, tags)
      }
      graph.links.push({ source, target, strand1, strand2, cigar, tags })
    } else if (line.startsWith('P')) {
      const [, name, path, ...rest] = line.split('\t')

      graph.paths.push({ name, path, rest })
    }
  }
  return graph
}
