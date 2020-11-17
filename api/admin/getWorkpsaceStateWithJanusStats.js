import axios from 'axios';

/**
 * Get full workspace state with janus stats
 * @param {string} workspaceId – workspace id
 * @returns {object}
 */
export default async function (workspaceId) {
  const res = await axios.get(`/admin/workspaces/${workspaceId}/janus-stats`);

  return res.data;
}
