import { clearTokens } from '../tokens';
import router from '@/router';
import * as sockets from '@api/socket';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import broadcastActions from '@sdk/classes/broadcastActions';

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

  sockets.destroy();

  if (redirectToAuth) {
    router.replace({ name: 'auth' }).catch(() => {});
  }
}
