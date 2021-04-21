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
import { updateTokens, checkAndRefreshTokens } from './tokens';
import store from '@/store';
import connectionCheck from '@sdk/classes/connectionCheck';
import * as sockets from '@api/socket';
import { client } from './socket/client';
import { IS_ELECTRON, API_URL } from '@sdk/Constants';

axios.defaults.baseURL = API_URL;

/**
 * Inject's middleware function in all api methods
 *
 * @param {object} functions – object with functions
 * @returns {object}
 */
function injectMiddleware(functions) {
  Object.keys(functions).forEach(name => {
    const origFunc = functions[name];

    functions[name] = middleware(origFunc, name);
  });

  return functions;
}

/**
 * Middleware function
 *
 * @param {function} func – specific function
 * @param {string} functionName – function name
 * @returns {function(...[*]=)}
 */
function middleware(func, functionName) {
  console.log('API -->', functionName, func.ignoreTokens, func.important);

  return async function () {
    try {
      if (IS_ELECTRON) {
        // throttle some of the API methods
        if (trottleAPI.needForThrottle(functionName)) {
          if (!trottleAPI.throttle(functionName)) {
            throw new Error(`${functionName} throttled`);
          }
        }

        if (!connectionCheck.isOnline()) {
          throw new Error(`Can't call API method '${functionName}'. No internet connection`);
        }

        store.dispatch('app/addPrivacyLog', {
          category: 'api',
          method: functionName,
          data: Array.prototype.slice.call(arguments),
        });

        connectionCheck.handleApiState(true);
      }

      await checkAndRefreshTokens();

      return await func.apply(null, arguments);
    } catch (err) {
      if (err.response === undefined) {
        await handleError(err);

        return;
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

      /** Global error handler */
      await handleError(err);
    }
  };
}

export default {
  user: injectMiddleware(userApi),
  auth: injectMiddleware(authApi),
  workspace: injectMiddleware(workspaceApi),
  channel: injectMiddleware(channelApi),
  group: injectMiddleware(groupApi),
  app: injectMiddleware(appApi),
  admin: injectMiddleware(adminApi),
};
