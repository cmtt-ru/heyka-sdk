<template>
  <div class="modal-wrapper">
    <div class="header">
      {{ data.header }}
    </div>
    <div class="body">
      {{ data.body }}
    </div>
    <ui-form
      @submit="$emit('confirm')"
    >
      <div v-if="data.confirmString">
        <div class="input-label">
          {{ $t('modal.common.name') }}
        </div>
        <ui-input
          v-model="name"
          required
          clearable
          :regex="confirmRegex"
          :regex-error="data.errorString"
          enter-submit
        />
      </div>

      <div class="buttons">
        <ui-button
          :type="2"
          @click="$emit('reject')"
        >
          {{ $t('techTexts.cancel') }}
        </ui-button>
        <ui-button
          :type="12"
          submit
        >
          {{ $t('techTexts.delete') }}
        </ui-button>
      </div>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  props: {
    /**
      * Inner data
    */
    data: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      name: '',
    };
  },

  computed: {
    /**
      * RegEx with full match
      *
      * @returns {RegEx}
    */
    confirmRegex() {
      return new RegExp(`^${this.data.confirmString}$`);
    },
  },

};
</script>

<style lang="stylus" scoped>
@import 'default.styl'
</style>
