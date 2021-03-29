import axios from 'axios';

/**
 * Delete some users of this group
 * @param {string} id - group's id
 * @param {array} users – array of user ids
 * @returns {string} 'ok'
 */
export default async function (id, users) {
  const res = await axios.delete(`/groups/${id}/members`, {
    data: {
      users,
    },
  });

  return res.data;
}
