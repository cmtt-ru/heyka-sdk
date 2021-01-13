import axios from 'axios';

/**
 * Invite user from connected Slack workspace
 * @param {string} id - workspace id
 * @param {string} params - params
 * @param {string} params.slackUserId - Slack user id
 *
 * @returns {string} ok
 */
export default async function (id, params) {
  const res = await axios.post(`/workspaces/${id}/slack/invite`, params);

  return res.data;
}