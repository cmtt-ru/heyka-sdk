const EVENT_PREFIX = IS_ELECTRON ? 'App' : 'Web';

/**
 * Send event to GA
 * @param {string} action — event name
 * @param {string} prefix — event prefix
 * @returns {void}
 */
export function trackEvent(action, prefix = EVENT_PREFIX) {
  if (window.gtag) {
    window.gtag('event', `${prefix} — ${action}`);
  }
}

/**
 * List of all GA events
 * @type {object}
 */
export const GA_EVENTS = {
  // todo: inviteInWorkspace
  login: a => `Login — ${a}`,
  signup: a => `Signup — ${a}`,
  signupWithInvite: a => `Signup Invite — ${a}`,
  socialLink: a => `Social Link — ${a}`,

  workspaceCreate: 'Workspace — Create',
  workspaceChange: 'Workspace — Change',
  inviteInWorkspace: 'Workspace — Invite',

  channelJoin: 'Channel — Join',
  privateChannelJoin: 'Private Channel — Join',

  pushInviteAccept: 'Push — Invite — Accept',
  pushInviteSend: 'Push — Invite — Send',

  chatMessageSend: 'Chat — Message — Send',

  raiseHand: 'Raise Hand',
};
