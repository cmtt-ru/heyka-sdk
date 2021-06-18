<template>
  <div class="modal-wrapper">
    <div class="header">
      {{ data.header }}
    </div>
    <ui-form
      @submit="next"
    >
      <div>
        <div class="input-label">
          {{ $t('modal.common.name') }}
        </div>
        <ui-input
          v-model="name"
          :regex="newNameRegex"
          :regex-error="data.errorString"
          required
          :minlength="2"
          enter-submit
          clearable
        />
      </div>

      <div class="buttons">
        <ui-button
          :type="1"
          submit
        >
          {{ $t('techTexts.next') }}
        </ui-button>
      </div>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';

import Modal from '@sdk/classes/Modal';

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
      * RegEx 'not any of these strings'
      *
      * @returns {RegEx}
    */
    newNameRegex() {
      const groupNamesString = this.data.groupNames.join('|');

      return new RegExp(`^(?!(${groupNamesString})$).*`);
    },
  },

  methods: {
    next() {
      Modal.show({
        name: 'NewGroupUsers',
        data: {
          header: this.$tc('modal.addGroup.header2', this.name),
          joinedUsers: this.data.joinedUsers || [],
          backIcon: true,
        },
        onClose: (status, data) => {
          if (status === 'confirm') {
            this.$emit('confirm', {
              name: this.name,
              users: data,
            });
          }
        },
      });
    },
  },

};
</script>

<style lang="stylus" scoped>
@import 'default.styl'
</style>
