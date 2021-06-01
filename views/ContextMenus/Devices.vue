<template>
  <popover
    class="device-popover-wrapper"
  >
    <devices class="device-popover" />
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import Devices from '@sdk/views/Settings/Devices';

export default {
  components: {
    Popover,
    Devices,
  },
};
</script>

<style lang="stylus" scoped>

.device-popover
  width 300px
  height 275px

  @media $mobile
    width calc(100vw - 32px)
    height 275px

    /deep/ .dropdown__header
      max-width 300px
</style>
