import axios from 'axios';

/**
 * Leave the workspace
 * @param {object} id - workspace id
 *
 * @returns {string} result string
 */
export default async function (id) {
  const res = await axios.post(`/workspaces/${id}/leave`);

  return res.data;
}