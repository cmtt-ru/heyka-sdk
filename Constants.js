let IS_DEV = process.env.NODE_ENV === 'development';
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';
const IS_IOS = typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
let IS_ELECTRON = false;

// global variables
if (typeof window !== 'undefined') {
  window.IS_DEV = IS_DEV;
  window.IS_WIN = IS_WIN;
  window.IS_MAC = IS_MAC;
  window.IS_LINUX = IS_LINUX;
  IS_ELECTRON = Boolean(window && window.process && window.process.type);
  window.IS_ELECTRON = IS_ELECTRON;
  window.IS_IOS = IS_IOS;
}

if (IS_ELECTRON) {
  let heykaStore;

  try {
    heykaStore = require('../renderer/store/localStore').default;
  } catch (e) {
    console.error(e);
  }
  const forceDevServer = heykaStore.get('devServer') || false;

  if (forceDevServer) {
    IS_DEV = true;
    window.IS_DEV = IS_DEV;
  }
}

// Base urls
let API_URL;
let WEB_URL;
let COOKIE_URL;

if (IS_ELECTRON) {
  API_URL = IS_DEV ? process.env.VUE_APP_API_DEV_URL : process.env.VUE_APP_API_PROD_URL;
  WEB_URL = IS_DEV ? process.env.VUE_APP_WEB_DEV_URL : process.env.VUE_APP_WEB_PROD_URL;
} else if (typeof window !== 'undefined') {
  if (window.location.hostname === 'heyka.app') {
    API_URL = 'https://api.heyka.app';
    WEB_URL = 'https://heyka.app';
  } else if (window.location.hostname === 'localhost') {
    API_URL = IS_DEV ? process.env.VUE_APP_API_DEV_URL : process.env.VUE_APP_API_PROD_URL;
    WEB_URL = IS_DEV ? process.env.VUE_APP_WEB_DEV_URL : process.env.VUE_APP_WEB_PROD_URL;
  } else {
    // It's supposed, that the domain name is (back/web)-(dev/stage).dev.k8s.heyka.io
    WEB_URL = window.location.origin;
    API_URL = window.location.origin.replace('web', 'back');
  }
}

if (API_URL) {
  COOKIE_URL = API_URL.split('.').splice(-2)
    .join('.');
}

module.exports = {
  IS_DEV,
  IS_WIN,
  IS_MAC,
  IS_LINUX,
  IS_ELECTRON,
  IS_IOS,

  API_URL,
  WEB_URL,
  COOKIE_URL,
};
