import Vue from 'vue';
import router from '@/router';
import store from '@/store';
import i18n from '@sdk/translations/i18n';
import { createPopper } from '@popperjs/core';
import Permissions from '@sdk/classes/permissions';

/**
 * @typedef {object} PopoverModes
 * @property {boolean} click – click mode
 * @property {boolean} hover – hover mode
 * @property {boolean} mouse – mouse mode
 * @property {boolean} right – right mouse button mode
 */

/**
 * Left mouse button
 * @type {number}
 */
const LEFT_MOUSE = 1;

/**
 * Right mouse button
 * @type {number}
 */
const RIGHT_MOUSE = 3;

/**
 * Default popper options
 * @type {object}
 */
const DEFAULT_POPPER_OPTIONS = {
  /* nothing yet here */
  modifiers: [
    {
      name: 'offset',
      options: {
        // eslint-disable-next-line no-magic-numbers
        offset: [0, 4],
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: 8,
      },
    },
  ],
};

/**
 * Active class when popover opened
 * @type {string}
 */
const ACTIVE_CLASS = 'popover--opened';

/**
 * Max number for unique id
 * @type {number}
 */
const UID_MAX = 1000000;

/**
 * Wait before destroy popover
 * @type {number}
 */
const TIMEOUT_BEFORE_DESTROY = 70;

/**
 * Hover delay
 * @type {number}
 */
const HOVER_DELAY = 70;

/**
 * Disable hover delay for fast moving cursor
 * @type {boolean}
 */
let disableHoverDelay = false;

/**
 * Class for popovers
 */
export default class Popover {
  /**
   * Popover constructor
   * @param {HTMLElement} element – show popover near this element
   * @param {object} options – popover options
   * @param {string} componentName – context menu component name
   * @param {PopoverModes} modes – popover mode
   * @param {object} data – some data to pass to context menu component
   */
  constructor({ element, options = {}, componentName, modes, data = {}, permissions = null }) {
    this.uid = Math.round(Math.random() * UID_MAX);

    this.element = element;
    this.options = Object.assign({}, DEFAULT_POPPER_OPTIONS, options);
    this.componentName = componentName;
    this.modes = modes;
    this.vueProps = data;
    this.permissions = permissions;

    this.instance = null;
    this.popper = null;

    this.showInProgress = false;

    this.mouseCoordinates = {
      x: 0,
      y: 0,
    };

    this.showState = false;

    this.bind();
  }

