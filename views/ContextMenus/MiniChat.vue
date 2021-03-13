<template>
  <popover class="mini-chat-popover">
    <mini-chat />
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import MiniChat from '@components/MiniChat';

export default {
  components: {
    MiniChat,
    Popover,
  },
};
</script>

<style lang="stylus">
.mini-chat-popover
  border-radius 12px
  overflow hidden
</style>
