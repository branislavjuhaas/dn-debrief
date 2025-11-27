import type { User } from "#shared/types/user";

const getFirstName = (name: string) => name.split(" ")[0];

export default (user: User | null) => {
  if (!user?.name) return "Vitajte na platforme DN Cascade!";

  return `Dobrý deň, ${getFirstName(user.name)}!`;
};
