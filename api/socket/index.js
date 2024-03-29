import store from '@/store';
import router from '@/router';
import eventNames from './eventNames';
import { client, connect } from './client';
import { getAccessToken } from '../tokens';
import connectionCheck from '@sdk/classes/connectionCheck';
import { handleError } from '@api/errors';
import Logger from '@sdk/classes/logger';
import sounds from '@sdk/classes/sounds';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';

import { IS_ELECTRON } from '@sdk/Constants';

const cnsl = new Logger('SOCKETS', '#d67a24');

/** Handle internet reconnection event */
connectionCheck.on('internet-reconnected', () => {
  if (!connected()) {
    reconnect();
  }
});

/**
 * Connect to socket, authorize and bind events
 *
 * @returns {Promise<void>}
 */
export async function init() {
  /** Trying to connect */
  try {
    await connect();
  } catch (e) {
    handleError(e);
  }

  /** Unbind all events */
  unbindEvents();

  /** Bind error events */
  bindErrorEvents();

  /** Channel select/unselect  */
  bindChannelEvents();

  /** User events */
  bindUserEvents();

  /** Push events */
  bindPushEvents();

  /** Workspace events */
  bindWorkspaceEvents();

  /** Trying to authorize */
  try {
    await authorize();
  } catch (e) {
    handleError(e);
  }
}

/**
 * Socket connected status
 *
 * @return {boolean}
 */
export function connected() {
  return client.connected;
}

/**
 * Destroy & connect to sockets
 *
 * @returns {void}
 */
export async function reconnect() {
  destroy();
  await store.dispatch('initial');
}

/**
 * Destroy socket connection and unbind events
 *
 * @returns {Promise<void>}
 */
export function destroy() {
  unbindEvents();
  client.disconnect();
}

/**
 * Unbind socket events
 *
 * @returns {void}
 */
function unbindEvents() {
  Object.values(eventNames).forEach(eventName => {
    client.removeAllListeners(eventName);
  });

  client.off('connect', connectHandler);
}

/**
 * Authorize in socket
 *
 * @returns {promise}
 */
async function authorize() {
  const accessToken = await getAccessToken();
  const onlineStatus = store.getters['me/getOnlineStatus'];

  return new Promise((resolve, reject) => {
    client.once(eventNames.authSuccess, data => {
      cnsl.log('socket auth success:', data);

      client.prevSocketId = client.id;

      store.dispatch('setSocketConnected', {
        connected: true,
        ...data,
      });

      store.commit('me/SET_ONLINE_STATUS', data.onlineStatus);

      resolve(data);
    });

    client.once(eventNames.authSuccessError, data => {
      cnsl.error('socket auth error', data);
      reject(data);
    });

    const selectedChannelId = store.getters['me/getSelectedChannelId'];

    const authData = {
      transaction: 'auth',
      workspaceId: store.getters['me/getSelectedWorkspaceId'],
      token: accessToken,
      onlineStatus: onlineStatus,
      prevSocketId: selectedChannelId ? client.prevSocketId : null,
      // ...(prevSocketId ? /**/{ prevSocketId } : prevSocketId),
    };

    client.emit(eventNames.auth, authData);

    store.dispatch('app/addPrivacyLog', {
      category: 'socket',
      method: eventNames.auth,
      data: [ store.getters['me/getSelectedWorkspaceId'] ],
    });
  });
}

/**
 * Connect event handler
 *
 * @returns {void}
 */
function connectHandler() {
  cnsl.info('connected!');

  // try to authorize new connection as the old connection
  authorize();
}

/**
 * Bind error events
 *
 * @returns {void}
 */
function bindErrorEvents() {
  client.on(eventNames.disconnect, data => {
    cnsl.log('disconnect', data);
    store.dispatch('setSocketConnected', false);
  });

  client.on('connect', connectHandler);

  // client.on(eventNames.reconnecting, () => {
  //   connectionCheck.handleSocketState(false);
  // });

  client.on(eventNames.error, data => {
    cnsl.error('error', data);
  });

  client.on(eventNames.socketApiError, error => {
    cnsl.error('socket-api-error', error.event, error.message);
  });
}

/**
 * Bind channel events
 *
 * @returns {void}
 */
