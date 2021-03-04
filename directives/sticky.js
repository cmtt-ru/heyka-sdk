/* eslint-disable no-magic-numbers */
import { v4 as uuid4 } from 'uuid';

const STICKED_CLASS = 'ui-sticked';

const stickyObservers = {};

/**
 * Decide if we need to update styles
 * @param {object} el element
 * @returns {void}
 */
function elementCheck(el) {
  if (el.intersectionRatio === 1) {
    el.target.classList.remove(STICKED_CLASS);
  } else if (el.intersectionRatio !== 0) {
    el.target.classList.add(STICKED_CLASS);
  }
}

export default {
  inserted: (el, binding) => {
    const id = uuid4();

    console.log(binding);

    const bottom = !!binding.modifiers.bottom;
    const margin = binding.value?.offset || 0;
    const rootSelector = binding.value?.rootSelector || null;
    const rootEl = rootSelector ? document.querySelector(rootSelector) : el.parentElement;

    const rootM = -margin - 0.05;

    console.log(margin, rootM, rootEl);

    stickyObservers[id] = new IntersectionObserver(entries => {
      for (const entry of entries) {
        elementCheck(entry);
      }
    }, {
      root: rootEl,
      threshold: 1,
      rootMargin: `${rootM}px 0px`,
    });
    stickyObservers[id].observe(el);
    el.setAttribute('sticky-instance-uid', id);
    el.style.position = 'sticky';
    if (bottom) {
      el.style.bottom = `${margin - 0.05}px`;
      // el.style.transform = 'translateY(-0.6px)';
    } else {
      el.style.top = `${margin - 0.05}px`;
      // el.style.transform = 'translateY(0.6px)';
    }
  },

  unbind: (el) => {
    const id = el.getAttribute('sticky-instance-uid');

    stickyObservers[id].unobserve(el);
    delete stickyObservers[id];
  },
};
