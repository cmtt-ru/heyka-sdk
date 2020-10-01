import axios from 'axios';

/**
 * Get statistic
 * @param {object} params - statistic
 * @returns {object} result data
 */
export default async function (params) {
  const res = await axios.get(`/stats`, params);

  return res.data;
}
