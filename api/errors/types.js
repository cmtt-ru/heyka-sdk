export const errorMessages = {
  badToken: 'Bad token',
  internalServerError: 'An internal server error occurred',
  accessTokenExpired: 'Access token is expired',
  missingAuthentication: 'Missing authentication',
  badRequest: 'Invalid request params input',
  apiIsDown: 'Api is down',
  invalidRequestPayloadInput: 'Invalid request payload input',
  unknownConnection: 'Unknow socket connection',
  connectionNotInChannel: 'Socket connection not in a channel',
  socketAuthInvalidAccessToken: 'Invalid access token',

  // Universal error messages
  accessDenied: 'Access denied',
  notFound: 'Not found',

  // Leave channel
  activeConversation: 'Active conversation',

  // Unselect channel
  channelNotSelected: 'Channel not selected',
  channelSelectedByAnotherDevice: 'Channel selected by another device',

  // Auth by link
  authLinkInvalid: 'Auth link is not valid',

  // Change online status
  socketNotFound: 'Socket not found',

  // Refresh token
  credentialsAreInvalid: 'Credentials are invalid',
  refreshTokenExpired: 'Refresh token is expired',

  // Sign in
  emailOrPasswordAreInvalid: 'Email or password are invalid',

  // Sign up
  emailExists: 'A user with that email address has already signed up',

  // Email verification
  verificationCodeIsNotValid: 'Verification code is not valid',

  // Delete account
  cannotDeleteAdminUser: 'You can not delete account while you have admin rights in at least one workspace',

};
