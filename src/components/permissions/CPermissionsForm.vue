<template>
  <b-form @submit.prevent="onSubmit">
    <b-row>
      <b-col
        class="role-list"
        cols="12"
        lg="3"
      >
        <b-list-group class="d-none d-lg-block">
          <b-list-group-item
            v-for="r in roles"
            :key="r.roleID"
            :active="r.roleID === currentRole.roleID"
            active-class="primary"
            variant="outline-primary"
            class="text-break pointer"
            @click="onRoleChange(r)"
          >
            {{ r.name || r.handle || r.roleID }}
          </b-list-group-item>
        </b-list-group>
        <vue-select
          v-model="currentRole"
          key="roleID"
          label="name"
          class="mb-4 d-block d-lg-none"
          :clearable="false"
          :options="roles"
          @input="onRoleChange"
        />
      </b-col>
      <b-col
        class="rule-list"
        cols="12"
        lg="9"
      >
        <rules :rules.sync="rules" />
      </b-col>
    </b-row>

    <b-row class="footer mt-3"
    >
      <b-col
        class="rule-list text-right"
        cols="9"
        offset="3"
      >
        <b-button
          type="submit"
          variant="primary"
          :disabled="disabled"
        >
          {{ $t('saveChanges') }}
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>
<script lang="js">
import Rules from './form/Rules.vue'
import { VueSelect } from 'vue-select'

// Data, Methods, Computed, Props
export default {
  i18nOptions: {
    namespaces: 'permission',
  },

  components: {
    Rules,
    VueSelect,
  },

  props: {
    resource: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      required: false,
      default: undefined,
    },

    backendComponentName: {
      type: String,
      default () {
        // Assuming backend service will
        // be equal to (first part of) resource
        if (!this.resource.startsWith('corteza::')) {
          throw Error('unrecognized resource type schema')
        }

        // <schema>::<backend-component-name>:...
        return this.resource.split(':')[2]
      },
    },
  },

  data () {
    return {
      processing: false,

      // List of available permissions (for a specific resource)
      permissions: [],

      // List of rules for the current role
      rules: [],

      // List of all available roles
      roles: [],

      // Current role object
      currentRole: undefined,
    }
  },

  computed: {
    dirty () {
      return this.collectChangedRules().length > 0
    },

    disabled () {
      return !this.dirty
    },

    api () {
      const s = this.backendComponentName
      return this['$' + s.charAt(0).toUpperCase() + s.slice(1) + 'API']
    },
  },

  created () {
    this.fetchPermissions()
    this.fetchRoles()
  },

  methods: {
    onRoleChange (role) {
      this.currentRole = role
      this.fetchRules(role.roleID)
    },

    onSubmit () {
      this.processing = true
      const rules = this.collectChangedRules()
      const { roleID } = this.currentRole

      this.api.permissionsUpdate({ roleID, rules }).then(() => {
        this.fetchRules(roleID)
        this.processing = false
      })
    },

    async fetchPermissions () {
      // clean loaded rules
      this.rules = []
      this.permissions = []
      this.processing = true

      return this.api.permissionsList().then((pp) => {
        this.permissions = this.filterPermissions(pp)
        this.processing = false
      })
    },

    async fetchRules (roleID) {
      this.processing = true
      return this.api.permissionsRead({ roleID }).then((rules) => {
        this.rules = this.normalizeRules(rules)
        this.processing = false
      })
    },

    async fetchRoles () {
      this.processing = true
      // Roles are always fetched from $SystemAPI.
      return this.$SystemAPI.roleList().then(({ set }) => {
        this.roles = set
          .filter(({ isBypass  }) => !isBypass )
          .sort((a, b) => a.roleID.localeCompare(b.roleID))

        if (this.roles.length > 0) {
          this.onRoleChange(this.roles[0])
        }
        this.processing = false
      })
    },

    normalizeRules (rr) {
      const inherit = 'inherit'

      // merges roleRules (subset) with list of all permissions
      const findCurrent = ({ resource, operation }) => {
        if (!rr) {
          return inherit
        }

        return (rr.find(r => r.resource === resource && r.operation === operation) || {}).access || inherit
      }

      return this.permissions.map((p) => {
        const current = findCurrent(p)
        return { ...p, access: current, current }
      })
    },

    // Removes unneeded permissions (ones that do not match resource prop)
    // and translates the rest
    filterPermissions (pp) {
      const [ resourceType ] = this.resource.split('/', 2)
      return pp
        .filter(({ type }) => resourceType === type)
        .map(({ type, op: operation }) => {
          return {
            ...this.describePermission({ resource: type, operation }),
            operation,
            // override resource-type with the actual resource-ID
            resource: this.resource
          }
        })
    },

    collectChangedRules () {
      return this.rules.filter(r => r.access !== r.current).map(({ resource, operation, access }) => {
        return { resource, operation, access }
      })
    },

    describePermission ({ resource, operation }) {
      resource = _.camelCase(resource.split(':')[2] + ' ' + (resource.split(':')[3] || 'component'))
      operation = _.camelCase(operation)

      let title = ''
      if (this.target) {
        title = this.$t(`${resource}.operations.${operation}.specific`, { target: this.target })
      } else {
        title = this.$t(`${resource}.operations.${operation}.title`)
      }

      return {
        title,
        description: this.$t(`${resource}.operations.${operation}.description`),
      }
    },
  },
}

</script>
<style scoped lang="scss">
.pointer {
  cursor: pointer;
}
</style>
