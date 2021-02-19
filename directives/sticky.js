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
    el.target.classList.add(STICKED_CLASS);
  } else {
    el.target.classList.remove(STICKED_CLASS);
  }
}

export default {
  inserted: (el, binding) => {
    const id = uuid4();


    const bottom = !!binding.modifiers.bottom;
    const margin = binding.expression || 0;

    stickyObservers[id] = new IntersectionObserver(entries => {
      for (const entry of entries) {
        elementCheck(entry);
      }
    }, {
      root: el.parentElement,
      threshold: 1,
      rootMargin: '-0.05px 0px',
    });
    stickyObservers[id].observe(el);
    el.setAttribute('sticky-instance-uid', id);
    el.style.position = 'sticky';
    if (bottom) {
      el.style.bottom = `${margin}px`;
      el.style.transform = 'translateY(0.1px)';
    } else {
      el.style.top = `${margin}px`;
      el.style.transform = 'translateY(-0.1px)';
    }
  },

  unbind: (el) => {
    const id = el.getAttribute('sticky-instance-uid');

    stickyObservers[id].unobserve(el);
    delete stickyObservers[id];
  },
};
