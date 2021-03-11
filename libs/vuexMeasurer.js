/**
 * Colors for pretty log
 * @type {{mutation: string, getter: string, action: string}}
 */
const colors = {
  action: '#1BA1E2',
  mutation: '#F0A30A',
  getter: '#60A917',
};

/**
 * Labels for pretty log
 * @type {{mutation: string, getter: string, action: string}}
 */
const labels = {
  action: 'action  ',
  mutation: 'mutation',
  getter: 'getter  ',
};

/**
 * Used for rounding duration
 * @type {number}
 */
const DURATION_ROUND = 3;

/**
 * Class for collect some statistics
 */
class StatsStore {
  /**
   * Constructor
   */
  constructor() {
    this.stats = {};
  }

  /**
   * Add entry to stats
   * @param {string} entryName – entry name
   * @param {number} duration – duration
   * @returns {void}
   */
  addEntry(entryName, duration) {
    if (!this.stats[entryName]) {
      this.stats[entryName] = {
        duration: 0,
        count: 0,
      };
    }

    if (this.stats[entryName].count === 0) {
      this.stats[entryName].duration = duration;
    } else {
      this.stats[entryName].duration =
        (this.stats[entryName].count * this.stats[entryName].duration + duration) /
        (this.stats[entryName].count + 1);
    }

    this.stats[entryName].count++;
  }

  /**
   * Show report
   * @returns {void}
   */
  showReport() {
    const entries = Object.entries(this.stats);

    entries.sort((a, b) => {
      return b[1].duration - a[1].duration;
    });

    entries.forEach(e => {
      e[1].duration = parseFloat(e[1].duration.toFixed(DURATION_ROUND));
    });

    const sortedStats = Object.fromEntries(entries);

    console.table(sortedStats);
  }

  /**
   * Clear stats
   * @returns {void}
   */
  clear() {
    this.stats = {};
  }
}

const stats = new StatsStore();

window.vuexMeasurerStats = stats;
/**
 * Pretty log
 * @param {string} type – type of vuex function
 * @param {string} moduleName – module name
 * @param {string} name – function name
 * @param {number} duration – duration in ms
 * @returns {void}
 */
function log(type, moduleName, name, duration) {
  const vuexName = `${moduleName ? moduleName + '/' : ''}${name}`;

  stats.addEntry(`${labels[type]} ${vuexName}`, duration);

  console.log(
    `%c ${labels[type]} %c ${vuexName}  %c${duration}ms `,
    'background: #eee; font-weight: bold; color: ' + colors[type],
    'background: #eee; color: #333',
    'background: #eee; font-weight: bold'
  );
}

/**
 * Monkey patch function and measure execution time
 * @param {string} type – type of vuex function
 * @param {string} functionName – function name
 * @param {function} fn – function to measure
 * @param {string} moduleName – vuex module name
 * @returns {(function(): *)|(function(): *)}
 */
function measureFunction(type, functionName, fn, moduleName) {
  const isAsyncFunction = fn.constructor.name === 'AsyncFunction';

  if (isAsyncFunction) {
    return async function () {
      const startTime = performance.now();
      const result = await fn.apply(null, arguments);
      const duration = parseFloat((performance.now() - startTime).toFixed(DURATION_ROUND));

      log(type, moduleName, functionName, duration);

      return result;
    };
  } else {
    return function () {
      const startTime = performance.now();
      const result = fn.apply(null, arguments);
      const duration = parseFloat((performance.now() - startTime).toFixed(DURATION_ROUND));

      log(type, moduleName, functionName, duration);

      return result;
    };
  }
}

/**
 * Accept vuex modules and monkey patch actions, getters & mutations
 * @param {object} modules – vuex modules object
 * @returns {void}
 */
export function measureModules(modules) {
  Object.keys(modules).forEach(moduleName => {
    const module = modules[moduleName];

    measureFunctions(module.actions, moduleName, 'action');
    measureFunctions(module.mutations, moduleName, 'mutation');
    measureFunctions(module.getters, moduleName, 'getter');
  });
}

/**
 * Accept object of functions and monkey patch them
 * @param {object} fns – object of functions
 * @param {string} moduleName – vuex module name
 * @param {string} type – vuex function type
 * @returns {void}
 */
export function measureFunctions(fns, moduleName, type) {
  Object.keys(fns).forEach(fnName => {
    fns[fnName] = measureFunction(type, fnName, fns[fnName], moduleName);
  });
}
