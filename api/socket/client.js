import io from 'socket.io-client';
import eventNames from './eventNames';
import { API_URL } from '@sdk/Constants';
import connectionCheck from '@sdk/classes/connectionCheck';

const socketUrl = API_URL;

const client = io(socketUrl, { autoConnect: false });

/**
 * Connect to socket
 *
 * @returns {promise}
 */
function connect() {
  return new Promise((resolve, reject) => {
    if (client.connected) {
      resolve();

      return;
    }

    if (client.disconnected) {
      client.connect();
    }

    client.once('connect', data => {
      client.lastSocketId = client.id;

      connectionCheck.handleSocketReconnecting(false);

      resolve(data);
    });

    client.once(eventNames.connectError, data => {
      reject(data);
    });
  });
}

export {
  client,
  connect
};
