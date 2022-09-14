<template>
  <b-card
    no-body
    class="shadow-sm"
    header-bg-variant="white"
  >
    <template #header>
      <b-container
        class="p-0"
        fluid
        align-v="center"
      >
        <b-row>
          <b-col
            lg="8"
          >
            <slot
              name="header"
              :selected="selected"
            />
          </b-col>
          <b-col
            v-if="!hideSearch"
          >
            <c-input-search
              v-model.trim="filter[queryField]"
              :placeholder="translations.searchPlaceholder"
              :debounce="300"
              @input="$emit('search')"
            />
          </b-col>
        </b-row>
      </b-container>
    </template>

    <b-card-body
      class="p-0"
    >
      <b-table
        id="resource-list"
        ref="resourceList"
        hover
        responsive
        head-variant="light"
        class="mb-0"
        :primary-key="primaryKey"
        :sort-by.sync="sorting.sortBy"
        :sort-desc.sync="sorting.sortDesc"
        :items="_items"
        :fields="_fields"
        show-empty
        no-sort-reset
        :tbody-tr-class="tableRowClasses"
        no-local-sorting
        @row-clicked="$emit('row-clicked', $event)"
      >
        <template #empty>
          <p
            data-test-id="no-matches"
            class="text-center text-dark"
            style="margin-top: 1vh;"
          >
            {{ translations.noItems }}
          </p>
        </template>

        <template #table-busy>
          <div
            class="text-center"
          >
            <b-spinner />
            <h5 class="mt-2 text-dark">
              {{ translations.loading }}
            </h5>
          </div>
        </template>

        <template
          v-if="selectable"
          #head(select)
        >
          <b-checkbox
            :disabled="disableSelectAll"
            :checked="allRowsSelected && !disableSelectAll"
            class="ml-1"
            @change="selectAllRows"
          />
        </template>

        <template #cell(select)="{ item }">
          <b-form-checkbox
            v-if="isItemSelectable(item)"
            class="ml-1"
            :checked="selected.includes(item[primaryKey])"
            @change="onSelectRow($event, item[primaryKey])"
          />
        </template>

        <!-- Magic; Make slots if parent provides them -->
        <template
          v-for="field in customFieldSlots"
          #[`cell(${field})`]="{ item }"
        >
          <slot
            :name="field"
            :item="item"
          />
        </template>
      </b-table>
    </b-card-body>

    <template #footer>
      <div
        class="d-flex align-items-center justify-content-between"
      >
        <div
          class="text-truncate"
        >
        <div
            v-if="!hideTotal"
            class="text-nowrap font-weight-bold"
          >
            <span v-if="pagination.count > 1">
              {{ $t(`${translations.showingPagination}`, getPagination) }}
            </span>
            <span
              v-else
            >
              {{ $t(`${translations.singlePluralPagination}`, getPagination) }}
            </span>
          </div>
        </div>

        <b-button-group
          v-if="!hidePagination"
        >
          <b-button
            :disabled="hasPrevPage"
            variant="link"
            class="text-dark"
            @click="goToPage()"
          >
            <font-awesome-icon :icon="['fas', 'angle-double-left']" />
          </b-button>
          <b-button
            :disabled="hasPrevPage"
            variant="link"
            class="text-dark"
            @click="goToPage('prevPage')"
          >
            <font-awesome-icon :icon="['fas', 'angle-left']" />
            {{ translations.prevPagination }}
          </b-button>
          <b-button
            :disabled="hasNextPage"
            variant="link"
            class="text-dark"
            @click="goToPage('nextPage')"
          >
            {{ translations.nextPagination }}
            <font-awesome-icon :icon="['fas', 'angle-right']" />
          </b-button>
        </b-button-group>
      </div>
    </template>
  </b-card>
</template>
<script>
import CInputSearch from '../input/CInputSearch.vue'

export default {
  name: 'ResourceList',

  components: {
    CInputSearch,
  },

  props: {
    primaryKey: {
      type: String,
      required: true,
    },

    filter: {
      type: Object,
      required: true,
    },

    sorting: {
      type: Object,
      required: true,
    },

    pagination: {
      type: Object,
      required: true,
    },

    fields: {
      type: Array,
      required: true,
    },

    // Promise that resolves with an array
    items: {
      type: Function,
      required: true,
    },

    hideSearch: {
      type: Boolean,
    },

    hideTotal: {
      type: Boolean,
    },

    hidePagination: {
      type: Boolean,
    },

    // Are rows clickable
    clickable: {
      type: Boolean,
      default: false,
    },

    selectable: {
      type: Boolean,
      default: false,
    },

    isItemSelectable: {
      type: Function,
      default: () => true,
    },

    rowClass: {
      type: Function,
      default: () => {},
    },

    translations: {
      type: Object,
      required: true,
    },

    queryField: {
      type: String,
      default: 'query',
    },
  },

  data () {
    return {
      selected: [],
      selectableItemIDs: [],
    }
  },

  computed: {
    _fields () {
      const select = this.selectable ? [
        {
          key: 'select',
          label: '',
          thStyle: 'width: 0; white-space: nowrap;',
        }
      ] : []

      return [
        ...select,
        ...this.fields,
      ].map(f => {
        return { ...f, thClass: `${f.thClass || 'border-0'}` }
      })
    },

    customFieldSlots () {
      return [
        ...Object.keys(this.$slots),
        ...Object.keys(this.$scopedSlots),
      ].filter(s => s !== 'header')
    },

    disableSelectAll () {
      return !this.selectableItemIDs.length
    },

    allRowsSelected () {
      return this.selected.length === this.selectableItemIDs.length
    },

    getPagination () {
      const { page = 1, count = 0, limit = 10 } = this.pagination

      return {
        from: ((page - 1) * limit) + 1,
        to: Math.min((page * limit), count),
        count,
      }
    },

    hasPrevPage () {
      return !this.pagination.prevPage
    },

    hasNextPage () {
      return !this.pagination.nextPage
    },
  },

  methods: {
    tableRowClasses (item = {}) {
      return {
        'pointer': this.clickable,
        ...this.rowClass(item),
      }
    },

    _items () {
      this.selected = []
      this.selectableItemIDs = []

      return this.items().then((items = []) => {
        this.selectableItemIDs = items.filter(this.isItemSelectable).map(i => i[this.primaryKey])
        return items
      })
    },

    onSelectRow (selected, itemID) {
      if (selected) {
        if (this.selected.includes(itemID)) {
          return
        }

        this.selected.push(itemID)
      } else {
        const i = this.selected.indexOf(itemID)
        if (i < 0) {
          return
        }

        this.selected.splice(i, 1)
      }
    },

    selectAllRows (allSelected = false) {
      if (allSelected) {
        this.selected = this.selectableItemIDs
      } else {
        this.selected = []
      }
    },

    goToPage (page) {
      const pageCursor = this.pagination[page] || ''
      this.$router.push({ path: this.$route.path, query: { ...this.$route.query, pageCursor } })
    },
  },
}
</script>
