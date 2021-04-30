import axios from 'axios';

/**
 * Check if jwt is valid
 *
 * @param {string} jwt - json web token
 *
 * @returns {string} result data
 */
export default function checkWebToken(jwt) {
  return axios.get(`/check-token?token=${jwt}`).then(res => res.data);
}

checkWebToken.ignoreTokens = true;
