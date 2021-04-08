import axios from 'axios';

/**
 * Add email in release news list
 *
 * @param {string} email - user's email
 *
 * @returns {string} count
 */
export default async function (email) {
  const res = await axios.post('/subscription/add', { email });

  return res.data;
}
