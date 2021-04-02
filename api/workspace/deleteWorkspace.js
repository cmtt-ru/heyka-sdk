import axios from 'axios';

/**
 * Delete workspace
 * @param {string} id - workspace id
 *
 * @returns {string} 'ok'
 */
export default async function (id) {
  const res = await axios.delete(`/workspaces/${id}`);

  return res.data;
}