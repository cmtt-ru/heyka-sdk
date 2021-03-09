/* eslint-disable no-magic-numbers */
import { v4 as uuid4 } from 'uuid';

const STICKED_CLASS = 'ui-sticked';

const stickyObservers = {};

/**
 * Decide if we need to update styles
 * @param {object} el element
 * @param {object} targetElement initial element
 * @returns {void}
 */
function elementCheck(el, targetElement) {
  if (el.intersectionRatio === 1) {
    targetElement.classList.remove(STICKED_CLASS);
  } else {
    targetElement.classList.add(STICKED_CLASS);
  }
}

/**
 * Create helper pixel
 *
 * @param {object} sibling sibling element
 * @param {boolean} bottom true if bottom-sticky
 * @returns {object} new pixel
 */
function addPixel(sibling, bottom) {
  sibling.parentElement.style.position = 'relative';

  var newDiv = document.createElement('div');

  newDiv.style.width = '1px';
  newDiv.style.height = '1px';
  newDiv.style.position = 'absolute';
  newDiv.style.visibility = 'hidden';
  newDiv.style.pointerEvents = 'none';

  newDiv.style.left = sibling.offsetLeft + 'px';
  if (bottom) {
    newDiv.style.top = sibling.offsetTop + sibling.offsetHeight - 1 + 'px';
  } else {
    console.log(sibling, sibling.offsetTop);
    newDiv.style.top = sibling.offsetTop + 'px';
  }

  sibling.parentElement.insertBefore(newDiv, sibling);

  return newDiv;
}

export default {
  inserted: async (el, binding) => {
    const id = uuid4();
    const bottom = !!binding.modifiers.bottom;
    const margin = binding.value?.offset || 0;
    const rootM = -margin;

    const rootSelector = binding.value?.rootSelector || null;
    const rootEl = rootSelector ? document.querySelector(rootSelector) : el.parentElement;

    const rootPixel = addPixel(el, bottom);

    stickyObservers[id] = new IntersectionObserver(entries => {
      for (const entry of entries) {
        elementCheck(entry, el);
      }
    }, {
      root: rootEl,
      threshold: 1,
      rootMargin: `${rootM}px 0px`,
    });

    stickyObservers[id].observe(rootPixel);

    el.setAttribute('sticky-instance-uid', id);
    el.style.position = 'sticky';
    if (bottom) {
      el.style.bottom = `${margin}px`;
    } else {
      el.style.top = `${margin}px`;
    }
  },

  unbind: (el) => {
    const id = el.getAttribute('sticky-instance-uid');

    stickyObservers[id].disconnect();
    delete stickyObservers[id];
  },
};
