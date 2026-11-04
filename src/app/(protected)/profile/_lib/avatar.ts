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

function isValidAvatarFile(file: Pick<File, "size" | "type">) {
  return ACCEPTED_AVATAR_TYPES.has(file.type) && file.size <= MAX_AVATAR_SIZE;
}

function getAvatarFallbackInitial(
  displayName: string | null,
  email: string | null,
) {
  return (displayName?.charAt(0) || email?.charAt(0) || "U").toUpperCase();
}

export {
  ACCEPTED_AVATAR_TYPES,
  getAvatarFallbackInitial,
  getAvatarSource,
  isValidAvatarFile,
  MAX_AVATAR_SIZE,
};
