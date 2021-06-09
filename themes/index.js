/* eslint-disable no-magic-numbers */
/* eslint-disable require-jsdoc */
import Vue from 'vue';
import themes from './themes.json';
import vuex from '@/store';
import { heykaStore } from '@/store/localStore';

/**
 * A class that handles themes
 */
class Themes {
  /**
 * Inits first theme
 * @returns {void}
 */
  constructor() {
    /* Vue for data reactivity */
    this.storeVue = new Vue({
      data: () => ({
        themeArray: [],
        currentTheme: '',
        auto: false,
      }),
    });
    this.storeVue.themeArray = themes;

    /* Get current theme and auto mode from local store */
    const theme = heykaStore.getSync('theme', {
      name: 'light',
      auto: true,
    });

    this.storeVue.auto = theme.auto;
    this.storeVue.currentTheme = theme.name;

    if (theme.auto) {
      this.autoSetTheme();
    } else {
      this.manualSetTheme(theme.name);
    }

    /* Listen to native theme update (in case we have automode on) */
    window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
      if (this.storeVue.auto) {
        this.autoSetTheme();
      }
    });
  }

  /**
   * Set theme depending on user's system preference
   * @returns {void}
   */
  autoSetTheme() {
    this.storeVue.auto = true;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.__setTheme('dark');
    } else {
      this.__setTheme('light');
    }
  }

  /**
   * Set theme manually by name
   * @param {string} name theme's name
   * @returns {void}
   */
  manualSetTheme(name) {
    this.storeVue.auto = false;
    this.__setTheme(name);
  }

  /**
 * Switch theme to selected
 * @param {string} name name of theme
 * @returns {boolean} found or not found theme
 */
  __setTheme(name) {
    this.storeVue.currentTheme = name;
    heykaStore.set('theme', {
      name: this.storeVue.currentTheme,
      auto: this.storeVue.auto,
    });

    // set localStorage for wireframe in index.html
    localStorage.themeName = this.storeVue.currentTheme;

    vuex.commit('app/SET_THEME', {
      name: this.storeVue.currentTheme,
      auto: this.storeVue.auto,
    });
    if (Object.prototype.hasOwnProperty.call(this.storeVue.themeArray, name)) {
      for (const prop in this.storeVue.themeArray[name].colors) {
        document.documentElement.style.setProperty(prop, this.storeVue.themeArray[name].colors[prop]);
        this.setHoverVar(prop, this.storeVue.themeArray[name].colors[prop]);
        this.setActiveVar(prop, this.storeVue.themeArray[name].colors[prop]);
      }

      return true;
    } else {
      return false;
    }
  }

  setHoverVar(name, hex) {
    let r = 0,
        g = 0,
        b = 0;

    // 3 digits
    if (hex.length == 4) {
      r = '0x' + hex[1] + hex[1];
      g = '0x' + hex[2] + hex[2];
      b = '0x' + hex[3] + hex[3];

    // 6 digits
    } else if (hex.length == 7) {
      r = '0x' + hex[1] + hex[2];
      g = '0x' + hex[3] + hex[4];
      b = '0x' + hex[5] + hex[6];
    }

    document.documentElement.style.setProperty(`${name}-hover`, 'rgba(' + +r + ',' + +g + ',' + +b + ',0.9)');
  }

  setActiveVar(name, hex) {
    // Convert hex to RGB first
    let r = 0,
        g = 0,
        b = 0;

    if (hex.length == 4) {
      r = '0x' + hex[1] + hex[1];
      g = '0x' + hex[2] + hex[2];
      b = '0x' + hex[3] + hex[3];
    } else if (hex.length == 7) {
      r = '0x' + hex[1] + hex[2];
      g = '0x' + hex[3] + hex[4];
      b = '0x' + hex[5] + hex[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;

    let h = 0,
        s = 0,
        l = 0;

    if (delta == 0) {
      h = 0;
    } else if (cmax == r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax == g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
      h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(Math.min(l * 110, 100)).toFixed(1);

    document.documentElement.style.setProperty(`${name}-active`, 'hsl(' + h + ',' + s + '%,' + l + '%)');
  }

  /**
 * Get StyleSheet for specific layout area
 * @param {string} area name of area (navbar/content/popover/etc.)
 * @returns {object}
 */
  getColors(area) {
    if (this.storeVue.currentTheme) {
      return this.storeVue.themeArray[this.storeVue.currentTheme].colors[area];
    }

    return {};
  }

  /**
 * Get all app themes
 * @returns {array} all themes
 */
  getThemes() {
    return this.storeVue.themeArray;
  }

  /**
   * Get current theme name
   * @returns {string}
   */
  getCurrentTheme() {
    return this.storeVue.currentTheme;
  }

  /**
   * Get theme's automode state
   * @returns {boolean}
   */
  getCurrentAuto() {
    return this.storeVue.auto;
  }
}

export default new Themes();
