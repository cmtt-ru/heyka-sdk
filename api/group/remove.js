import axios from 'axios';

/**
 * Delete group
 * @param {string} id - channel id
 * @returns {string} 'ok'
 */
export default async function (id) {
  const res = await axios.delete(`/groups/${id}`);

  return res.data;
}
