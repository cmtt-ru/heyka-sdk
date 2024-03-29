<template>
  <div class="container">
    <div
      class="input-wrapper"
      :class="{'input-wrapper--disabled': disabled, 'ui-error': errorText}"
    >
      <svg-icon
        v-if="icon"
        class="input__icon"
        :name="icon"
        size="large"
      />

      <input
        ref="input"
        v-model="localValue"
        :type="localType"
        class="input"
        :class="{'input--with-icon': icon, 'input--with-eye': isPass , 'input--with-clear': clearable}"
        :placeholder="placeholder"
        :readonly="readonly"
        context-menu
        @input="debounceCheck"
        @click="trySelectingAll"
        @keyup.enter="submitHandler"
      >
      <svg-icon
        v-if="isPass"
        class="input__right-icon"
        :name="eyeIcon"
        size="medium"
        @click.native.stop="passIconClickHandler()"
      />
      <svg-icon
        v-if="clearable && value"
        class="input__right-icon input__right-icon--clear"
        name="clear"
        :width="18"
        :height="18"
        @click.native.stop="clearHandler()"
      />
    </div>
    <div
      v-if="errorText"
      class="error-text"
    >
      {{ errorText }}
    </div>
  </div>
</template>

<script>
import { debounce } from '@libs/throttle-debounce';
import { v4 as uuid4 } from 'uuid';
const CHECK_DELAY = 500;
const NUMBER_REGEXP = /^\d*$/;
// eslint-disable-next-line no-useless-escape
const EMAIL_REGEXP = /^[a-z0-9]([a-z0-9_.\-]*)@([a-z0-9.\-]+)([.][a-z]{2,})$/i;
const NO_EMOJI_REGEXP = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

