import { expect } from 'chai'
import { UIHooks } from './ui-hooks'

describe(__filename, () => {
  it('should convert script to button', () => {
    const hooks = new UIHooks('test')

    hooks.Register(
      {
        name: 'scriptName',
        label: 'btnLabel',
        triggers: [{
          resourceTypes: ['system'],
          eventTypes: ['onManual'],
          weight: 42,
          constraints: [],
          uiProps: [
            { name: 'variant', value: 'danger' },
            { name: 'app', value: 'test' },
            { name: 'page', value: 'index' },
            { name: 'slot', value: 'header' },
          ],
        }],
      },
    )

    const buttons = hooks.Find('system', 'index', 'header')

    expect(buttons).to.have.lengthOf(1)
    const button = buttons[0]
    expect(button).to.have.property('label').equal('btnLabel')
    expect(button).to.have.property('script').equal('scriptName')
    expect(button).to.have.property('resourceType').equal('system')
    expect(button).to.have.property('slot').equal('header')
    expect(button).to.have.property('variant').equal('danger')
  })

  it('should remove existing scripts', () => {
    const hooks = new UIHooks('test')
    const script = {
      name: 'scriptName',
      label: 'btnLabel',
      triggers: [{
        resourceTypes: ['system'],
        eventTypes: ['onManual'],
        constraints: [],
        uiProps: [
          { name: 'app', value: 'test' },
          { name: 'page', value: 'index' },
          { name: 'slot', value: 'header' },
        ],
      }],
    }

    let buttons

    hooks.Register(script)
    buttons = hooks.Find('system', 'index', 'header')
    expect(buttons).to.have.lengthOf(1)
    hooks.Register(script)
    buttons = hooks.Find('system', 'index', 'header')
    expect(buttons).to.have.lengthOf(1)
    hooks.Register(script, { ...script, name: 'anotherScript' })
    buttons = hooks.Find('system', 'index', 'header')
    expect(buttons).to.have.lengthOf(2)
    hooks.Register(script)
    buttons = hooks.Find('system', 'index', 'header')
    expect(buttons).to.have.lengthOf(2)
  })
})
