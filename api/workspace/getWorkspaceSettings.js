import axios from 'axios';

/**
 * Get detailed workspace settings
 * @param {string} id - workspace id
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
 *
 *   @returns {string} data.workspace.canUsersInvite (method was made for this)
 */
export default async function (id) {
  const res = await axios.get(`/workspaces/${id}/settings`);

  return res.data;
}