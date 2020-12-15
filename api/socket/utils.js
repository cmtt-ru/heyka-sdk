import { client } from '@api/socket/client';
import broadcastActions from '@sdk/classes/broadcastActions';

/**
 * Broadcast data to all users in selected channel
 * @param {string} action – action name
 * @param {string} userId – user id
 * @param {*} data — any data
 * @returns {void}
 */
export function conversationBroadcast(action, userId, data) {
  client.emit('conversation-broadcast', {
    action,
    userId,
    data,
  });
  broadcastActions.dispatch('channels/processConversationData', {
    action,
    userId,
    data,
  });
}
