import axios from 'axios';

/**
 * Join to the workspace by an invite code
 * @param {string} code - invite code
 *
 * @returns {string} result string
 */
export default async function joinByCode(code) {
  const res = await axios.post(`/join/${code}`);

  return res.data;
}

joinByCode.ignoreTokens = true;