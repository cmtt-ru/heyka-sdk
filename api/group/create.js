import axios from 'axios';

/**
 * Create group in a certain workspace
 * @param {string} id - id of workspace
 * @param {object} params - group info
 *  @param {string} params.name - group name
 *  @param {array} params.users - initial group users *
 *
 * @returns {object} {id, name, createdAt, updatedAt, createdBy}
 */
export default async function (id, params) {
  const res = await axios.post(`/workspaces/${id}/groups`, params);

  return res.data;
}
