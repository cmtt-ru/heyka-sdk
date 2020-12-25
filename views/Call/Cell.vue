
<template>
  <div
    v-for="(user, index) in users"
    :key="user.id"
    class="cell"
    :style="cellDimensions(index)"
  >
    <div
      v-show="handUpStatus(user.id)>mountedTimestamp-5000"
      :key="handUpStatus(user.id)"
      class="cell__raised-hand"
    />
    <div
      class="cell__inner"
      @dblclick="expandedClickHandler(user.id)"
    >
      <video
        v-show="videoStreams[user.id]"
        :ref="`video${user.id}`"
        class="cell__feed"
        :class="{ 'cell__feed--flip': user.camera && user.id === myId }"
      />
      <div
        v-show="user.speaking && user.microphone"
        class="cell__talking"
      />

      <ui-button
        :key="hasVideo(user.id)"
        v-popover.click="{name: 'GridUser', data: {userId: user.id, isStreaming: hasVideo(user.id)}}"
        class="badge badge--hidden cell__more"
        :type="7"
        size="medium"
        :height="40"
        icon="more"
      />

      <div
        v-tooltip="'Unstable connection'"
        class="cell__aqi"
        :data-status="audioQualityStatus(user.id)"
      >
        <span />
        <span />
        <span />
        <span />
      </div>

      <avatar
        v-show="!user.camera && !user.screen"
        class="cell__avatar"
        :image="userAvatar(user, 192)"
        :user-id="user.id"
        :size="192"
        square
      />

      <div
        class="badge cell__username"
        :class="{'cell__username--hidden': user.camera}"
      >
        <div v-textfade>
          {{ user.name }}
        </div>
        <div
          v-if="user.id === myId"
          class="cell__username__you"
        >
          {{ texts.you }}
        </div>
        <svg-icon
          v-if="!user.microphone"
          class="cell__username__mic-off"
          name="mic-off"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
// import broadcastEvents from '@sdk/classes/broadcastEvents';
// import { mapGetters, mapState } from 'vuex';

export default {
  components: {
    UiButton,
    Avatar,
  },
  data() {
    return {

    };
  },
  computed: {

  },
  watch: {

  },

  /**
   * Subscribe for:
   * 1. blur/focus window events for hiding/showing call controls
   * 2. custom "grid" event for routing to grid
   * @returns {void}
   */
  mounted() {

  },

  beforeDestroy() {

  },

  destroyed() {

  },

  methods: {

  },
};
</script>

<style lang="stylus" scoped>

</style>
