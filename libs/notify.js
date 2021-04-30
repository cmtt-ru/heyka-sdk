import store from '@/store';
import i18n from '@sdk/translations/i18n';

/**
 * Show notification
 * @param {string} i18nKey – key for i18n language object
 * @param {object} options – options for notifications
 * @returns {function} — function used to hide notification
 */
export default async function showNotify(i18nKey, options = {}) {
  const buttons = options.buttons;
  const icon = options.icon;

  const notification = {
    data: {
      text: translate(i18nKey),
    },
    ...options,
  };

  /**
   * Move some keys to data object
   */
  delete options.buttons;
  delete options.icon;

  if (buttons) {
    notification.data.buttons = buttons;

    notification.data.buttons.forEach(button => {
      button.text = translate(button.text);
    });
  }

  if (icon) {
    notification.data.icon = icon;
  }

  /**
   * Show notification and save its id
   * @type {string}
   */
  const notificationId = await store.dispatch('app/addNotification', notification);

  return function () {
    store.dispatch('app/removeNotification', notificationId);
  };
}

/**
 * Returns translation or text
 * @param {string} keyOrText – i18n key or some text
 * @returns {string | VueI18n.LocaleMessages}
 */
function translate(keyOrText) {
  return i18n.t(keyOrText) || keyOrText;
}