  /**
   * Create virtual element with specific bounding client rect
   *
   * @param {HTMLElement} element – dom element
   * @param {number} x – x coordinate
   * @param {number} y – y coordinate
   * @returns {object}
   */
  createVirtualElement(element, x = 0, y = 0) {
    return {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
      }),
      contextElement: element,
    };
  }

  /**
   * Dynamically load vue component
   *
   * @param {string} name – path to component
   * @returns {object}
   */
  async loadComponent(name) {
    try {
      const component = await import(/* webpackMode: "eager" */ `@views/ContextMenus/${name}.vue`);

      if (component.default) {
        return component.default;
      }
    } catch (err) {
      try {
        const component = await import(/* webpackMode: "eager" */ `@sdk/views/ContextMenus/${name}.vue`);

        if (component.default) {
          return component.default;
        }
      } catch (err2) {
        console.log('no popover file found');

        return null;
      }
    }
  }

  /**
   * Mount vue component
   *
   * @returns {Promise<void>}
   */
  async mount() {
    if (this.instance) {
      return;
    }

    if (this.permissions) {
      this.vueProps.permissions = await Permissions.canI(this.permissions) || {};
    }

    const Component = await this.loadComponent(this.componentName);

    if (Component === null) {
      return false;
    }
    const ComponentClass = Vue.extend(Component);

    ComponentClass.options.router = router;
    ComponentClass.options.store = store;
    ComponentClass.options.i18n = i18n;

    this.instance = new ComponentClass({
      propsData: this.vueProps,
    });

    this.instance.$mount();

    document.body.appendChild(this.instance.$el);

    this.classToParents(this.element);
  }

  /**
   * Add or remove 'popover--opened' class to parents with 'popover-add-class' attribute
   *
   * @param {HTMLElement} node - node
   * @param {boolean} add - true if add class, false if remove class
   *
   * @returns {void}
   */
  classToParents(node, add = true) {
    if (add) {
      node.classList.add(ACTIVE_CLASS);
    } else {
      node.classList.remove(ACTIVE_CLASS);
    }

    while (node) {
      if (node.hasAttribute && node.hasAttribute('popover-add-class')) {
        if (add) {
          node.classList.add(ACTIVE_CLASS);
        } else {
          node.classList.remove(ACTIVE_CLASS);
        }
      }
      node = node.parentNode;
    }
  }

  /**
   * Unmount and destroy vue component
   *
   * @returns {void}
   */
  unmount() {
    if (this.instance) {
      this.instance.$destroy();
      this.instance.$el.remove();
      this.instance = null;
      this.classToParents(this.element, false);
    }
  }

  /**
   * Bind events on element
   *
   * @returns {void}
   */
  bind() {
    /* Handle click mode */
    if (this.modes.click) {
      this.element.__clickHandler = event => {
        if (this.modes.mouse) {
          this.options = {};
          this.options.placement = 'bottom-start';

          this.mouseCoordinates = {
            x: event.pageX,
            y: event.pageY,
          };

          if (this.modes.right) {
            if (event.which === RIGHT_MOUSE) {
              this.show(true);
            }
          }
          if (this.modes.left || !this.modes.right) {
            if (event.which === LEFT_MOUSE) {
              this.show(true);
            }
          }
        } else {
          this.show(!this.showState);
        }
      };

      this.element.__clickOutsideHandler = event => {
        const conditionToHide =
          (!(this.instance.$el === event.target || this.instance.$el.contains(event.target)) && !this.options.disableOutsideClick) ||
          (event.target.hasAttribute('data-popover-close') || event.target.closest('[data-popover-close]'));

        if (conditionToHide) {
          setTimeout(() => {
            this.show(false);
          }, TIMEOUT_BEFORE_DESTROY);
        }
      };

      this.element.addEventListener('mouseup', this.element.__clickHandler);
    }

    /* Handle hover mode */
    if (this.modes.hover) {
      this.element.__mouseEnterHandler = event => {
        clearTimeout(this.element.__hoverInterval);

        this.element.__hoverInterval = setTimeout(() => {
          this.show(true);

          disableHoverDelay = true;
        }, !disableHoverDelay && HOVER_DELAY);
      };

      this.element.__mouseLeaveHandler = event => {
        clearTimeout(this.element.__hoverInterval);

        this.element.__hoverInterval = setTimeout(() => {
          disableHoverDelay = false;
        }, HOVER_DELAY);

        this.show(false);
      };

      this.element.addEventListener('mouseenter', this.element.__mouseEnterHandler);
      this.element.addEventListener('mouseleave', this.element.__mouseLeaveHandler);
    }
  }

  /**
   * Unbind events on element
   *
   * @returns {void}
   */
  unbind() {
    if (this.element.__clickHandler) {
      this.element.removeEventListener('mouseup', this.element.__clickHandler);
      this.element.__clickHandler = null;
    }

    if (this.element.__mouseEnterHandler) {
      this.element.removeEventListener('mouseenter', this.element.__mouseEnterHandler);
      this.element.__mouseEnterHandler = null;
    }

    if (this.element.__mouseLeaveHandler) {
      this.element.removeEventListener('mouseleave', this.element.__mouseLeaveHandler);
      this.element.__mouseLeaveHandler = null;
    }

    if (this.element.__clickOutsideHandler) {
      document.body.removeEventListener('mouseup', this.element.__clickOutsideHandler);
      this.element.__clickOutsideHandler = null;
    }
  }

  /**
   * Show popover
   *
   * @param {boolean} state – whether to show or hide
   * @returns {Promise<void>}
   */
  async show(state = true) {
    if (this.showInProgress) {
      return;
    }

    this.showInProgress = true;

    if (state) {
      const res = await this.mount();

      if (res === false) {
        return;
      }

      let refElement = this.element;

      if (this.modes.mouse) {
        refElement = this.createVirtualElement(this.element, this.mouseCoordinates.x, this.mouseCoordinates.y);
      }

      this.popper = createPopper(refElement, this.instance.$el, this.options);

      refElement = null;
      setTimeout(() => {
        this.popper.update();
        document.body.addEventListener('mouseup', this.element.__clickOutsideHandler);
      }, 0);
      this.showState = true;
    } else {
      await this.unmount();
      if (this.element && this.element.__clickOutsideHandler) {
        document.body.removeEventListener('mouseup', this.element.__clickOutsideHandler);
      }
      if (this.popper) {
        this.popper.destroy();
        this.popper = null;
      }
      this.showState = false;
    }

    this.showInProgress = false;
  }

  /**
   * Update vue component properties
   * @param {object} data – properties
   * @returns {void}
   */
  updateData(data) {
    this.vueProps = data;

    if (this.instance) {
      Object.keys(data).forEach(key => {
        this.instance.$props[key] = data[key];
      });
    }

    if (this.popper) {
      this.popper.update();
    }
  }

  /**
   * Destroy popover instance
   *
   * @returns {void}
   */
  destroy() {
    this.unmount();
    this.unbind();

    this.element = null;
    this.instance = null;
    this.popper = null;
    this.vueProps = null;
  }
}
