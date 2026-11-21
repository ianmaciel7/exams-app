const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getAvatarSource(
  preview: string | null,
  photoURL: string | null,
  version: number,
) {
  if (preview) return preview;
  if (!photoURL || !version) return photoURL ?? undefined;

  return `${photoURL}${photoURL.includes("?") ? "&" : "?"}v=${version}`;
}

export { ACCEPTED_AVATAR_TYPES, getAvatarSource, MAX_AVATAR_SIZE };
