
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
    this.modalComponent.$on('confirm', (data) => {
      this.vueEventHandler('confirm', data);
    });
    this.modalComponent.$on('reject', (data) => {
      this.vueEventHandler('reject', data);
    });
    this.modalComponent.$on('close', (data) => {
      const amount = this.onCloseCallbacks.length;

      for (let i = 0; i < amount; i++) {
        this.vueEventHandler('close', data);
      }
    });
  }

  /**
    * Handle emitted event from Modal
    * event: 'confirm' | 'reject' | 'close'
    *
    * @param {string} event - event name
    * @param {object} data - any data
    * @returns {void}
  */
  vueEventHandler(event, data) {
    if (this.onCloseCallbacks[0]) {
      const callback = this.onCloseCallbacks.pop();

      callback(event, data);
      store.dispatch('app/removeModal');
    }
  }
}

export default new Modal();