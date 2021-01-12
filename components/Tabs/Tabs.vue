<template>
  <div class="ui-tabs">
    <div
      ref="tabs"
      class="ui-tabs__nav scroll scroll--vh"
      @mousedown="mouseDownHandler"
    >
      <div class="ui-tabs__nav__inner">
        <ui-button
          v-for="tab in tabs"
          :key="tab.name"
          :type="15"
          :active="tab.name === selectedTabName"
          @click="selectTab(tab.name)"
        >
          {{ tab.name }}
        </ui-button>
      </div>
    </div>

    <div class="ui-delimiter" />

    <div class="ui-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

let pos = {
  x: 0,
  left: 0,
};

export default {
  components: {
    UiButton,
  },

  props: {

  },

  data() {
    return {
      selectedTabName: null,
      tabs: [],
    };
  },

  mounted() {
    this.tabs = this.$children.map(c => {
      if (c.selected) {
        this.selectedTabName = c.name;
      }

      return {
        name: c.name,
        selected: c.selected,
      };
    });

    if (!this.selectedTabName) {
      this.selectTab(this.tabs[0].name);
    }

    this.selectTab(this.selectedTabName);
  },

  beforeDestroy() {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
  },

  methods: {
    /**
     * Select tab by tab name
     * @param {string} name – tab name
     * @returns {void}
     */
    selectTab(name) {
      this.selectedTabName = name;

      this.$children.forEach(tab => {
        tab.isSelected = tab.name === name;
      });
    },

    mouseDownHandler(event) {
      this.$refs.tabs.style.cursor = 'grabbing';
      this.$refs.tabs.style.userSelect = 'none';
      pos = {
        left: this.$refs.tabs.scrollLeft,
        x: event.clientX,
      };
      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseup', this.mouseUpHandler);
    },

    mouseMoveHandler(event) {
      const dx = event.clientX - pos.x;

      this.$refs.tabs.scrollLeft = pos.left - dx;
    },

    mouseUpHandler(event) {
      this.$refs.tabs.style.removeProperty('cursor');
      this.$refs.tabs.style.removeProperty('user-select');

      document.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener('mouseup', this.mouseUpHandler);
    },
  },
};
</script>

<style scoped lang="stylus">
  .ui-tabs
    &__nav
      margin-bottom 5px
      padding-bottom 7px
      scroll-behavior auto

      &__inner
        display flex
        flex-direction row
        background var(--new-UI-06)
        border-radius 100px
        padding 4px
        width max-content

      & .ui-button
        flex-shrink 0

    &__content
      padding 0
</style>
