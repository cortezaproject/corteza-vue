import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  PermissionsButton,
  PermissionsForm,
  PermissionsModal,
} from './permissions'

Vue.use(BootstrapVue)
Vue.component('font-awesome-icon', FontAwesomeIcon)

export {
  PermissionsButton,
  PermissionsForm,
  PermissionsModal,
}
