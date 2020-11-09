<template>
  <div
    ref="list"
    class="list-view"
  >
    <slot />
    <div
      v-show="itemsAmount===0"
      class="no-results"
    >
      {{ noResultsString }}
    </div>
  </div>
</template>

<script>
import { debounce } from 'throttle-debounce';
const DEBOUNCE_TIMEOUT = 20;

export default {
  props: {
    /**
     * Show only list-items that match this string by their filterKey
     */
    filterBy: {
      type: String,
      default: '',
    },
    /**
     * Text to display if no results were found
     */
    noResultsString: {
      type: String,
      default: 'No results found!',
    },
    /**
     * Determine if list's items can be selected
     */
    selectable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      itemsAmount: null,
      countResults: null,
    };
  },

  mounted() {
    this.countResults = debounce(DEBOUNCE_TIMEOUT, false, function () {
      this.itemsAmount = this.$children.filter(el => el.matches).length;
    });

    this.$on('selected', this.selectedChildren);
    this.$on('match-results', this.countResults);
  },

  methods: {

    /**
     * Gather all list-items that have prop "selected"
     * @returns {array} keys of selected items
     */
    selectedChildren() {
      const selectedArray = this.$children.filter(el => el.selected).map(el => el.filterKey); // TODO: mb some kind of "multiPickData, not filterKey"

      this.$emit('multipick', selectedArray);
    },
  },

};
</script>

<style lang="stylus" scoped>
  .list-view
    width 100%

  .no-results
    height 28px
    padding 6px 8px
    box-sizing border-box
</style>
