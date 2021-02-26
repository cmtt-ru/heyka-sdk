import API from '@api';
import { obj2hash } from '@libs/utils';
import cloneDeep from 'clone-deep';

/**
 * @typedef PermissionsData
 * @property {array} actions – array of actions
 * @property {string} [userId] – user id
 * @property {string} [channelId] – channel id
 */

const PERMISSIONS_CACHE = {};

/**
 * Class for permissions
 */
class Permissions {
  /**
   * Permissions for edit/delete channel
   * @param {string} channelId – channel id
   * @returns {PermissionsData}
   */
  editChannel(channelId) {
    return {
      actions: 'channel.update,channel.delete,channel.manageMembers',
      channelId,
    };
  }

  /**
   * Permissions for manage workspaces
   * @returns {PermissionsData}
   */
  manageWorkspaces() {
    return {
      actions: 'workspaces.manage',
    };
  }

  /**
   * Check permissions
   * @param {PermissionsData} permission – permission
   * @param {boolean} cache – cache permission result
   * @returns {Promise<object>}
   */
  async canI(permission, cache = true) {
    let cacheKey = null;
    let needToCache = false;

    try {
      if (cache) {
        cacheKey = obj2hash(permission);
        const cachedPermission = PERMISSIONS_CACHE[cacheKey];

        if (cachedPermission !== undefined) {
          return cloneDeep(cachedPermission);
        } else {
          needToCache = true;
        }
      }

      const result = await API.user.checkPermissions(permission);

      if (needToCache) {
        PERMISSIONS_CACHE[cacheKey] = result;
      }

      return cloneDeep(result);
    } catch (e) {
      console.error('permissions class', e);
    }

    return false;
  }
}

export default new Permissions();
