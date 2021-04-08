import axios from 'axios';

/**
 * Get total subscribers count
 *
 * @returns {string} count
 */
export default async function () {
  const res = await axios.get('/subscription/count');

  return res.data;
}
