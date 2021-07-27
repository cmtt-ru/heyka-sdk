import axios from 'axios';
import { clearTokens } from '../tokens';

/**
 * Delete account
 * @returns {object}
 */
export default async function () {
  const res = await axios.post(`/me/delete`);

  clearTokens();

  return res.data;
}
