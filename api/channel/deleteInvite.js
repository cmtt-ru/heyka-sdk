import axios from 'axios';

/**
 * Delete specific invite and remove all guests assosiated with it
 * @param {string} inviteId - invite id
 * @returns {string} 'ok'
 */
export default async function (inviteId) {
  const res = await axios.post(`/channel-invites/${inviteId}/deactivate`);

  return res.data;
}
