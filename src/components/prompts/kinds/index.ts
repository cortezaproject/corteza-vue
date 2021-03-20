/* eslint-disable @typescript-eslint/ban-ts-ignore */

import alert from './CPromptAlert.vue'
import choice from './CPromptChoice.vue'
import input from './CPromptInput.vue'
import notification from './CPromptNotification.vue'
import options from './CPromptOptions.vue'
import { Component } from 'vue'
import { pVal } from '../utils'
import { automation } from '@cortezaproject/corteza-js'

interface Handler {
  (this: Component, input: automation.Vars): void;
}

interface PromptDefinition {
  component?: Component;

  /**
   *
   */
  handler?: Handler;

  /**
   * Passive prompt, will not be listed
   *
   * Also, when displaying toasts, we'll display all
   * passive toasts first and then, at the and one single
   * non-passive toast
   */
  passive?: boolean;
}

const definitions: Record<string, PromptDefinition> = {
  alert: {
    component: alert,
  },

  choice: {
    component: choice,
  },

  input: {
    component: input,
  },

  notification: {
    passive: true,
    component: notification,
  },

  options: {
    component: options,
  },

  redirect: {
    handler: function (v): void {
      const url = pVal(v, 'url')
      const delay = (pVal(v, 'delay') || 0) as number
      if (url !== undefined) {
        console.debug('redirect to %s via prompt in %d sec', url, delay)
        setTimeout(() => {
          // @ts-ignore
          window.location = url
        }, delay * 1000)
      }
    },
  },

  reroute: {
    handler: function (v): void {
      const name = pVal(v, 'name')
      const params = pVal(v, 'params')
      const query = pVal(v, 'query')
      const delay = (pVal(v, 'delay') || 0) as number
      if (name !== undefined) {
        console.debug('reroute to %s via prompt in %d sec', name, delay, { params, query })
        setTimeout(() => {
          // @ts-ignore
          this.$router.push({ name, params, query })
        }, delay * 1000)
      }
    },
  },
}

export default definitions
