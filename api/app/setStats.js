import axios from 'axios';

/**
 * Upload low internet statistic
 * @param {object} params - statistic
 * @returns {object} result data
 */
export default async function (params) {
  const res = await axios.post(`/stats`, params);

  return res.data;
}
