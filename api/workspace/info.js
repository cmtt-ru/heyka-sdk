import axios from 'axios';

/**
 * Get certain workspace info
 * @param {string} id - workspace id
 * @returns {object} workspaceInfo – workspace info
 */
export default async function (id) {
  const res = await axios.get(`/workspaces/${id}/info`);

  return res.data;
}
