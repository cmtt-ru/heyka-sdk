import axios from 'axios';

/**
 * Get total subscribers count
 *
 * @returns {string} count
 */
export default async function subscribeCount() {
  const res = await axios.get('/subscription/count');

  return res.data;
}

subscribeCount.ignoreTokens = true;
