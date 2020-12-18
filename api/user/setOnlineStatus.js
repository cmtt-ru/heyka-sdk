import axios from 'axios';
import { client } from '@api/socket/client';

/**
 * Change online status of the user
 * @param {string} status - "online"/"offline"/"idle"
 * @param {?string} cause - "manually"/"sleep"
 *
 * @returns {string} 'ok'
 */
export default function (status, cause = undefined) {
  return axios.post(`/user/online-status?socketId=${client.id}`, {
    onlineStatus: status,
    cause,
  });
}
