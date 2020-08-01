import { parseGFA } from './util'
import * as fs from 'fs'
test('parses a GFA file', () => {
  const files = ['public/example1.gfa2']
  files.forEach(filename => {
    const contents = fs.readFileSync(filename, 'utf8')
    expect(parseGFA(contents)).toMatchSnapshot()
  })
})
