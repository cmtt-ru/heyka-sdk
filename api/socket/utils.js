import { client } from '@api/socket/client';

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
}
