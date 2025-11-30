import type { User } from "#shared/types/user";

export default (user: User | null) => {
  if (!user?.name) return "Vitajte na platforme DN Cascade!";

  return `Dobrý deň, ${user.name}!`;
};
