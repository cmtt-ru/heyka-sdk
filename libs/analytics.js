/* eslint-disable camelcase */
import store from '@/store';
import mixpanel from 'mixpanel-browser';

mixpanel.init('62c83056acee2559192001d386ed51d6');

const EVENT_PREFIX = IS_ELECTRON ? 'App' : 'Web';

/**
 * Send event to GA
 * @param {string} actionName — event action
 * @param {string} prefix — event prefix
 * @returns {void}
 */
export function trackEvent(actionName, prefix = EVENT_PREFIX) {
  try {
    const workspaceId = store.getters['me/getSelectedWorkspaceId'];
    const action = `${prefix} — ${actionName}`;

    let data;

    if (workspaceId) {
      data = {
        workspace_id: workspaceId,
      };
    }

    mixpanel.track(action, data);
    console.log('analytics --> trackEvent', action, data);
  } catch (e) {
    console.error('analytics --> trackEvent', e);
  }
}

/**
 * List of all GA events
 * @type {object}
 */
export const GA_EVENTS = {
  login: a => `Login — ${a}`,
  signup: a => `Signup — ${a}`,
  signupWithInvite: a => `Signup Invite — ${a}`,
  socialLink: a => `Social Link — ${a}`,

  workspaceCreate: 'Workspace — Create',
  workspaceChange: 'Workspace — Change',
  inviteToWorkspace: 'Workspace — Invite',

  channelJoin: 'Channel — Join',
  privateChannelJoin: 'Private Channel — Join',

  pushInviteAccept: 'Push — Invite — Accept',
  pushInviteSend: 'Push — Invite — Send',

  chatMessageSend: 'Chat — Message — Send',

  raiseHand: 'Raise Hand',
};
