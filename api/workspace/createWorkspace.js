import axios from 'axios';

/**
 * Create workspace
 * @param {object} params - params
 * @param {string} params.name - worksace name
 * @param {string} params.avatarFileId - worksace avatarFileId
 *
 * @returns {object} result data
 *  @returns {object} data.workspace
 *   @returns {string} data.workspace.id
 *   @returns {string} data.workspace.name
 *   @returns {string} data.workspace.avatar
 *   @returns {date} data.workspace.createdAt
 *   @returns {date} data.workspace.updatedAt
 *   @returns {object} data.workspace.user
 *    @returns {string} data.workspace.user.role  - eg. "admin"
 */
export default async function (params) {
  const res = await axios.post('/workspaces', params);

  return res.data;
}