export default {

  props: {

    /**
     * Input's value
     */
    value: {
      type: String,
      default: '',
    },

    /**
     * Input's placeholder
     */
    placeholder: {
      type: String,
      default: '',
    },

    /**
     * Input's icon
     */
    icon: {
      type: String,
      default: null,
    },

    /**
     * Is textarea?
     */
    textarea: {
      type: Boolean,
      default: false,
    },

    /**
     * true if need to display cross to the right of input
     */
    clearable: {
      type: Boolean,
      default: false,
    },

    /**
     * Make input inactive
     */
    disabled: {
      type: Boolean,
      default: false,
    },

    /**
     * Make input readonly
     */
    readonly: {
      type: Boolean,
      default: false,
    },

    /**
     * Make input lowercase-only
     */
    lowercase: {
      type: Boolean,
      default: false,
    },

    /**
     * type of unput
     */
    type: {
      type: String,
      default: 'text',
    },

    /**
     * false if check only on submit
     */
    checkOnInput: {
      type: Boolean,
      default: false,
    },

    /**
     * true if field is required
     */
    required: {
      type: Boolean,
      default: false,
    },

    /**
     * min length of input text
     */
    minlength: {
      type: Number,
      default: null,
    },

    /**
     * max length of input text
     */
    maxlength: {
      type: Number,
      default: null,
    },

    /**
     * true if only numbers are allowed
     */
    numbers: {
      type: Boolean,
      default: false,
    },

    /**
     * true if must be email
     */
    email: {
      type: Boolean,
      default: false,
    },

    /**
     * custom regExp for input to match
     */
    regex: {
      type: RegExp,
      default: null,
    },

    /**
     * error text for custom regExp
     */
    regexError: {
      type: String,
      default: null,
    },

    /**
     * error text from backend
     */
    backendError: {
      type: String,
      default: null,
    },

    /**
     * true if we need to submit form on enter
     */
    enterSubmit: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      id: uuid4(),
      validate: (!!this.required || !!this.minlength || !!this.maxlength || this.numbers || this.email || !!this.regex),
      errorText: null,
      passVisible: false,
    };
  },

  computed: {

    localValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('inputErrors');
    },

    isPass() {
      return this.type === 'password';
    },

    eyeIcon() {
      if (this.passVisible) {
        return 'eye-closed';
      }

      return 'eye';
    },

    localType() {
      if (this.isPass) {
        if (this.passVisible) {
          return 'text';
        }

        return 'password';
      }

      return this.type;
    },

    /**
     * Debounce checking errors in input on symbols enter
     * @returns {void}
     */
    debounceCheck: function () {
      return debounce(CHECK_DELAY, false, () => {
        this.checkErrors();
      });
    },

  },

  watch: {
    backendError() {
      this.debounceCheck.clear();
      this.checkErrors(this.localValue, true);
    },
  },

  mounted() {
    if (this.lowercase) {
      this.$refs.input.addEventListener('keyup', this.toLowerCase);
    }
  },

  beforeDestroy() {
    if (this.lowercase) {
      this.$refs.input.removeEventListener('keyup', this.toLowerCase);
    }
  },

  methods: {
    /**
     * Focus cursor on input
     * @returns {void}
     */
    focusInput() {
      this.$refs.input.focus();
    },

    passIconClickHandler() {
      this.passVisible = !this.passVisible;
      this.focusInput();
    },

    clearHandler() {
      this.localValue = '';
      this.$refs.input.blur();
    },

    trySelectingAll(event) {
      if (this.readonly) {
        event.target.select();
      }
    },

    toLowerCase() {
      this.$nextTick(() => {
        this.localValue = this.localValue.toLowerCase();
      });
    },

    /**
     * Check input for validation errors
     * Also, edit error text accordingly
     *
     * @param {string} text - text in input
     * @param {boolean} externalCheck - true if function was called outside (from UiForm.vue)
     * @returns {boolean} true if found any errors
     */
    checkErrors(text = this.localValue, externalCheck = false) {
      if (this.validate === false) {
        return;
      }
      this.errorText = null;
      const errors = [];

      // this.localValue = this.localValue.toLowerCase();

      if (externalCheck) {
        this.debounceCheck.clear();
        this.localValue = this.localValue.trim();
      } else if (!this.checkOnInput) {
        this.$parent.$emit('ui-error', this.id, false);

        return;
      }
      text = text.replace(NO_EMOJI_REGEXP, '').trim();

      this.localValue = text;

      if (text.length === 0) {
        const res = this.checkEmpty();

        return res;
      }
      if (this.minlength && this.minlength > text.length) {
        errors.push(`${this.$tc('inputErrors.minlength', this.minlength)}`);
      } else if (this.maxlength && this.maxlength < text.length) {
        errors.push(`${this.$tc('inputErrors.maxlength', this.maxlength)}`);
      }
      if (this.numbers && NUMBER_REGEXP.test(text) === false) {
        errors.push(this.texts['numbers']);
      }
      if (this.email && EMAIL_REGEXP.test(text) === false) {
        errors.push(this.texts['email']);
      }
      if (this.regex && this.regex.test(text) === false) {
        errors.push(this.regexError || this.texts['default']);
      }
      if (this.backendError) {
        errors.push(this.backendError || this.texts['defaultBackend']);
      }

      if (errors.length > 0) {
        this.errorText = errors.join('\n');
        this.$parent.$emit('ui-error', this.id, true);

        return true;
      } else {
        this.$parent.$emit('ui-error', this.id, false);

        return false;
      }
    },

    /**
     * Check if input is empty and required
     *
     * @returns {boolean}
     */
    checkEmpty() {
      if (this.required === true) {
        this.errorText = this.texts['required'];
        this.$parent.$emit('ui-error', this.id, true);

        return true;
      } else {
        this.$parent.$emit('ui-error', this.id, false);

        return false;
      }
    },

    /**
     * Submit on enter if such flag is provided
     *
     * @returns {void}
     */
    submitHandler() {
      if (this.enterSubmit === true) {
        this.debounceCheck.clear();
        this.$parent.$emit('ui-submit');
      }
    },

  },

};
</script>

<style lang="stylus" scoped>
.container
  width 100%

.input-wrapper
  width 100%
  position relative
  display flex
  flex-direction row
  align-items center
  background var(--Background-grey)
  border 1px solid var(--UI-divider-2)
  border-radius 6px
  box-sizing border-box

  &:hover
    background var(--Background-darkgrey-hover)

  &:focus-within
    border-color var(--UI-active)
    background var(--Background-darkgrey)

  &--disabled
    background var(--Background-darkgrey)
    pointer-events none

    & .input
      opacity 0.5

.input
  width 100%
  min-height 34px
  padding 0 12px
  box-sizing border-box
  border none
  background-color transparent
  font-family Inter, sans-serif
  font-size 15px
  line-height 18px
  color var(--Text-primary)
  outline none !important

  &::placeholder
    color var(--Text-secondary)
    font-weight normal

  &__icon
    position absolute
    top 0
    bottom 0
    margin auto 0
    left 6px
    color var(--UI-active)
    pointer-events none

  &__right-icon
    position absolute
    top 0
    bottom 0
    margin auto 0
    right 8px
    cursor pointer
    color var(--Text-secondary)

    &--clear
      right 17px

  &--with-icon
    padding-left 34px

  &--with-eye
    padding-right 30px

  &--with-clear
    padding-right 40px

.ui-error
  border-color var(--UI-error)

.error-text
  color var(--UI-error)
  font-size 12px
  line-height 18px
  min-height 16px
  padding-top 8px
  display flex
  flex-direction column
  justify-content center
  align-items flex-start
  white-space pre-line
</style>
