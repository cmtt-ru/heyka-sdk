<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <div>
      <ui-button
        :type="17"
        wide
        class="l-mb-12"
        icon="slack"
        size="large"
        :disabled="isSocialAuthDisabled"
        @click="socialHandler('slack')"
      >
        Slack
      </ui-button>

      <ui-button
        :type="17"
        wide
        class="l-mb-12"
        icon="google"
        size="large"
        :disabled="isSocialAuthDisabled"
        @click="socialHandler('google')"
      >
        Google
      </ui-button>

      <ui-button
        :type="17"
        wide
        class="l-mb-12"
        icon="facebook"
        size="large"
        :disabled="isSocialAuthDisabled"
        @click="socialHandler('facebook')"
      >
        Facebook
      </ui-button>

      <router-link :to="{name: 'auth-email-signin'}">
        <ui-button
          :type="17"
          wide
          class="l-mb-12"
          icon="mail"
          size="large"
        >
          Email
        </ui-button>
      </router-link>
    </div>
  </div>
</template>

<script>

import UiButton from '@components/UiButton';
import { WEB_URL } from '@sdk/Constants';

export default {
  components: {
    UiButton,
  },

  data: function () {
    return {
      isSocialAuthDisabled: !IS_DEV,
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('auth.main');
    },
  },

  methods: {
    /**
     * Social button handler
     * @param {string} socialName – social name
     * @returns {void}
     */
    socialHandler(socialName) {
      let actionName = 'login';

      if (!IS_ELECTRON) {
        actionName = 'web-login';
      }

      const link = `${WEB_URL}/auth/social/${socialName}/${actionName}`;

      window.open(link);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
