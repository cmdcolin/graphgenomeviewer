// simple handcoded GFA parser
export function parseGFA(file) {
  const graph = { nodes: [], links: [], paths: [] }
  for (const line of file.split('\n')) {
    if (line.startsWith('S')) {
      const [, name, sequence, ...rest] = line.split('\t')
      const tags = {}
      for (let i = 0; i < rest.length; i++) {
        const [name, type, val] = rest[i].split(':')
        if (type === 'i') {
          tags[name] = +val
        } else if (type === 'Z') {
          tags[name] = val
        }
      }
      graph.nodes.push({ id: name, sequence, tags })
    } else if (line.startsWith('L')) {
      const [, source, strand1, target, strand2, cigar, ...rest] = line.split('\t')
      const tags = {}
      for (let i = 0; i < rest.length; i++) {
        const [name, type, val] = rest[i].split(':')
        if (type === 'i') {
          tags[name] = +val
        } else if (type === 'Z') {
          tags[name] = val
        }
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
