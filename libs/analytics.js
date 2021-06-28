/**
 * Send event to GA
 * @param {string} action — event name
 * @returns {void}
 */
export default function trackEvent(action) {
  if (window.gtag) {
    window.gtag('event', action);
  }
}

/**
 * List of all GA events
 * @type {object}
 */
export const GA_EVENTS = {
  login: (a) => `App — Login — ${a}`,
  signup: (a) => `App — Signup — ${a}`,
  signupWithInvite: (a) => `App — Signup Invite — ${a}`,

  workspaceCreate: 'Web — Workspace — Create',
  workspaceChange: 'App — Workspace — Change',
  inviteInWorkspace: 'App — Workspace — Invite',

  channelJoin: 'App — Channel — Join',
  privateChannelJoin: 'App — Private Channel — Join',

  pushInvite: 'Push — Invite — Accept',
  pushInviteSend: 'Push — Invite — Send',

  chatMessageSend: 'Chat — Message — Send',

  raiseHand: 'Raise Hand',
};
