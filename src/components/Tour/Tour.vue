  <template>
    <v-tour
      v-if="tour !== null"
      :name="tour.name"
      :steps="tour.steps"
      :options="tour"
      :callbacks="this.callbacks"
      @onStop="onStop"
    >
      <template slot-scope="tour">
        <transition name="fade">
          <template v-for="(step, index) of tour.steps">
            <v-step
              v-if="tour.currentStep === index"
              :key="index"
              :step="step"
              :previous-step="tour.previousStep"
              :next-step="tour.nextStep"
              :stop="tour.stop"
              :is-first="tour.isFirst"
              :is-last="tour.isLast"
              :labels="tour.labels"
              @onStop="onStop"
            >
              <div slot="header">
                <div
                  v-if="step.header"
                  class="v-step__header"
                >
                  <div
                    v-if="step.header.title"
                    v-html="$t(step.header.title)"
                  />
                </div>
              </div>

              <div slot="content">
                <div class="v-step__content">
                  <div v-html="$t(step.content)" />
                </div>
              </div>

              <div slot="actions">
                <b-button
                  class="v-step__button"
                  @click="onStop"
                >
                  <template v-if="tour.isLast && !(callbacks || {}).onNextRedirect">
                    {{ $t('buttons.end') }}
                  </template>
                  <template v-else>
                    {{ $t('buttons.skip') }}
                  </template>
                </b-button>
                <b-button
                  v-if="tour.isFirst && (callbacks || {}).onPrevRedirect"
                  class="v-step__button"
                  :href="callbacks.onPrevRedirect"
                >
                  {{ $t('buttons.previous') }}
                </b-button>
                <b-button
                  v-else-if="!tour.isFirst"
                  class="v-step__button"
                  @click="tour.previousStep"
                >
                  {{ $t('buttons.previous') }}
                </b-button>
                <b-button
                  v-if="tour.isLast && (callbacks || {}).onNextRedirect"
                  class="v-step__button"
                  :href="callbacks.onNextRedirect"
                >
                  {{ $t('buttons.next') }}
                </b-button>
                <b-button
                  v-else-if="!tour.isLast"
                  class="v-step__button"
                  @click="tour.nextStep"
                >
                  {{ $t('buttons.next') }}
                </b-button>
              </div>
            </v-step>
          </template>
        </transition>
      </template>
    </v-tour>
  </template>
<script>

export default {
  name: 'TourComponent',
  i18nOptions: {
    namespaces: 'onboarding-tour',
  },
  props: {
    name: String,
    callbacks: {
      type: Object,
    },
  },
    data () {
    return {
      tour: {
        name:'app-list',
        steps: [   
          'app-list',
          'low-code',
          'crm',
          'reporter',
          'workflow',
          'profile',
          ].map(step=>{
            return {
                    name: step,
                    target: `[data-v-onboarding="${step}"]`,
                    header: {
                      title: this.$t(`steps.${step}.title`),
                    },
                    content: this.$t(`steps.${step}.content`),
                  }
          }),
      },
    }
  },
  computed: {
      labels () {
        return this.tour.labels
      },
    },
  methods: {
    start () {
      if (JSON.parse(localStorage.getItem('corteza.tour'))) {
        this.$tours[this.tour.name].start()
      }
    },
    onStop(){
      localStorage.setItem('corteza.tour', JSON.stringify(false))
      this.$tours[this.tour.name].stop()
    },
  },
}

</script>
<style lang="scss">
/*Modified plugin css from vue-tour.css*/
body.v-tour--active {
  pointer-events: none;
}
.v-tour {
  pointer-events: auto;
}
.v-tour__target--highlighted {
  -webkit-box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  z-index: 9999;
}
.v-tour__target--relative {
  position: relative;
}
.v-step {
  background: #5C5C5C;
  color: #fff;
  max-width: 320px;
  border-radius: 1.1rem;
  -webkit-box-shadow: transparent 0 0 0 0, transparent 0 0 0 0,
    rgba(0, 0, 0, 0.1) 0 4px 6px -1px, rgba(0, 0, 0, 0.06) 0 2px 4px -1px;
  box-shadow: 0 0 0 0 transparent, 0 0 0 0 transparent,
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 20px;
  pointer-events: auto;
  text-align: center;
  z-index: 10000;
}
.v-step--sticky {
  position: fixed;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.v-step--sticky .v-step__arrow {
  display: none;
}
.v-step__arrow,
.v-step__arrow:before {
  position: absolute;
  width: 10px;
  height: 10px;
  background: inherit;
}
.v-step__arrow {
  visibility: hidden;
}
.v-step__arrow--dark:before {
  background: #5C5C5C;
}
.v-step__arrow:before {
  visibility: visible;
  content: "";
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  margin-left: -5px;
}
.v-step[data-popper-placement^="top"] > .v-step__arrow {
  bottom: -5px;
}
.v-step[data-popper-placement^="bottom"] > .v-step__arrow {
  top: -5px;
}
.v-step[data-popper-placement^="right"] > .v-step__arrow {
  left: -5px;
}
.v-step[data-popper-placement^="left"] > .v-step__arrow {
  right: -5px;
}
.v-step__header {
  margin: -1rem -1rem 0.5rem;
  padding: 0.5rem;
  border-radius: 1.1rem 1.1rem 0 0 ;
  font-weight: 700;
  font-size: 1rem;
}
.v-step__content {
  margin: 0 0 20px 0;
}
.v-step__button {
  background: #6897AB;
  border:none;
  border-radius: 0.3rem;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-size: 0.8rem;
  font-size: 1rem;
  outline: none;
  padding: 0.35rem 0.4rem;
  text-align: center;
  text-decoration: none;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
  vertical-align: middle;
  white-space: nowrap;
  padding: 0.25em 1em;
}
.v-step__button:hover {
  background-color: hsla(0, 0%, 100%, 0.95);
  color: #50596c;
}
.v-step__button-skip {
  background: #E4E9EF;
  color: #2D2D2D;
  margin-right: auto;
}
.v-step__button-previous {
  margin-right: 10px;
}
.v-step__buttons{
  display: flex;
  justify-content:flex-end;
}
/*Modified css from vue-tour.css*/
</style>
