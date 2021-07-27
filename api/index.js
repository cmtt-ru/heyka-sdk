import userApi from './user';
import authApi from './auth';
import workspaceApi from './workspace';
import channelApi from './channel';
import appApi from './app';
import adminApi from './admin';
import groupApi from './group';

import { errorMessages } from './errors/types';
import { handleError } from './errors';
import trottleAPI from './throttle';
import initialProcess from './initialProcess';
import axios from 'axios';
import router from '@/router';
import { updateTokens, checkAndRefreshTokens } from './tokens';
import store from '@/store';
import connectionCheck from '@sdk/classes/connectionCheck';
import * as sockets from '@api/socket';
import { client } from './socket/client';
import { IS_ELECTRON, API_URL } from '@sdk/Constants';
import isMainWindow from '@sdk/libs/isMainWindow';
import Logger from '@sdk/classes/logger';
import notify from '@libs/notify';

const cnsl = new Logger('API', '#eeb837');

axios.defaults.baseURL = API_URL;

const apiBuffer = {};

const UNAUTHORIZED = 403;

/**
 * Inject's middleware function in all api methods
 *
 * @param {object} functions – object with functions
 * @param {string} namespace – functions namespace
 * @returns {object}
 */
function injectMiddleware(functions, namespace) {
  Object.keys(functions).forEach(name => {
    const origFunc = functions[name];

    functions[name] = middleware(origFunc, name, namespace);
  });

  return functions;
}

/**
 * Middleware function
 *
 * @param {function} func – specific function
 * @param {string} functionName – function name
 * @param {string} namespace – functions namespace
 * @returns {function(...[*]=)}
 */
function middleware(func, functionName, namespace) {
  return async function () {
    try {
      if (IS_ELECTRON) {
        /** Throttle some of the API methods */
        if (trottleAPI.needForThrottle(functionName)) {
          if (!trottleAPI.throttle(functionName)) {
            throw new Error(`${functionName} throttled`);
          }
        }

        // cnsl.log(`call ${namespace}/${functionName}`);

        if (!connectionCheck.isOnline()) {
          /** If api function has important flag then add api call to buffer */
          if (func.important) {
            addApiCallToBuffer(functionName, namespace, arguments);
          }

          throw new Error(`Can't call API method '${functionName}'. No internet connection`);
        }

        store.dispatch('app/addPrivacyLog', {
          category: 'api',
          method: functionName,
          data: Array.prototype.slice.call(arguments),
        });

        connectionCheck.handleApiState(true);
      }

      /** If api function has ignore token flag then ignore refreshing tokens */
      if (!func.ignoreTokens) {
        await checkAndRefreshTokens();
      }

      return await func.apply(null, arguments);
    } catch (err) {
      if (err.response === undefined) {
        await handleError(err);

        return;
      }

      /** Show backend error message if showError flag is true */
      if (func.showError) {
        notify(err.response.data.message, {
          icon: 'warning',
        });
      }

      /** Update tokens if token is expired */
      if (err.response.data.message === errorMessages.accessTokenExpired) {
        await updateTokens();

        return middleware(func, functionName).apply(null, arguments);
      }

      /** Try to reconnect sockets */
      if (
        err.response.data.message === errorMessages.socketNotFound ||
        err.response.data.message === errorMessages.unknownConnection ||
        (client.id === undefined && client.connected === true)
      ) {
        /** Don't try to reconnect if initial is not finished yet */
        if (initialProcess.getState()) {
          throw new Error(`Can't call API method '${functionName}'. Initial is occuring now`);
        }
        await sockets.reconnect();

        return middleware(func, functionName).apply(null, arguments);
      }

      /** Route to 403 on web if unauthorized */

      if (!IS_ELECTRON && err.response.status === UNAUTHORIZED) {
        router.replace({ name: 'error-403' });
      }

      /** Global error handler */
      await handleError(err);
    }
  };
}

/**
 * Add api call to buffer.
 * Used when api were called without internet connection.
 * @param {string} name – function name
 * @param {string} namespace – functions namespace
 * @param {IArguments} apiArguments – api arguments
 * @returns {void}
 */
function addApiCallToBuffer(name, namespace, apiArguments) {
  apiBuffer[`${namespace}/${name}`] = {
    namespace,
    name,
    arguments: apiArguments,
  };

  cnsl.log(`added to buffer ${namespace}/${name}`);
}

/**
 * Release api call buffer.
 * Just iterates over buffer and call apis.
 * @returns {Promise<void>}
 */
async function releaseApiCallBuffer() {
  for (const key in apiBuffer) {
    const item = apiBuffer[key];

    cnsl.log(`release ${item.namespace}/${item.name}`);

    await apiStructure[item.namespace][item.name].apply(null, item.arguments);

    delete apiBuffer[key];
  }
}

/**
 * Release api buffer when internet becomes online
 */
if (isMainWindow()) {
  connectionCheck.on('internet-reconnected', () => {
    releaseApiCallBuffer();
  });
}

const apiStructure = {
  user: injectMiddleware(userApi, 'user'),
  auth: injectMiddleware(authApi, 'auth'),
  workspace: injectMiddleware(workspaceApi, 'workspace'),
  channel: injectMiddleware(channelApi, 'channel'),
  group: injectMiddleware(groupApi, 'group'),
  app: injectMiddleware(appApi, 'app'),
  admin: injectMiddleware(adminApi, 'admin'),
};

export default apiStructure;
