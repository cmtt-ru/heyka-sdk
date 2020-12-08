import { client } from '@api/socket/client';

/**
 * Broadcast data to all users in selected channel
 * @param {string} action – action name
 * @param {*} data — any data
 * @returns {void}
 */
export function conversationBroadcast(action, data) {
  client.emit('conversation-broadcast', {
    action,
    data,
  });
}
