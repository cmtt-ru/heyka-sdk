import axios from 'axios';

/**
 * Get users of this group
 * @param {string} id - group's id
 *
 * @returns {array} array of users' objects
 */
export default async function (id) {
  const res = await axios.get(`/groups/${id}/members`);

  return res.data;
}