function bindChannelEvents() {
  /**
   * Data buffer with delay
   *
   * @type {object}
   */
  const dataBuffer = {
    timeout: 100,

    buffer: {},

    add(id, data) {
      this.buffer[id] = {
        data,
        timer: null,
      };
    },

    remove(id) {
      this.cancelDelay(id);
      delete this.buffer[id];
    },

    get(id) {
      return this.buffer[id] && this.buffer[id].data;
    },

    delay(id, callback) {
      this.buffer[id].timer = setTimeout(callback, this.timeout);
    },

    cancelDelay(id) {
      clearInterval(this.buffer[id].timer);
    },
  };

  /** Unselect channel */
  client.on(eventNames.userUnselectedChannel, data => {
    // Перемещение пользователя между каналами осуществляется
    // методами selectChannel/unselectChannel
    if (data.socketId === client.id) {
      return;
    }

    const userId = data.userId;

    dataBuffer.add(userId, data);

    dataBuffer.delay(userId, () => {
      dataBuffer.remove(userId);
      store.commit('channels/REMOVE_USER', data);
      store.commit('channels/REMOVE_CONVERSATION_DATA', data);
    });
  });

  /** Select channel */
  client.on(eventNames.userSelectedChannel, data => {
    if (data.socketId === client.id) {
      return;
    }

    const myUserId = store.getters['me/getMyId'];
    const userId = data.userId;
    const unselectData = dataBuffer.get(userId);
    const selectedChannelId = store.getters['me/getSelectedChannelId'];

    /** Same user is trying to join from another device */
    if (data.socketId !== client.id && myUserId === userId) {
      store.dispatch('unselectChannelWithoutAPICall', selectedChannelId);
    }

    if (unselectData) {
      store.commit('channels/REMOVE_USER', unselectData);
      store.commit('channels/REMOVE_CONVERSATION_DATA', data);
      dataBuffer.remove(userId);
    }

    store.commit('channels/ADD_USER', data);

    if (userId !== myUserId && data.channelId === selectedChannelId) {
      sounds.play('user-joined');
    }
  });

  /** Channel created */
  client.on(eventNames.channelCreated, async (data) => {
    const selectedWorkspaceId = store.getters['me/getSelectedWorkspaceId'];

    if (selectedWorkspaceId === data.workspaceId) {
      store.dispatch('channels/addChannel', data.channelId);
    }
  });

  /** Channel deleted */
  client.on(eventNames.channelDeleted, ({ channelId }) => {
    const selectedChannelId = store.getters['me/getSelectedChannelId'];

    if (selectedChannelId === channelId) {
      store.dispatch('unselectChannelWithoutAPICall');
      if (IS_ELECTRON) {
        router.replace({ name: 'workspace' });
      } else {
        router.replace({ name: 'landing' });
      }
    }

    store.commit('channels/REMOVE_CHANNEL', channelId);
  });

  /** Channel updated */
  client.on(eventNames.channelUpdated, ({ channel }) => {
    store.commit('channels/UPDATE_CHANNEL', channel);
  });

  /** Conversation broadcast */
  client.on(eventNames.conversationBroadcast, data => {
    console.log('----- conversationBroadcast', data);
    store.dispatch('channels/processConversationData', data);
  });
}

/**
 * Bind user events
 *
 * @returns {void}
 */
function bindUserEvents() {
  /** User online status changed */
  client.on(eventNames.onlineStatusChanged, data => {
    store.commit('users/SET_ONLINE_STATUS', data);
  });

  /** User media status changed */
  client.on(eventNames.mediaStateUpdated, data => {
    store.commit('channels/SET_USER_MEDIA_STATE', data);
  });

  /** User changed password */
  client.on(eventNames.passwordChanged, data => {
    broadcastEvents.dispatch('logout');
  });

  /** User info changed */
  client.on(eventNames.userUpdated, data => {
    store.commit('users/UPDATE_USER', data.user);
  });

  /** Muted for all */
  client.on(eventNames.mutedForAll, async data => {
    if (data.socketId === client.id) {
      store.dispatch('me/mutedByUser', data.fromUserId);
    }
  });

  /** Me updated */
  client.on(eventNames.meUpdated, async data => {
    store.dispatch('me/updateSocial', data.user);
  });

  /** My online status updated */
  client.on(eventNames.myOnlineStatusUpdated, async data => {
    store.commit('me/SET_ONLINE_STATUS', data.onlineStatus);
  });

  /** User joined workspace */
  client.on(eventNames.userJoined, async (data) => {
    store.commit('users/ADD_USER', data.user);
  });

  /** User leaved workspace */
  client.on(eventNames.userLeavedWorkspace, async (data) => {
    store.commit('users/REMOVE_USER', data.userId);
  });

  /** Me kicked from workspace */
  client.on(eventNames.kickedFromWorkspace, async () => {
    broadcastActions.dispatch('selectAnyWorkspace');
  });
}

/**
 * Bind push events
 *
 * @returns {void}
 */
function bindPushEvents() {
  /** Get push notification */
  client.on(eventNames.invite, data => {
    cnsl.log('INCOMING INVITE:', data);
    store.dispatch('app/addPush', data);
  });

  /** Get response to push notification */
  client.on(eventNames.inviteResponse, ({ inviteId, userId, response }) => {
    if (response.showResponse) {
      store.dispatch('app/addPush', {
        inviteId: `response-${inviteId}`,
        userId,
        message: response,
      });
    } else if (response === 'no-response') {
      store.dispatch('app/addPush', {
        inviteId: `response-${inviteId}`,
        userId,
        message: {
          action: 'busy',
          text: 'noResponse',
        },
      });
    }
  });

  /** Remove push notification */
  client.on(eventNames.inviteCancelled, data => {
    store.dispatch('app/removePush', data.inviteId);
  });
}

/**
 * Bind workspace events
 *
 * @returns {void}
 */
function bindWorkspaceEvents() {
  /** Workspace added */
  client.on(eventNames.workspaceAdded, () => {
    store.dispatch('workspaces/updateList');
  });

  /** Workspace updated */
  client.on(eventNames.workspaceUpdated, () => {
    store.dispatch('workspaces/updateList');
  });
}

window.client = client; // TODO: delete after stability
window.destroy = () => {
  destroy();
};
window.initial = () => {
  store.dispatch('initial');
};
