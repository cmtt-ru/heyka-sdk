import axios from 'axios';

/**
 * Delete workspace
 * @param {string} id - workspace id
 * @param {string} workspaceName – workspace name
 * @returns {string} 'ok'
 */
export default async function (id, workspaceName) {
  const res = await axios.delete(`/workspaces/${id}`, {
    data: {
      name: workspaceName,
    },
  });

  return res.data;
}
