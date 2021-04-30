<template>
  <div
    ref="list"
    class="list-view"
  >
    <slot />
    <div
      v-show="!noEmptyText && itemsAmount===0 && filterBy!==''"
      v-textfade
      class="no-results"
    >
      {{ noResultsString || $t('inputErrors.noResults') }} «{{ filterBy }}»
    </div>
  </div>
</template>

<script>
import { simpleMatchesFilter, matchesFilter, detectLang } from '@libs/texts';

/**
  * if list is longer than LONG_LIST,
  * or search string is longer than LONG_SEARCH_STRING,
  * fast search is conducted before long one
  */
const LONG_LIST = 200;
const LONG_SEARCH_STRING = 20;

export default {
  props: {
    /**
     * Array with items in list
     */
    items: {
      type: Array,
      default: () => [],
    },
    /**
     * Show only list-items that match this string by their filterKey
     */
    filterBy: {
      type: String,
      default: '',
    },
    /**
     * Show only list-items that match this string by their filterKey
     */
    filterKey: {
      type: String,
      default: null,
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

    /**
     * True if we shouldn't display "no results for X"
     */
    noEmptyText: {
      type: Boolean,
      default: false,
    },

  },
  data() {
    return {
      namesLang: [],
      itemsAmount: null,
      countResultsTimeout: null,
      selectedItems: {},
    };
  },

  computed: {
    /**
     * Compute search substring's language
     * @returns {object}
     */
    filterLang() {
      return detectLang(this.filterBy);
    },
  },

  watch: {
    filterBy() {
      clearTimeout(this.countResultsTimeout);
      this.sortBySimilarity();
    },

    items(val) {
      for (const item of val) {
        if (!this.namesLang[item[this.filterKey]]) {
          this.namesLang[item[this.filterKey]] = detectLang(item[this.filterKey]);
        }
      }

      this.sortBySimilarity();
    },
  },

  mounted() {
    this.sortBySimilarity();
    this.$on('selected', (selected, id, data, silent = false) => {
      this.selectedChild(selected, id, data, silent);
    });
  },

  methods: {

    async sortBySimilarity() {
      if (this.items.length === 0 || this.filterBy === '') {
        this.$emit('input', this.items);

        return;
      }

      if (this.items.length > LONG_LIST || this.filterBy.length > LONG_SEARCH_STRING) {
        this.match(this.fastMatchFilter);

        await new Promise(resolve => setTimeout(resolve, 0));
      }
      this.match(this.longMatchFilter);
    },

    match(matchFunc) {
      const sortedFilteredResults = this.items
        .map(el => matchFunc(el))
        .sort((a, b) => a.similarity - b.similarity);

      this.itemsAmount = sortedFilteredResults.filter(el => el.similarity !== Infinity).length;

      this.$emit('input', sortedFilteredResults);
    },

    fastMatchFilter(element) {
      const text = element[this.filterKey];
      const levenshteinDistance = simpleMatchesFilter(text, this.filterBy);

      return {
        ...element,
        similarity: levenshteinDistance,
      };
    },

    longMatchFilter(element) {
      const simpleRes = this.fastMatchFilter(element);

      if (simpleRes.similarity !== Infinity) {
        return simpleRes;
      }

      const text = element[this.filterKey];
      const lang = this.namesLang[element[this.filterKey]] || detectLang(element[this.filterKey]);

      const levenshteinDistance = matchesFilter(text, this.filterBy, lang, this.filterLang);

      return {
        ...element,
        similarity: levenshteinDistance,
      };
    },

    selectedChild(selected, id, data, silent = false) {
      if (!selected) {
        delete this.selectedItems[id];
      } else {
        this.selectedItems[id] = data;
      }

      if (!silent) {
        this.$emit('multipick', Object.values(this.selectedItems));
      }
    },

    selectAll() {
      for (const el of this.$children) {
        el.setSelected(true);
      }
      this.$emit('multipick', Object.values(this.selectedItems));
    },
    deselectAll() {
      for (const el of this.$children) {
        el.setSelected(false);
      }
      this.selectedItems = {};
      this.$emit('multipick', Object.values(this.selectedItems));
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
