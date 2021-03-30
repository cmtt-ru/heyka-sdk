<template>
  <div class="settings-page">
    <div class="settings__label">
      {{ texts.audioCategory }}
    </div>
    <ui-select
      v-model="selectedMicrophone"
      :data="devices.microphones"
      :label="texts.micLabel"
    />
    <progress-bar
      class="l-mt-8"
      :value="microphoneVolume"
    />

    <ui-select
      v-model="selectedSpeaker"
      :data="devices.speakers"
      :label="texts.speakersLabel"
    />
    <ui-button
      :type="1"
      class="test-sound-button"
      @click.native="playTestSound"
    >
      {{ texts.testSound }}
    </ui-button>

    <div class="settings__label">
      {{ texts.videoCategory }}
    </div>
    <ui-select
      v-model="selectedCamera"
      :data="devices.cameras"
      :label="texts.cameraLabel"
    />
  </div>
</template>

<script>

import UiButton from '@components/UiButton';
import { UiSelect } from '@components/Form';
import ProgressBar from '@components/ProgressBar';
import mediaDevices from '@sdk/classes/mediaDevices';
import microphone from '@sdk/classes/microphone';
import sounds from '@sdk/classes/sounds';

/**
 * DB compensator
 * @type {number}
 */
const DB_COMPENSATOR = 100;

export default {
  components: {
    UiSelect,
    UiButton,
    ProgressBar,
  },

  data() {
    return {
      microphoneVolume: 0,
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.devices');
    },

    /**
     * Device list
     * @returns {object}
     */
    devices() {
      return this.$store.getters['app/getDevices'];
    },

    /**
     * List of selected devices
     * @returns {object}
     */
    selectedDevices() {
      return this.$store.getters['app/getSelectedDevices'];
    },

    /**
     * Selected speaker model
     */
    selectedSpeaker: {
      get() {
        return this.selectedDevices.speaker;
      },
      set(value) {
        this.selectDevice('speaker', value);
      },
    },

    /**
     * Selected microphone model
     */
    selectedMicrophone: {
      get() {
        return this.selectedDevices.microphone;
      },
      set(value) {
        this.selectDevice('microphone', value);
      },
    },

    /**
     * Selected camera model
     */
    selectedCamera: {
      get() {
        return this.selectedDevices.camera;
      },
      set(value) {
        this.selectDevice('camera', value);
      },
    },
  },

  mounted() {
    microphone.listen('devices');
    microphone.on('volume-change', this.microphoneVolumeHandler);

    mediaDevices.startLinuxDeviceChangeTimer();
  },

  destroyed() {
    microphone.forget('devices');
    microphone.removeListener('volume-change', this.microphoneVolumeHandler);

    mediaDevices.stopLinuxDeviceChangeTimer();
  },

  methods: {
    /**
     * Play test sound
     * @returns {void}
     */
    playTestSound() {
      sounds.play('test-sound');
    },

    /**
     * Save selected devices
     * @param {string} device – device type
     * @param {string} deviceId – device id
     * @returns {void}
     */
    selectDevice(device, deviceId) {
      const data = { ...this.selectedDevices };

      data[device] = deviceId;

      this.$store.dispatch('app/setSelectedDevices', data);
    },

    microphoneVolumeHandler(db) {
      this.microphoneVolume = Math.max(0, db + Math.round(DB_COMPENSATOR));
    },
  },
};
</script>

<style scoped lang="stylus">

.settings-page
  padding 4px 16px 12px

.settings__label
  line-height 24px
  font-weight bold
  padding 8px 0

  &:not(:first-child)
    margin-top 24px

.test-sound-button
  margin 10px 0

.dropdown
  margin 6px 0

.switch
  padding 8px 0
</style>
