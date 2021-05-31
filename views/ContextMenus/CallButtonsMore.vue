<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        :icon="speakersInfo['icon']"
        data-popover-close
        @click="switchSpeakersHandler"
      >
        Звук
      </ui-button>
      <ui-button
        :type="11"
        icon="hand-up"
        data-popover-close
        @click="raiseHandHandler"
      >
        Rise a hand
      </ui-button>
      <ui-button
        :type="11"
        icon="chat"
        data-popover-close
        @click="openChatHandler"
      >
        Chat
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import broadcastEvents from '@sdk/classes/broadcastEvents';

const SPEAKERS_INFO = {
  true: {
    icon: 'headphones',
    text: 'speakers',
  },
  false: {
    icon: 'headphones-off',
    text: 'speakersOff',
  },
};

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {
    /**
     * User ID
     */
    userId: {
      type: String,
      default: null,
    },

  },

  computed: {
    ...mapGetters({
      mediaState: 'me/getMediaState',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.griduser');
    },

    /**
     * Determine which icon and text to show at speakers button
     * @returns {object}
     */
    speakersInfo() {
      return SPEAKERS_INFO[this.mediaState.speakers];
    },
  },

  methods: {
    /**
     * Change our speakers state
     * @returns {void}
     */
    switchSpeakersHandler() {
      broadcastEvents.dispatch('callbuttons-speakers');
    },
    /**
     * Change our speakers state
     * @returns {void}
     */
    raiseHandHandler() {
      broadcastEvents.dispatch('callbuttons-hand');
    },
    /**
     * Change our speakers state
     * @returns {void}
     */
    openChatHandler() {
      broadcastEvents.dispatch('callbuttons-chat');
    },

  },
};
</script>

<style lang="stylus" scoped>
/deep/ svg
  color var(--new-white)
</style>
