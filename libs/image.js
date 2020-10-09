/**
 * Retina image size multiplicator
 * @type {number}
 */
export const RETINA_MULTIPLICATOR = 2;

const AVATAR_SIZE_32 = 32;
const AVATAR_SIZE_64 = 64;

/**
 * Checks if user has retina display
 *
 * @returns {boolean}
 */
export function isRetina() {
  return window.devicePixelRatio > 1;
}

/**
 * Apply image filter to leonardo url
 *
 * @param {string} src — leonardo image url
 * @param {number} width – image width
 * @param {number} height – image height
 * @param {string} scaleType – scale type, default `scale_scrop`, can be 'resize'
 * @returns {string}
 */
export function formLeonardoUrl(src, width, height, scaleType = 'scale_crop') {
  if (!src.includes('leonardo.osnova')) {
    return src;
  }

  if (width === undefined) {
    return src;
  }

  if (height === undefined) {
    height = width;
  }

  if (isRetina()) {
    width *= RETINA_MULTIPLICATOR;
    height *= RETINA_MULTIPLICATOR;
  }

  return `${src}-/${scaleType}/${width}x${height}/center`;
}

/**
 * Get user avatar url
 *
 * @param {object} obj - object with avatar fields
 * @param {number} size – size of image
 * @returns {string}
 */
export function getUserAvatarUrl(obj, size = AVATAR_SIZE_32) {
  if (!obj) {
    return null;
  }

  if (obj.avatarFileId) {
    if (isRetina()) {
      size *= RETINA_MULTIPLICATOR;
    }

    if (size < AVATAR_SIZE_32) {
      return obj.avatarSet.image32x32;
    } else if (size < AVATAR_SIZE_64) {
      return obj.avatarSet.image64x64;
    } else {
      return obj.avatarSet.image128x128;
    }
  }

  if (obj.avatar) {
    return formLeonardoUrl(obj.avatar, size, size);
  }
}
