import axios from 'axios';

/**
 * Report about bad user connection
 * @returns {object} result data
 */
export default async function () {
  const res = await axios.post(`/report-bad-connection`);

  return res.data;
}
