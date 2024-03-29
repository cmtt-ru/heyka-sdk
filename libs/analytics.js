/* eslint-disable camelcase */

const EVENT_PREFIX = IS_ELECTRON ? 'App' : 'Web';

/**
 * Send event to GA
 * @param {string} actionName — event action
 * @param {string} prefix — event prefix
 * @returns {void}
 */
export function trackEvent(actionName, prefix = EVENT_PREFIX) {
  try {
    const action = `${prefix} — ${actionName}`;

    if (window.gtag) {
      window.gtag('event', `${prefix} — ${action}`);
    }

    console.log('analytics --> trackEvent', action);
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
