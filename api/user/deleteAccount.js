import axios from 'axios';

/**
 * Delete account
 * @returns {object}
 */
export default async function () {
  const res = await axios.post(`/me/delete`);

  return res.data;
}
