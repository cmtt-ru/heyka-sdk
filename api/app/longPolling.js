import axios from 'axios';

/**
 * Long polling response timeout
 * @type {number}
 */
const RESPONSE_TIMEOUT = 1000;

/**
 * Long polling
 * @param {number} timeout — timeout before server response
 * @returns {string} client ip address
 */
export default function (timeout = RESPONSE_TIMEOUT) {
  return axios.get(`/long-poll`, {
    params: {
      timeout,
    },
  });
}
