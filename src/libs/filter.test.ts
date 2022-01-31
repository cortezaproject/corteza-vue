import { expect } from 'chai'
import { Assert } from './filter'

describe(__filename, () => {
  it('regular query', () => {
    expect(Assert({ k: 'csz' }, 'cs', 'k')).to.be.true
  })

  it('query with diacritics', () => {
    expect(Assert({ k: 'čšž' }, 'čš', 'k')).to.be.true
  })

  it('query without diacritics', () => {
    expect(Assert({ k: 'čšž' }, 'cs', 'k')).to.be.true
  })
})
