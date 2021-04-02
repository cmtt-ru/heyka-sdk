import axios from 'axios';

/**
 * Add some users to this group
 * @param {string} id - id of group
 *  @param {array} users – array of user ids
 * @returns {string} 'ok'
 */
export default async function (id, users) {
  const res = await axios.post(`/groups/${id}/members`, users);

  return res.data;
}
