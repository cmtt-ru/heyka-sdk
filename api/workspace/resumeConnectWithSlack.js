import axios from 'axios';

/**
 * Connect workspace to Slack
 * @param {string} query - query string that slack returned
 *
 * @returns {string} web url to redirect to
 */
export default async function (query) {
  const res = await axios.get(`/workspaces/slack/connect/resume${query}`);

  return res.data;
}