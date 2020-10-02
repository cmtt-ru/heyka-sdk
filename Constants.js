const IS_DEV = process.env.NODE_ENV === 'development';
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';
let IS_ELECTRON = false;

// global variables
if (typeof window !== 'undefined') {
  window.IS_DEV = IS_DEV;
  window.IS_WIN = IS_WIN;
  window.IS_MAC = IS_MAC;
  window.IS_LINUX = IS_LINUX;
  IS_ELECTRON = Boolean(window && window.process && window.process.type);
  window.IS_ELECTRON = IS_ELECTRON;
}

// Base urls
let API_URL;
let WEB_URL;

if (IS_ELECTRON || location.hostname === 'localhost') {
  API_URL = IS_DEV ? process.env.VUE_APP_API_DEV_URL : process.env.VUE_APP_API_PROD_URL;
  WEB_URL = IS_DEV ? process.env.VUE_APP_WEB_DEV_URL : process.env.VUE_APP_WEB_PROD_URL;
} else if (location.hostname === 'heyka.app') {
  API_URL = 'https://api.heyka.app';
  WEB_URL = 'https://heyka.app';
} else {
  // It's supposed, that the domain name is (back/web)-(dev/stage).dev.k8s.heyka.io
  WEB_URL = location.origin;
  API_URL = location.origin.replace('back', 'web');
}

module.exports = {
  IS_DEV,
  IS_WIN,
  IS_MAC,
  IS_LINUX,
  IS_ELECTRON,

  API_URL,
  WEB_URL,
};
