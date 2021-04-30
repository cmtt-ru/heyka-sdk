<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <ui-form
      @submit="resetHandler"
    >
      <ui-input
        v-model="login.email"
        class="l-mb-12"
        placeholder="example@mail.com"
        email
        required
      />
      <ui-button
        :type="12"
        wide
        class="l-mb-8"
        size="large"
        submit
      >
        {{ texts.reset }}
      </ui-button>

      <ui-button
        :type="10"
        wide
        size="large"
        @click="$emit('go-back')"
      >
        {{ texts.cancel }}
      </ui-button>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';
import discardPass from '@api/auth/discardPass';
import notify from '@libs/notify';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      login: {
        email: this.$route.params.login || '',
      },
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('auth.reset');
    },

    /**
     * Get notification texts from I18n-locale file
     * @returns {object}
     */
    notifTexts() {
      return this.$t('notifications.login');
    },
  },

  methods: {
    async resetHandler() {
      try {
        await discardPass({ email: this.login.email });
      } catch (err) {
        console.log('ERROR:', err);
      }

      notify('notifications.login.passReset');
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
