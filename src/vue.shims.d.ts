declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue/types/vue' {
  import { apiClients } from 'corteza-js'

  interface Vue {
    $SystemAPI: typeof apiClients.System;
    $MessagingAPI: typeof apiClients.Messaging;
    $ComposeAPI: typeof apiClients.Compose;
  }
}
