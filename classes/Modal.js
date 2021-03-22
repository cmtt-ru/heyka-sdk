
import store from '@/store';

/**
 * Singleton Modal
 */
 class Modal {
  constructor() {
    this.modalComponent = null;
    this.onCloseCallbacks = [];
  }
  show({ name, data, onClose }) {
    /* ... */
    store.dispatch('app/addModal', { name, data });
    this.onCloseCallbacks.push(onClose);
  }
  setModalComponent(vueComponent) {
    this.modalComponent = vueComponent;
    this.modalComponent.$on('confirm', () => { this.vueEventHandler('confirm')});
    this.modalComponent.$on('reject', () => { this.vueEventHandler('reject')});
    this.modalComponent.$on('close', () => { this.vueEventHandler('close')});
  }
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

export default new Modal()