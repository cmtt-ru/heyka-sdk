import { clearTokens } from '../tokens';
import router from '@/router';
import * as sockets from '@api/socket';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import broadcastActions from '@sdk/classes/broadcastActions';
import { client } from '@api/socket/client';
import { IS_ELECTRON } from '@sdk/Constants';

/** List for event and logout user */
broadcastEvents.on('logout', logout);

/**
 * Logic for logging out: delete tokens, destroy sockets
 * @param {object} redirectToAuth - if we shoud also redirect to auth page
 *
 * @returns {void}
 */
export default function logout(redirectToAuth = true) {
  clearTokens();

  broadcastActions.dispatch('unselectChannelWithoutAPICall');

  broadcastActions.dispatch('logout');

  if (client) {
    client.emit('logout');
  }
  sockets.destroy();

  if (redirectToAuth) {
    if (IS_ELECTRON) {
      router.replace({ name: 'auth' }).catch(() => {});
    } else {
      console.log('LOGOUT');
      console.trace();
      router.replace({ name: 'landing' }).catch(() => {});
    }
  }
}
