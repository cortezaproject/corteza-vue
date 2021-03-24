import { automation } from '@cortezaproject/corteza-js'

const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark']

export const prompts = Object.freeze([{
  ref: 'redirect',
  meta: { short: 'Redirect user to an outside URL' },
  parameters: [
    { name: 'url', types: ['String'], required: true },
    { name: 'delay', types: ['Integer'], meta: { description: 'Redirection delay in seconds' } },
  ],
}, {
  ref: 'reroute',
  meta: { short: 'Redirect user to an internal application route' },
  parameters: [
    { name: 'name', types: ['String'], required: true },
    { name: 'params', types: ['KV'] },
    { name: 'query', types: ['KV'] },
    { name: 'delay', types: ['Integer'], meta: { description: 'Redirection delay in seconds' } },
  ],
}, {
  ref: 'recordPage',
  meta: { short: 'Redirect user to the record page' },
  parameters: [
    { name: 'module', types: ['ID', 'Handle', 'ComposeModule'] },
    { name: 'namespace', types: ['ID', 'Handle', 'ComposeNamespace'] },
    { name: 'record', types: ['ID', 'ComposeRecord'] },
    { name: 'edit', types: ['Boolean'] },
    { name: 'delay', types: ['Integer'], meta: { description: 'Redirection delay in seconds' } },
  ],
}, {
  ref: 'notification',
  meta: { short: 'Show non-blocking message to user' },
  parameters: [
    { name: 'title', types: ['String'] },
    { name: 'message', types: ['String'], required: true },
    { name: 'variant', types: ['String'], meta: { visual: { variants } } },
    { name: 'timeout', types: ['Integer'], meta: { description: 'How long do we show the notification in seconds' } },
  ],
}, {
  ref: 'alert',
  meta: { short: 'Prompt user with an alert' },
  parameters: [
    { name: 'title', types: ['String'] },
    { name: 'message', types: ['String'], required: true },
    { name: 'buttonLabel', types: ['String'] },
    { name: 'buttonVariant', types: ['String'], meta: { visual: { variants } } },
    { name: 'buttonValue', types: ['Any'] },
  ],
}, {
  ref: 'choice',
  meta: { short: 'Prompt user with  choice' },
  parameters: [
    { name: 'title', types: ['String'] },
    { name: 'message', types: ['String'], required: true },
    { name: 'confirmButtonLabel', types: ['String'] },
    { name: 'confirmButtonVariant', types: ['String'], meta: { visual: { variants } } },
    { name: 'confirmButtonValue', types: ['Any'] },
    { name: 'rejectButtonLabel', types: ['String'] },
    { name: 'rejectButtonVariant', types: ['String'], meta: { visual: { variants } } },
    { name: 'rejectButtonValue', types: ['Any'] },
  ],
  results: [
    { name: 'value', types: ['Any'] },
  ],
}, {
  ref: 'input',
  meta: { short: 'Prompt user with a single input' },
  parameters: [
    { name: 'title', types: ['String'] },
    { name: 'variant', types: ['String'], meta: { visual: { variants } } },
    { name: 'message', types: ['String'], required: true },
    { name: 'label', types: ['String'] },
    {
      name: 'type',
      types: ['String'],
      meta: {
        visual: {
          options: ['text', 'number', 'email', 'password', 'search', 'date', 'time'],
        },
      },
    },
    { name: 'inputValue', types: ['String'] },
  ],
  results: [
    { name: 'value', types: ['Any'] },
  ],
}, {
  ref: 'options',
  meta: { short: 'Prompt user with options' },
  parameters: [
    { name: 'title', types: ['String'] },
    { name: 'variant', types: ['String'], meta: { visual: { variants } } },
    { name: 'message', types: ['String'], required: true },
    { name: 'label', types: ['String'] },
    {
      name: 'type',
      types: ['String'],
      meta: {
        visual: {
          options: ['select', 'radio'],
        },
      },
    },
    { name: 'value', types: ['String'] },
    { name: 'options', types: ['KV'] },
  ],
  results: [
    { name: 'value', types: ['String'] },
  ],
}].map(f => new automation.Function({ ...f, kind: 'prompt' })))
