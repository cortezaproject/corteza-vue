<template>
  <b-form @submit.prevent="onSubmit">
    <b-row>
      <b-col
        class="role-list"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <b-list-group class="d-none d-sm-block">
          <b-list-group-item
            v-for="r in roles"
            :key="r.roleID"
            :active="r.roleID === currentRole.roleID"
            active-class="primary"
            variant="outline-primary"
            class="text-break"
            @click="onRoleChange(r)"
          >
            {{ r.name || r.handle || r.roleID || $t('role.unnamed') }}
          </b-list-group-item>
        </b-list-group>
        <vue-select
          key="roleID"
          v-model="currentRole"
          label="name"
          class="mb-4 d-block d-sm-none"
          :clearable="false"
          :options="roles"
          @input="onRoleChange"
        />
      </b-col>
      <b-col
        class="rule-list"
        cols="12"
        sm="6"
        md="8"
        lg="9"
      >
        <rules :rules.sync="rules" />
      </b-col>
    </b-row>
    <b-row class="footer mt-3">
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
          {{ $t('permission.saveChanges') }}
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

    backendServiceName: {
      type: String,
      default () {
        // Assuming backend service will
        // be equal to (first part of) resource
        return this.resource.split(':')[0]
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

      // ID of the current role
      currentRole: {},
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
      const s = this.backendServiceName
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

      this.api.permissionsUpdate({ roleID, rules }).then((rules) => {
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
        this.roles = set.sort((a, b) => a.roleID.localeCompare(b.roleID))

        if (this.roles.length > 0) {
          this.onRoleChange(this.roles[0])
        }
        this.processing = false
      })
    },

    normalizeRules (rr) {
      // merges roleRules (subset) with list of all permissions
      const findCurrent = ({ resource, operation }) => {
        return (rr.find(r => r.resource === resource && r.operation === operation) || {}).access || 'inherit'
      }

      return this.permissions.map((p) => {
        const current = findCurrent(p)
        return { ...p, access: current, current }
      })
    },

    // Removes unneeded permissions (ones that do not match resource prop)
    // and translates the rest
    filterPermissions (pp) {
      let out = []
      const resourceType = this.resource.replace(/:(\d+|\*)$/, ':')
      const isService = !!resourceType.match(/[^:]$/)

      pp.forEach(({ resource, operation }) => {
        if (isService && resource !== resourceType) {
          // Test if service
          return
        }

        if (!isService && resource.indexOf(resourceType) !== 0) {
          // test if resource type
          return
        }

        // Describe, translate
        let p = this.describePermission({ resource, operation })

        // Now, override resource-type with the actual resource-ID
        p.operation = operation
        p.resource = this.resource

        out.push(p)
      })

      return out
    },

    collectChangedRules () {
      return this.rules.filter(r => r.access !== r.current).map(({ resource, operation, access }) => {
        return { resource, operation, access }
      })
    },

    describePermission ({ resource, operation }) {
      resource = resource.replace(/:/g, '-')
      operation = operation.replace(/\./g, '-')

      if (resource.slice(-1) === '-') {
        resource = resource.slice(0, -1)
      }

      const tString = `permission.${resource}.${operation}`
      let title = ''
      if (this.target) {
        title = this.$t(`${tString}.specific`, { target: this.target })
      } else {
        title = this.$t(`${tString}.title`)
      }

      return {
        title,
        description: this.$t(`${tString}.description`),
      }
    },
  },
}
</script>
