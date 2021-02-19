import axios from 'axios';

/**
 * Get invite token to specific channel (or 404)
 * @param {string} id - id of channel
 * @returns {object} {id, token, expiredAt, channelId, workspace}
 */
export default async function (id) {
  const res = await axios.get(`/channels/${id}/invite`);

  return res.data;
}
