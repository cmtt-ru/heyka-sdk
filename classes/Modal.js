
import store from '@/store';

/**
 * Singleton Modal
 */
class Modal {
  /**
    * Modal init
    * create array for future close callbacks
    *
    * @returns {void}
  */
  constructor() {
    this.modalComponent = null;
    this.onCloseCallbacks = [];
  }

  /**
    * Show new Modal: add it to vuex store and save close callback
    *
    * @param {object} { name - Template name, data - any data for template, onClose - close callback}
    * @returns {void}
  */
  show({ name, data, onClose }) {
    store.dispatch('app/addModal', {
      name,
      data,
    });
    this.onCloseCallbacks.push(onClose);
  }

  /**
    * Save Modal component and listen to callbacks on it
    *
    * @param {object} vueComponent - Modal component
    * @returns {void}
  */
  setModalComponent(vueComponent) {
    this.modalComponent = vueComponent;
    this.modalComponent.$on('confirm', () => {
      this.vueEventHandler('confirm');
    });
    this.modalComponent.$on('reject', () => {
      this.vueEventHandler('reject');
    });
    this.modalComponent.$on('close', () => {
      this.vueEventHandler('close');
    });
  }

  /**
    * Handle emitted event from Modal
    * event: 'confirm' | 'reject' | 'close'
    *
    * @param {string} event - event name
    * @returns {void}
  */
  vueEventHandler(event) {
    const callback = this.onCloseCallbacks.pop();

    if (event === 'confirm') {
      callback(true);
    } else {
      callback(false);
    }
    store.dispatch('app/removeModal');
  }
}

export default new Modal();