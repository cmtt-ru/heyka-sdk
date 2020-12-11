import axios from 'axios';

/**
 * Get user info by his id (if you share any workspace)
 *
 * @param {string} userId - user's id
 *
 * @returns {object} user
 */
export default async function (userId) {
  const res = await axios.get(`/user/${userId}`);

  return res.data;
}
