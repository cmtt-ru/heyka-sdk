import axios from 'axios';

/**
 * Get active users list of this channel with media states
 * @param {string} id - channel's id
 * @returns {array} array of user's
 */
export default async function (id) {
  const res = await axios.get(`/channels/${id}/members`);

  return res.data;
}
