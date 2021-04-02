import axios from 'axios';

/**
 * Update workspace settings
 * @param {string} id - workspace id
 * @param {object} params - workspace params
 *  @param {array} params.canUsersInvite - true if all users can invite to workspace
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
export default async function (id, params) {
  const res = await axios.post(`/workspaces/${id}/settings`, params);

  return res.data;
}