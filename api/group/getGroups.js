import axios from 'axios';

/**
 * Get all groups in a certain workspace
 * @param {string} id - id of workspace
 *
 * @returns {array} [{id, name, createdAt, updatedAt, createdBy}]
 */
export default async function (id) {
  const res = await axios.get(`/workspaces/${id}/groups`);

  return res.data;
}
