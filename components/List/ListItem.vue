<template>
  <div
    v-if="similarity!==Infinity"
    class="list-item"
    :class="{'list-item--selected': selected}"
    @click="clickHandler()"
  >
    <slot />
  </div>
</template>

<script>
import { v4 as uuidV4 } from 'uuid';
export default {

  props: {
    /**
     * data to select if multipick
     */
    selectData: {
      type: Object,
      default: () => {},
    },
    /**
     * levenshtein distance (for search)
     */
    similarity: {
      type: Number,
      default: 0,
    },
    /**
     * Info to store if list is selectable and item was selected
     */
    selectableContent: {
      type: Object,
      default: () => null,
    },
  },

  data: function () {
    return {
      /**
     * Whether item is selected (for multi pick, eg. when sending invites to multiple people)
     */
      selected: false,
      id: uuidV4(),
    };
  },

  methods: {
    /**
     * Change 'selected' state
     * @returns {string}
     */
    clickHandler() {
      if (!this.$parent.selectable) {
        return;
      }
      this.selected = !this.selected;
      this.$parent.$emit('selected', this.selected, this.id, this.selectData);
    },

    /**
     * Change 'selected' state from parent (for "[de]select all" functionality)
     *
     * @param {boolean} value select/deselect
     * @returns {string}
     */
    setSelected(value) {
      this.selected = value;
      this.$parent.$emit('selected', value, this.id, this.selectData, true);
    },
  },

};
</script>

<style lang="stylus" scoped>
.list-item
  display flex
  flex-direction row
  justify-content flex-start
  align-items center
  border-radius 4px
  box-sizing border-box

  &--selected
    background-color var(--new-signal-02-1)
</style>
