import axios from 'axios';

/**
 * Get workspaces to which you have access
 * @returns {array}
 */
export default function () {
  return axios.get('/admin/managed-workspaces').then(res => res.data);
}
