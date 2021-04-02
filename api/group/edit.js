import axios from 'axios';

/**
 * Edit group
 * @param {string} id - id of group
 * @param {object} params - group info
 *  @param {string} params.name - group name
 *
 * @returns {object} {id, name, createdAt, updatedAt, createdBy}
 */
export default async function (id, params) {
  const res = await axios.post(`/groups/${id}`, params);

  return res.data;
}
