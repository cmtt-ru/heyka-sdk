<template>
  <div
    v-if="mode !== null"
    class="media-permissions media-permissions__tint"
  >
    <div class="media-permissions__popup">
      <!-- Onboarding popup -->
      <template v-if="mode === 'onboarding'">
        <h1>{{ texts.onboarding.title }}</h1>

        <p class="media-permissions__popup__sub-title">
          {{ texts.onboarding.subTitle }}
        </p>

        <div class="media-permissions__devices">
          <div class="media-permissions__devices__item">
            <div class="media-permissions__devices__item__icon">
              <svg-icon name="mic" />
            </div>

            <p>{{ texts.onboarding.microphone }}</p>

            <ui-switch v-model="microphoneSwitch" />
          </div>

          <div class="media-permissions__devices__item">
            <div class="media-permissions__devices__item__icon">
              <svg-icon name="video" />
            </div>

            <p>{{ texts.onboarding.camera }}</p>

            <ui-switch v-model="cameraSwitch" />
          </div>

          <div class="media-permissions__devices__item">
            <div class="media-permissions__devices__item__icon">
              <svg-icon name="screencast" />
            </div>

            <p>{{ texts.onboarding.screen }}</p>

            <ui-switch v-model="screenSwitch" />
          </div>
        </div>

        <ui-button
          class="media-permissions__skip"
          :type="17"
          size="large"
          wide
          @click.native="closeHandler(true)"
        >
          {{ texts.onboarding.skip }}
        </ui-button>
      </template>

      <template v-if="mode === 'microphone'">
        <div class="media-permissions__popup__close">
          <svg-icon
            name="close"
            @click.native="closeHandler"
          />
        </div>

        <div class="media-permissions__icon">
          <svg-icon name="mic" />
        </div>

        <h2>
          {{ texts.microphone.title }}
        </h2>

        <p class="media-permissions__popup__text">
          {{ texts.microphone.subTitle }}
        </p>

        <ui-button
          class="l-mt-24"
          :type="1"
          size="large"
          wide
          @click="openPreferences('microphone')"
        >
          {{ texts.microphone.settings }}
        </ui-button>
      </template>

      <template v-if="mode === 'camera'">
        <div class="media-permissions__popup__close">
          <svg-icon
            name="close"
            @click.native="closeHandler"
          />
        </div>

        <div class="media-permissions__icon">
          <svg-icon name="video" />
        </div>

        <h2>
          {{ texts.camera.title }}
        </h2>

        <p class="media-permissions__popup__text">
          {{ texts.camera.subTitle }}
        </p>

        <ui-button
          class="l-mt-24"
          :type="1"
          size="large"
          wide
          @click="openPreferences('camera')"
        >
          {{ texts.camera.settings }}
        </ui-button>
      </template>

      <template v-if="mode === 'screen'">
        <div class="media-permissions__popup__close">
          <svg-icon
            name="close"
            @click.native="closeHandler"
          />
        </div>

        <div class="media-permissions__icon">
          <svg-icon name="screencast" />
        </div>

        <h2>
          {{ texts.screen.title }}
        </h2>

        <p class="media-permissions__popup__text">
          {{ texts.screen.subTitle }}
        </p>

        <ui-button
          class="l-mt-24"
          :type="1"
          size="large"
          wide
          @click="openPreferences('screen')"
        >
          {{ texts.screen.settings }}
        </ui-button>
      </template>
    </div>
  </div>
</template>

<script>

