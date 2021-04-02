import axios from 'axios';

/**
 * Change workspace member role
 *
 * @param {string} workspaceId – workspace id
 * @param {object} params - params
 *  @param {string} params.userId - worksace name
 *  @param {string} params.role - 'admin'|'guest'
 * @returns {string} 'ok'
 */
export default function (workspaceId, params) {
  return axios.post(`/workspaces/${workspaceId}/permissions`, params).then(res => res.data);
}
