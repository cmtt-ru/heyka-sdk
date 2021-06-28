const EVENT_PREFIX = IS_ELECTRON ? 'App' : 'Web';

/**
 * Send event to GA
 * @param {string} action — event name
 * @returns {void}
 */
export function trackEvent(action) {
  if (window.gtag) {
    window.gtag('event', `${EVENT_PREFIX} — ${action}`);
  }
}

/**
 * List of all GA events
 * @type {object}
 */
export const GA_EVENTS = {
  // todo:
  // social login & signup
  //

  login: a => `Login — ${a}`,
  signup: a => `Signup — ${a}`,
  signupWithInvite: a => `Signup Invite — ${a}`,
  socialLink: a => `Social Link — ${a}`,

  workspaceCreate: 'Workspace — Create',
  workspaceChange: 'Workspace — Change',
  inviteInWorkspace: 'Workspace — Invite',

  channelJoin: 'Channel — Join',
  privateChannelJoin: 'Private Channel — Join',

  pushInvite: 'Push — Invite — Accept',
  pushInviteSend: 'Push — Invite — Send',

  chatMessageSend: 'Chat — Message — Send',

  raiseHand: 'Raise Hand',
};
