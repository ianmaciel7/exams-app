/** Roles stored in the Firebase Auth `role` custom claim, lowest privilege first. */
const userRoles = ["user", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

/** Unknown, missing or malformed claims never grant more than the base role. */
export function readUserRole(claims: Record<string, unknown>): UserRole {
  return userRoles.find((role) => role === claims.role) ?? "user";
}

/** True when `actual` is at least as privileged as `required`. */
export function hasRole(actual: UserRole, required: UserRole): boolean {
  return userRoles.indexOf(actual) >= userRoles.indexOf(required);
}
