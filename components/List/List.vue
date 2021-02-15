<template>
  <div
    ref="list"
    class="list-view"
  >
    <slot />
    <div
      v-show="itemsAmount===0 && filterBy!==''"
      v-textfade
      class="no-results"
    >
      {{ noResultsString || $t('inputErrors.noResults') }} «{{ filterBy }}»
    </div>
  </div>
</template>

<script>
import { simpleMatchesFilter, matchesFilter, detectLang } from '@libs/texts';

// eslint-disable-next-line no-magic-numbers
// const CHECK_TIMEOUTS = [10, 10, 30, 50, 900];

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
    this.$on('selected', (id, data) => {
      this.selectedChild(id, data);
    });
  },

  methods: {

    async sortBySimilarity() {
      if (this.items.length === 0 || this.filterBy === '') {
        this.$emit('input', this.items);
      }

      this.match(this.fastMatchFilter);

      await new Promise(resolve => setTimeout(resolve, 0));

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

    selectedChild(id, data) {
      if (this.selectedItems[id]) {
        delete this.selectedItems[id];
      } else {
        this.selectedItems[id] = data;
      }

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