import mediaCapturer from '@classes/mediaCapturer';
import SvgIcon from '@components/SvgIcon';
import UiSwitch from '@components/Form/UiSwitch';
import UiButton from '@components/UiButton';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import { heykaStore } from '@/store/localStore';
import { mapGetters } from 'vuex';

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

      wasOnboardingShown: true,

      mode: null,
    };
  },

  computed: {
    ...mapGetters({
      mediaState: 'me/getMediaState',
      selectedChannelId: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('mediaPermissions');
    },

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

    isAllGranted() {
      return Object.values(this.mediaAccess).every(perm => perm === 'granted');
    },
  },

  watch: {
    async selectedChannelId(val) {
      if (val) {
        await this.askForPermission('microphone');

        if (this.mediaAccess.microphone === 'denied') {
          this.mode = 'microphone';
        }
      }
    },

    mode(val) {
      if (val) {
        this.focusWindow();
      }
    },

    'mediaState.microphone': {
      async handler(val) {
        if (val) {
          await this.askForPermission('microphone');

          if (this.mediaAccess.microphone === 'denied') {
            this.mode = 'microphone';
          }
        }
      },
    },

    'mediaState.camera': {
      async handler(val) {
        if (val) {
          await this.askForPermission('camera');

          if (this.mediaAccess.camera === 'denied') {
            this.mode = 'camera';
          }
        }
      },
    },

    'mediaState.screen': {
      async handler(val) {
        if (val) {
          await this.updateMediaAccessStatus();

          if (this.mediaAccess.screen === 'denied') {
            this.mode = 'screen';
          }
        }
      },
    },

    myId(id) {
      if (id) {
        this.tryToShow();
      }
    },

  },

  beforeDestroy() {
    this.stopUpdateMediaAccess();
  },

  methods: {
    async tryToShow() {
      if (this.myId) {
        await this.updateMediaAccessStatus();

        this.wasOnboardingShown = await heykaStore.get('onboardingPassed', false);

        if (!this.wasOnboardingShown && !this.isAllGranted) {
          this.mode = 'onboarding';
        }
      }
    },

    async askForPermission(mediaType) {
      const state = await window.ipcRenderer.invoke('remote-ask-for-media-access', mediaType);

      await this.updateMediaAccessStatus();

      return state;
    },

    async updateMediaAccessStatus() {
      this.mediaAccess = await window.ipcRenderer.invoke('remote-media-access-status');
      console.log('updateMediaAccessStatus', this.mediaAccess);
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
      if (IS_MAC) {
        const screens = await mediaCapturer.getSources('screen', 0);
        const stream = await mediaCapturer.getStream(screens[0].id);

        setTimeout(() => {
          mediaCapturer.destroyStream(stream);
        }, UPDATE_INTERVAL);
      }
    },

    startUpdateMediaAccess() {
      this.stopUpdateMediaAccess();
      updateTimer = setInterval(this.updateMediaAccessStatus, UPDATE_INTERVAL);
    },

    stopUpdateMediaAccess() {
      clearInterval(updateTimer);
      updateTimer = null;
    },

    closeHandler(skip = false) {
      this.mode = null;

      if (skip) {
        heykaStore.set('onboardingPassed', true);
      }

      this.stopUpdateMediaAccess();
    },

    focusWindow() {
      currentWindow.api('show');
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
    color var(--Font-primary)

    &__tint
      background rgba(0, 0, 0, 0.28)

    &__popup
      width 282px
      padding 24px
      border-radius 10px
      background var(--Background-darkgrey)
      box-shadow 0 20px 30px rgba(0, 0, 0, 0.2)
      box-sizing border-box

      h1
        text-align center
        font-weight 600
        font-size 18px
        line-height 24px

      h2
        text-align center
        font-weight 600
        font-size 14px
        line-height 22px
        margin-top 16px
        margin-bottom 8px

      &__sub-title, &__text
        line-height 20px
        font-size 12px
        margin-top 12px
        text-align center
        color var(--Font-secondary)
        padding 0 12px

      &__text
        line-height 22px
        margin-top 8px
        color var(--new-black)
        font-weight 400
        padding 0px

      &__close
        padding 0 0 7px 0
        margin-top -9px
        display flex

        svg
          width 18px
          height 18px
          color var(--Icon-secondary)
          margin-left auto
          margin-right -8px
          cursor pointer

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
            color var(--Icon-secondary)

        p
          font-weight 600
          line-height 22px

        .switch
          width auto
          margin-left auto

    &__skip
      margin-top 32px

    &__icon
      flex-shrink 0
      width 48px
      height 48px
      margin 0 auto
      border-radius 100%
      background var(--new-UI-06)
      display flex
      align-items center
      justify-content center

      svg
        width 22px
        height 22px
        color var(--Icon-secondary)

</style>
