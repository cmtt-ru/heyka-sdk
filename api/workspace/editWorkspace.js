import axios from 'axios';

/**
 * Edit workspace
 * @param {string} id - workspace id
 * @param {object} params - params
 *  @param {string} params.name - worksace name
 *  @param {string} params.avatarFileId - worksace avatarFileId
 *
 * @returns {object} result data
 *  @returns {object} data.workspace
 *   @returns {string} data.workspace.id
 *   @returns {string} data.workspace.name
 *   @returns {string} data.workspace.avatar
 *   @returns {string} data.workspace.avatarFileId
 *   @returns {date} data.workspace.createdAt
 *   @returns {date} data.workspace.updatedAt
 *   @returns {object} data.workspace.user
 *    @returns {string} data.workspace.user.role  - eg. "admin"
 */
export default async function (id, params) {
  const res = await axios.post(`/workspaces/${id}`, params);

  return res.data;
}