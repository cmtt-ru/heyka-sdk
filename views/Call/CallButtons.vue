<template>
  <div
    v-stop-propagation.dblclick
    class="call-buttons"
    :size="size"
  >
    <ui-button
      v-if="buttons.includes('microphone')"
      :disabled="!isDeviceAvailable('microphone') || janusInProgress"
      class="call-buttons__button"
      :type="7"
      popover
      :active="mediaState.microphone"
      :size="size"
      :icon="buttonIcons.mic.icon"
      :height="buttonHeight"
      @click="switchProp('microphone')"
    />

    <ui-button
      v-if="buttons.includes('camera')"
      :disabled="!isDeviceAvailable('camera') || janusInProgress"
      class="call-buttons__button"
      :type="7"
      popover
      :active="mediaState.camera"
      :size="size"
      :icon="buttonIcons.camera.icon"
      :height="buttonHeight"
      @click="cameraHandler"
    />

    <ui-button
      v-if="buttons.includes('screen')"
      :disabled="janusInProgress"
      class="call-buttons__button"
      :type="7"
      popover
      :active="mediaState.screen"
      :size="size"
      :icon="buttonIcons.screen.icon"
      :height="buttonHeight"
      @click="sharingHandler"
    />

    <ui-button
      v-if="buttons.includes('speakers')"
      class="call-buttons__button"
      :type="7"
      popover
      :active="mediaState.speakers"
      :size="size"
      :icon="buttonIcons.speakers.icon"
      :height="buttonHeight"
      @click.native="switchProp('speakers')"
    />

    <ui-button
      v-if="buttons.includes('grid')"
      class="call-buttons__button"
      :type="7"
      popover
      :size="size"
      icon="grid"
      :height="buttonHeight"
      @click="gridHandler()"
    />

    <ui-button
      v-if="buttons.includes('leave')"
      :disabled="janusInProgress"
      class="call-buttons__button call-buttons__button--disconnect"
      :type="7"
      popover
      :size="size"
      icon="disconnect"
      :height="buttonHeight"
      @click="disconnectHandler"
    />
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import { mapGetters } from 'vuex';

/**
 * Map media state points to corresponding icons
 */
const ICON_MAP = {
  mic: {
    true: {
      icon: 'mic',
    },
    false: {
      icon: 'mic-off',
    },
  },
  speakers: {
    true: {
      icon: 'headphones',
    },
    false: {
      icon: 'headphones-off',
    },
  },
  camera: {
    true: {
      icon: 'video',
      color: 'var(--text-0)',
    },
    false: {
      icon: 'video-off',
    },
  },
  screen: {
    true: {
      icon: 'screencast',
    },
    false: {
      icon: 'screencast-off',
    },
  },
};

export default {
  components: {
    UiButton,
  },

  props: {
    /**
     * Buttons list
     * @example ['screen', 'camera', 'speakers', 'microphone', 'grid', 'leave']
     */
    buttons: {
      type: Array,
      default: function () {
        return [];
      },
    },

    /**
     * Size of the buttons
     */
    size: {
      type: String,
      default: 'medium',
    },
  },

  computed: {
    ...mapGetters({
      mediaState: 'me/getMediaState',
      janusInProgress: 'janus/inProgress',
      selectedDevices: 'app/getSelectedDevices',
    }),

    /**
     * Determine which icons to show
     * @returns {object}
     */
    buttonIcons() {
      return {
        mic: ICON_MAP.mic[this.mediaState.microphone],
        speakers: ICON_MAP.speakers[this.mediaState.speakers],
        camera: ICON_MAP.camera[this.mediaState.camera],
        screen: ICON_MAP.screen[this.mediaState.screen],
      };
    },

    buttonHeight() {
      // eslint-disable-next-line no-magic-numbers
      return this.size === 'medium' ? 44 : 64;
    },
  },

  methods: {
    /**
     * Change our media state depending on which button was clicked
     * @param {string} property mediastate's property name
     * @returns {void}
     */
    switchProp(property) {
      const newState = { ...this.mediaState };

      newState[property] = !this.mediaState[property];

      broadcastActions.dispatch('me/setMediaState', newState);
    },

    /**
     * Open Grid if camera is turned on
     * @returns {void}
     */
    cameraHandler() {
      this.switchProp('camera');

      // if (IS_ELECTRON && this.mediaState.camera) {
      //   this.gridHandler();
      // }
    },

    /**
     * Grid button handler
     * @returns {void}
     */
    gridHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid');
    },

    /**
     * Disconnect button handler
     * @returns {void}
     */
    async disconnectHandler() {
      broadcastActions.dispatch('unselectChannel', this.$store.getters['me/getSelectedChannelId']);
      if (!IS_ELECTRON) {
        this.$router.replace({ name: 'guest-finish' });
      }
    },

    /**
     * Sharing button handler
     * @returns {void}
     */
    sharingHandler() {
      if (this.mediaState.screen === true) {
        broadcastActions.dispatch('janus/setSharingSource', null);
        this.switchProp('screen');
      } else {
        if (IS_ELECTRON) {
          broadcastActions.dispatch('openSharingWindow');
        } else {
          this.switchProp('screen');
        }
      }
    },

    /**
     * Return availability of specific device
     * @param {string} deviceType – device type
     * @returns {boolean}
     */
    isDeviceAvailable(deviceType) {
      return !!this.selectedDevices[deviceType];
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-buttons
    display flex

    &__button
      flex-shrink 0

      &--disconnect
        color var(--new-signal-03)

      &:last-child
        margin-right 0 !important

    &[size="medium"]
      & ^[-1]__button
        margin-right 12px
        border-radius 11px

    &[size="large"]
      & ^[-1]__button
        margin-right 16px

</style>
