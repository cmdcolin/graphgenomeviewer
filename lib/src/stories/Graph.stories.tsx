import Graph from '../../dist/Graph'

function BasicExample() {
  // return <div>Hello</div>
  return (
    <Graph
      graph={{
        id: 'wow',
        nodes: [{ id: 'id1' }, { id: 'id2' }],
        links: [{ source: 'id1', target: 'id2', id: 'edge1' }],
      }}
    />
  )
}

export { BasicExample }

export default { title: 'Source code for examples' }
