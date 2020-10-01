import axios from 'axios';

/**
 * Create invite token to specific channel
 * @param {string} id - id of channel
 * @returns {string} 'ok'
 */
export default async function (id, revokeAccess = false) {
  const res = await axios.delete(`/channels/${id}/invites`, {
    params: {
      revokeAccess,
    },
  });

  return res.data;
}
