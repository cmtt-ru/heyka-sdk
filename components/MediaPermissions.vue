<template>
  <div class="media-permissions media-permissions__tint">
    <div class="media-permissions__popup">
      <h1>Just a minute</h1>

      <p class="media-permissions__popup__sub-title">
        To use Heyka, please allow access
        to your devices
      </p>

      <div class="media-permissions__devices">
        <div class="media-permissions__devices__item">
          <div class="media-permissions__devices__item__icon">
            <svg-icon name="mic" />
          </div>

          <p>Microphone</p>

          <ui-switch v-model="microphoneSwitch" />
        </div>

        <div class="media-permissions__devices__item">
          <div class="media-permissions__devices__item__icon">
            <svg-icon name="video" />
          </div>

          <p>Camera</p>

          <ui-switch v-model="cameraSwitch" />
        </div>

        <div class="media-permissions__devices__item">
          <div class="media-permissions__devices__item__icon">
            <svg-icon name="screencast" />
          </div>

          <p>Screen sharing</p>

          <ui-switch v-model="screenSwitch" />
        </div>
      </div>

      <ui-button
        class="media-permissions__skip"
        :type="17"
        size="large"
        wide
      >
        Skip this step
      </ui-button>
    </div>
  </div>
</template>

<script>

import mediaCapturer from '@classes/mediaCapturer';
import SvgIcon from '@components/SvgIcon';
import UiSwitch from '@components/Form/UiSwitch';
import UiButton from '@components/UiButton';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

let updateTimer = null;
const UPDATE_INTERVAL = 1000;

const currentWindow = WindowManager.getCurrentWindow();

export default {
  components: {
    SvgIcon,
    UiSwitch,
    UiButton,
  },

  data() {
    return {
      mediaAccess: {
        microphone: false,
        camera: false,
        screen: false,
      },
    };
  },

  computed: {
    microphoneSwitch: {
      get() {
        return this.mediaAccess.microphone === 'granted';
      },
      set(value) {
        if (value) {
          this.askForPermission('microphone');
        }
      },
    },

    cameraSwitch: {
      get() {
        return this.mediaAccess.camera === 'granted';
      },
      set(value) {
        if (value) {
          this.askForPermission('camera');
        }
      },
    },

    screenSwitch: {
      get() {
        return this.mediaAccess.screen === 'granted';
      },
      set(value) {
        if (value) {
          this.showMacScreenSharingPermission();
          this.startUpdateMediaAccess();
        }
      },
    },
  },

  async mounted() {
    await this.updateMediaAccessStatus();
    console.log('permissions state', this.mediaAccess);
  },

  beforeDestroy() {
    this.stopUpdateMediaAccess();
  },

  methods: {
    async askForPermission(mediaType) {
      const state = await window.ipcRenderer.invoke('remote-ask-for-media-access', mediaType);

      await this.updateMediaAccessStatus();

      return state;
    },

    async updateMediaAccessStatus() {
      this.mediaAccess = await window.ipcRenderer.invoke('remote-media-access-status');
      console.log('updateMediaAccessStatus');
    },

    openPreferences(mediaType) {
      const tabs = {
        microphone: 'Microphone',
        camera: 'Camera',
        screen: 'ScreenCapture',
      };

      window.open(`x-apple.systempreferences:com.apple.preference.security?Privacy_${tabs[mediaType]}`, '_blank');
    },

    /**
     * Show mac screen sharing permission
     * @returns {void}
     */
    async showMacScreenSharingPermission() {
      const timeout = 1000;

      if (IS_MAC) {
        const screens = await mediaCapturer.getSources('screen', 0);
        const stream = await mediaCapturer.getStream(screens[0].id);

        setTimeout(() => {
          mediaCapturer.destroyStream(stream);
        }, timeout);
      }
    },

    startUpdateMediaAccess() {
      this.stopUpdateMediaAccess();
      currentWindow.on('focus', this.windowFocusHandler);
      updateTimer = setInterval(this.updateMediaAccessStatus, UPDATE_INTERVAL);
      console.log('startUpdateMediaAccess', updateTimer);
    },

    stopUpdateMediaAccess() {
      currentWindow.removeListener('focus', this.windowFocusHandler);
      clearInterval(updateTimer);
      console.log('stopUpdateMediaAccess', updateTimer);
      updateTimer = null;
    },

    windowFocusHandler() {
      setTimeout(() => {
        this.stopUpdateMediaAccess();
      }, UPDATE_INTERVAL);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .media-permissions
    display flex
    align-items center
    justify-content center
    position fixed
    left 0
    top 0
    width 100%
    height 100%
    z-index 1000

    &__tint
      background rgba(0, 0, 0, 0.28)

    &__popup
      width 282px
      padding 24px
      border-radius 10px
      background #fff
      box-shadow 0 20px 30px rgba(0, 0, 0, 0.2)
      box-sizing border-box

      h1
        text-align center
        font-weight 600
        font-size 18px
        line-height 24px

      &__sub-title
        line-height 20px
        font-size 12px
        margin-top 12px
        text-align center
        color var(--new-UI-04)
        padding 0 12px

    &__devices
      margin-top 8px

      &__item
        display flex
        align-items center
        padding 16px 8px

        &__icon
          flex-shrink 0
          width 32px
          height 32px
          border-radius 100%
          background var(--new-UI-06)
          display flex
          align-items center
          justify-content center
          margin-right 12px

          svg
            width 14px
            height 14px
            color var(--new-UI-03)

        p
          font-weight 600
          line-height 22px

        .switch
          width auto
          margin-left auto

    &__skip
      margin-top 32px

</style>
