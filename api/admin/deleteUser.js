import axios from 'axios';

/**
 * Delete user from workspace
 *
 * @param {string} workspaceId – workspace id
 * @param {string} userId – user id
 * @returns {array}
 */
export default function (workspaceId, userId) {
  return axios.delete(`/workspaces/${workspaceId}/members/${userId}`).then(res => res.data);
}
