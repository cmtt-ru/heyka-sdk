import axios from 'axios';

/**
 * Connect workspace to Slack
 * @param {string} id - workspace id
 *
 * @returns {string} web url to redirect to
 */
export default async function (id) {
  const res = await axios.get(`/workspaces/${id}/slack/connect`);

  return res.data;
}