<template>
  <div
    ref="list"
    class="list-view"
  >
    <slot />
    <div
      v-show="itemsAmount===0"
      v-textfade
      class="no-results"
    >
      {{ noResultsString || $t('inputErrors.noResults') }} «{{ filterBy }}»
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-magic-numbers
const CHECK_TIMEOUTS = [10, 10, 30, 50, 900];

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
      default: null,
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
      countResultsTimeout: null,
    };
  },

  watch: {
    filterBy() {
      clearTimeout(this.countResultsTimeout);
      this.countResults([ ...CHECK_TIMEOUTS ]);
    },
  },

  mounted() {
    this.$on('selected', this.selectedChildren);
  },

  methods: {

    countResults(timeouts) {
      if (timeouts.length === 0) {
        return;
      }

      const timeout = timeouts.shift();

      this.countResultsTimeout = setTimeout(() => {
        this.itemsAmount = this.$children.filter(el => el.matches).length;
        this.countResults(timeouts);
      }, timeout);
    },

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
