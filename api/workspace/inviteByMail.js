import axios from 'axios';

/**
 * Send invite to a user by email
 * @param {string} id - workspace id
 * @param {array} emailList - email array
 *
 * @returns {string} result string
 */
export default async function inviteByMail(id, emailList) {
  const res = await axios.post(`/workspaces/${id}/invite/email`, { emailList });

  return res.data;
}

inviteByMail.showError = true;