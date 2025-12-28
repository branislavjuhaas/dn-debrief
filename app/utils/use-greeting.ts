import type { User } from "#shared/types/user";

/**
 * Returns a localized greeting for the provided user.
 *
 * If `user` is `null` or does not have a `name`, a generic welcome message
 * for the DN Cascade platform is returned.
 *
 * @param user - The current user object or null.
 * @returns Greeting message in Slovak.
 */
export default (user: User | null) => {
  if (!user?.name) return "Vitajte na platforme DN Cascade!";

  return `Dobrý deň, ${user.name}!`;
};
