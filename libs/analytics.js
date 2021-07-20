/* eslint-disable camelcase */
import store from '@/store';
import mixpanel from 'mixpanel-browser';

// mixpanel.init('62c83056acee2559192001d386ed51d6');
mixpanel.init('865a3093f42e49a97ce69aa50eb34860', {
  loaded() {
    console.log('~~~~~~ get_distinct_id', mixpanel.get_distinct_id());
  },
});

const EVENT_PREFIX = IS_ELECTRON ? 'App' : 'Web';

window.MP = mixpanel;

export function login() {
  mixpanel.reset();
  mixpanel.identify('user-id');

  mixpanel.people.set({
    Name: 'Acme',
    Plan: 'Premium',
    'Upgrade date': new Date(),
  });
}

/**
 * Send event to GA
 * @param {string} actionName — event action
 * @param {string} prefix — event prefix
 * @returns {void}
 */
export function trackEvent(actionName, prefix = EVENT_PREFIX) {
  return;

  // eslint-disable-next-line no-unreachable
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
