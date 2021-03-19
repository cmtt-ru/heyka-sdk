
import store from '@/store';

/**
 * Singleton Modal
 */
 class Modal {
  constructor() {
    this.modalComponent = null;
    this.onCloseCallback = null;
  }
  show({ name, data, onClose }) {
    /* ... */
    store.dispatch('app/addModal', { name, data });
    this.onCloseCallback = onClose;
  }
  setModalComponent(vueComponent) {
    this.modalComponent = vueComponent;
    console.log(this.modalComponent);
    this.modalComponent.$on('confirm', () => { this.vueEventHandler('confirm')});
    this.modalComponent.$on('reject', () => { this.vueEventHandler('reject')});
    this.modalComponent.$on('close', () => { this.vueEventHandler('close')});
  }
  vueEventHandler(event) {
    console.log('vueEventHandler', event)
    if (event === 'confirm') {
      this.onCloseCallback(true);
    } else {
      this.onCloseCallback(false);
    }
    store.dispatch('app/removeModal');
  }
}

export default new Modal()