export function getSafeNextUrl(candidate: string | null | undefined): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  try {
    const internalOrigin = "https://notes-app.invalid";
    const parsed = new URL(candidate, internalOrigin);

    if (parsed.origin !== internalOrigin) {
      return "/";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}
