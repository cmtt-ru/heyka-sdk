import axios from 'axios';

/**
 * Delete workspace
 * @param {string} id - workspace id
 *
 * @returns {string} 'ok'
 */
export default function (id) {
  const res = axios.delete(`/workspaces/${id}`);

  return res.data;
}