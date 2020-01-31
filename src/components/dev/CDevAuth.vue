<template>
  <b-container
    class="p-2"
  >
    <b-row>
      <b-col>
        <h1>
          Hello Crust developer.
        </h1>

        <p>
          It looks like you need to login
        </p>

        <p>
          In a production environment, you would be redirected to
          <code>/auth</code> and be presented with the proper login UI.
        </p>

        <p>
          You can either login with your email and password or you can manually copy your JWT.
        </p>
      </b-col>
    </b-row>

    <hr>

    <b-row>
      <b-col
        cols="2"
      >
        Crust System API:
      </b-col>
      <b-col
        cols="10"
      >
        <code>{{ backend }}</code>
      </b-col>

      <b-col
        cols="2"
      >
        Frontend version:
      </b-col>
      <b-col
        cols="10"
      >
        <code>{{ frontendVersion }}</code>
      </b-col>
    </b-row>

    <hr>

    <b-row>
      <b-col
        cols="12"
      >
        <p
          class="mb-1"
        >
          Due to some limitations in the dev env, please copy your JWT manually. Go to the webapp where you are logged-in
          and find it in your local-storage or by running <code>localStorage.getItem('auth.jwt')</code> in the browser
          console and paste it to the input box below.
        </p>
      </b-col>
    </b-row>

    <b-row>
      <b-col
        cols="2"
      >
        Manage your JWT here:
      </b-col>
      <b-col
        cols="10"
      >
        <textarea
          v-model.trim="newJWT"
          class="w-100"
          placeholder="Your JWT string"
          rows="3"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col
        cols="10"
        offset="2"
        class="mt-2"
      >
        <b-button
          :disabled="!newJWT"
          @click="check"
        >
          Check & store
        </b-button>
        &nbsp; <code v-html="checkRsp" />
      </b-col>
    </b-row>

    <hr>
    <div
      class="text-center h1"
    >
      <code>OR</code>
    </div>
    <hr>

    <b-form
      class="login-form"
      @submit.prevent="login"
    >
      <b-form-group
        label="Email"
        label-cols="2"
      >
        <b-form-input
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="Your email"
          required
          autocomplete="email"
        />
      </b-form-group>

      <b-form-group
        label="Password"
        label-cols="2"
        class="mt-2"
      >
        <b-form-input
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Your pasword"
          required
          autocomplete="password"
        />
      </b-form-group>

      <b-form-group
        label-cols="2"
      >
        <b-button
          type="submit"
          :disabled="!form.email || !form.password"
        >
          Login
        </b-button>
        &nbsp; <code v-html="checkLogin" />
      </b-form-group>
    </b-form>

    <hr>

    <b-row v-if="$auth.user">
      <b-col
        cols="2"
      >
        User data:
      </b-col>
      <b-col
        cols="10"
      >
        <pre>{{ $auth.user }}</pre>
      </b-col>
      <hr>
    </b-row>

    <a href="/">&laquo; Back</a>
  </b-container>
</template>
<script>
export default {
  data () {
    return {
      countdown: 3,

      checkRsp: '',
      checkLogin: '',

      newJWT: '',
      form: {
        email: '',
        password: '',
      },
    }
  },

  computed: {
    backend () {
      return window.SystemAPI
    },

    frontendVersion () {
      /* eslint-disable no-undef */
      return VERSION
    },
  },

  created () {
    if (process.env.NODE_ENV !== 'development') {
      // Not in development mode, move away from here
      this.$auth.open()
    }

    this.newJWT = this.$auth.JWT
  },

  methods: {
    check () {
      this.newJWT = this.newJWT.replace(/["']+/, '')
      this.checkRsp = `  ... verifying JWT`
      this.$auth.check(this.newJWT).then((user) => {
        this.countdown = 2
        let h = setInterval(() => {
          this.checkRsp = ` &check; Valid JWT, redirecting in ${this.countdown} seconds`
          if (this.countdown === 0) {
            window.location = '/'
            clearInterval(h)
          }
          this.countdown--
        }, 1000)
      }).catch((e) => {
        console.error(e)
        this.checkRsp = e
      })
    },

    login () {
      this.checkLogin = `  ... verifying login`
      this.$SystemAPI.authInternalLogin(this.form).then(({ jwt, user } = {}) => {
        this.countdown = 2
        this.newJWT = jwt
        this.$auth.JWT = jwt
        this.$auth.user = user
        let h = setInterval(() => {
          this.checkLogin = ` &check; Valid login, redirecting in ${this.countdown} seconds`
          if (this.countdown === 0) {
            window.location = '/'
            clearInterval(h)
          }
          this.countdown--
        }, 1000)
      }).catch((e) => {
        console.error(e)
        this.checkLogin = e
      })
    },
  },
}
</script>
