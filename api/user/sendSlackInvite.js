import axios from 'axios';

/**
 * Send slack invite to offline user
 * @param {object} params - params
 * @param {string} params.userId - id of recipient
 * @param {string} params.channelId - id of channel
 * @param {string} params.workspaceId - oid of workspace
 *
 * @returns {object} result data
 */
export default async function (params) {
  const res = await axios.post(`/send-invite/slack`, params);

  return res.data;
}
