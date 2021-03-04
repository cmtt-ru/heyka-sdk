import axios from 'axios';

/**
 * Get users from connected Slack workspace
 * @param {string} id - workspace id
 *
 * @returns {array}
 */
export default async function (id) {
  const res = await axios.get(`/workspaces/${id}/slack/users`);

  return res.data;
}