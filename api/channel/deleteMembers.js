import axios from 'axios';

/**
 * Get active users list of this channel with media states
 * @param {string} id - channel's id
 * @param {array} users – array of user ids
 * @returns {array} array of user's
 */
export default async function (id, users) {
  const res = await axios.post(`/channels/${id}/delete-users`, {
    users,
  });

  return res.data;
}
