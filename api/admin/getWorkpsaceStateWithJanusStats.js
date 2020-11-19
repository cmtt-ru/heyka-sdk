import axios from 'axios';

/**
 * Get full workspace state with janus stats
 * @param {string} workspaceId – workspace id
 * @param {Date} before — filter by before date
 * @param {number} count – state's count
 * @returns {object}
 */
export default async function (workspaceId, before, count = 1) {
  const res = await axios.get(`/admin/workspaces/${workspaceId}/janus-stats`, {
    params: {
      before,
      count,
    },
  });

  return res.data;
}
