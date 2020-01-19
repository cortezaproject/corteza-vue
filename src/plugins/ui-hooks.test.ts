import { expect } from 'chai'
import { UIHooks } from './ui-hooks'

describe(__filename, () => {
  it('should convert script to button', () => {
    const hooks = new UIHooks()

    hooks.Register(
      {
        name: 'scriptName',
        label: 'btnLabel',
        triggers: [{
          resourceTypes: ['system'],
          eventTypes: ['onManual'],
          weight: 42,
          ui: [
            { name: 'variant', value: 'danger' },
            { name: 'slot', value: 'header' },
          ],
        }],
      },
    )

    const bb = hooks.Find('system', 'header')

    expect(bb).to.have.lengthOf(1)
    const b = bb[0]
    expect(b).to.have.property('label').equal('btnLabel')
    expect(b).to.have.property('script').equal('scriptName')
    expect(b).to.have.property('resourceType').equal('system')
    expect(b).to.have.property('slot').equal('header')
    expect(b).to.have.property('variant').equal('danger')
  })
})
