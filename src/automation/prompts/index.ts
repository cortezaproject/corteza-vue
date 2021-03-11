import { automation } from '@cortezaproject/corteza-js'

export const prompts = Object.freeze([
  new automation.Function({
    ref: 'alert',
    kind: 'prompt',
    meta: { short: 'Prompt user with an alert' },
    parameters: [
      new automation.Param({ name: 'title', types: ['String'] }),
      new automation.Param({ name: 'message', types: ['String'], required: true }),
      new automation.Param({ name: 'buttonLabel', types: ['String'] }),
      new automation.Param({ name: 'buttonValue', types: ['Any'] }),
    ],
  }),
  new automation.Function({
    ref: 'choice',
    kind: 'prompt',
    meta: { short: 'Prompt user with  choice' },
    parameters: [
      new automation.Param({ name: 'title', types: ['String'] }),
      new automation.Param({ name: 'message', types: ['String'], required: true }),
      new automation.Param({ name: 'confirmButtonLabel', types: ['String'] }),
      new automation.Param({ name: 'confirmButtonValue', types: ['Any'] }),
      new automation.Param({ name: 'rejectButtonLabel', types: ['String'] }),
      new automation.Param({ name: 'rejectButtonValue', types: ['Any'] }),
    ],
    results: [
      new automation.Param({ name: 'value', types: ['Any'] }),
    ],
  }),
  new automation.Function({
    ref: 'input',
    kind: 'prompt',
    meta: { short: 'Prompt user with a single input' },
    parameters: [
      new automation.Param({ name: 'title', types: ['String'] }),
      new automation.Param({ name: 'message', types: ['String'], required: true }),
      new automation.Param({ name: 'label', types: ['String'] }),
      new automation.Param({
        name: 'type',
        types: ['String'],
        meta: {
          visual: {
            options: ['text', 'number', 'email', 'password', 'search', 'date', 'time'],
          },
        },
      }),
      new automation.Param({ name: 'inputValue', types: ['String'] }),
    ],
    results: [
      new automation.Param({ name: 'value', types: ['Any'] }),
    ],
  }),
  new automation.Function({
    ref: 'options',
    kind: 'prompt',
    meta: { short: 'Prompt user with options' },
    parameters: [
      new automation.Param({ name: 'title', types: ['String'] }),
      new automation.Param({ name: 'message', types: ['String'], required: true }),
      new automation.Param({ name: 'label', types: ['String'] }),
      new automation.Param({
        name: 'type',
        types: ['String'],
        meta: {
          visual: {
            options: ['select', 'radio'],
          },
        },
      }),
      new automation.Param({ name: 'value', types: ['String'] }),
      new automation.Param({ name: 'options', types: ['KV'] }),
    ],
    results: [
      new automation.Param({ name: 'value', types: ['String'] }),
    ],
  }),

] as Array<automation.Function>)
