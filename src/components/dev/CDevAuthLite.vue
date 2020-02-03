<template>
  <div style="margin: 10px;">
    <div>
      <h1>
        Hello Crust developer.
      </h1>
      <br>

      <p>
        It looks like you need to login
      </p>

      <p>
        In a production environment, you would be redirected to
        <b>/auth</b> and be presented with the proper login UI.
      </p>

      <p>
        You can either login with your email and password or you can manually copy your JWT.
      </p>
      <br>
    </div>

    <hr>

    <p>
      Crust System API: <b>{{ backend }}</b><br>
      Frontend version: <b>{{ frontendVersion }}</b>
    </p>

    <hr>

    <div>
      <br>
      <h2>Login</h2>
      <br>

      Email:<br>
      <input
        v-model="form.email"
        type="email"
        required
        autocomplete="email"
      >
      <br>
      <br>

      Password:<br>
      <input
        v-model="form.password"
        type="password"
        required
        autocomplete="password"
      >
      <br>

      <button
        type="submit"
        :disabled="!form.email || !form.password"
        @click="login"
      >
        Login
      </button>
      &nbsp; <b>{{ checkLogin }}</b>
      <br>
      <br>
    </div>

    <hr>

    <br>
    <h2>Check JWT</h2>
    <br>
    <p>
      Due to some limitations in the dev env, please copy your JWT manually.<br>
      Go to the webapp where you are logged-in and find it in your local-storage or by running <b>localStorage.getItem('auth.jwt')</b> in the browser
      console and paste it to the input box below.
    </p>
    <br>

    Manage your JWT here:
    <br>
    <textarea
      v-model.trim="newJWT"
      rows="3"
      cols="100"
    />
    <br>

    <button
      type="submit"
      :disabled="!newJWT"
      @click="check"
    >
      Check & store
    </button>
    &nbsp; <b>{{ checkJWT }}</b>
    <br>
    <br>

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
  </div>
</template>
<script>
export default {
  data () {
    return {
      countdown: 3,

      checkJWT: '',
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
      this.checkJWT = `  ... verifying JWT`
      this.$auth.check(this.newJWT).then((user) => {
        this.countdown = 2
        let h = setInterval(() => {
          this.checkJWT = ` Valid JWT, redirecting in ${this.countdown} seconds`
          if (this.countdown === 0) {
            window.location = '/'
            clearInterval(h)
          }
          this.countdown--
        }, 1000)
      }).catch((message) => {
        this.checkJWT = message
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
          this.checkLogin = ` Valid login, redirecting in ${this.countdown} seconds`
          if (this.countdown === 0) {
            window.location = '/'
            clearInterval(h)
          }
          this.countdown--
        }, 1000)
      }).catch(({ message }) => {
        this.checkLogin = message
      })
    },
  },
}
</script>
