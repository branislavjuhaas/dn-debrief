import type { NavigationMenuItem } from "#ui/components/NavigationMenu.vue";
import type { ClubManagement } from "#shared/types/club";

const baseRoute = "/manage";

const links = [
  [
    {
      label: "Správa používateľov",
      icon: "ph:users-four",
      to: `${baseRoute}/users`,
      roles: ["admin", "developer"],
    },
    {
      label: "Správa klubov",
      icon: "ph:city",
      to: `${baseRoute}/clubs`,
      roles: ["admin", "developer"],
    },
  ],
  [
    {
      label: "Správa podujatí",
      icon: "ph:ticket",
      to: `${baseRoute}/events`,
      roles: ["admin", "developer", "organizer", "junior_organizer"],
    },
  ],
  [
    {
      label: "Správa obsahu",
      icon: "ph:newspaper-clipping",
      to: `${baseRoute}/content`,
      roles: ["admin", "developer"],
    },
    {
      label: "Správa platieb",
      icon: "ph:coins",
      disabled: true,
      roles: ["admin", "developer"],
    },
  ],
] satisfies (NavigationMenuItem & { roles?: Role[] })[][];

export default (user: User | null) => {
  if (!user) return [];

  const filtered = links.map((group) =>
    group.filter(
      (link) => !link.roles || (link.roles as Role[]).includes(user.role),
    ),
  );

  if (user.clubManagements && user.clubManagements.length > 0) {
    const clubsGroup = user.clubManagements.map(
      (clubManagement: ClubManagement) => ({
        label: `Správa DK ${clubManagement.club.name}`,
        icon: "ph:bank",
        to: `${baseRoute}/clubs/${clubManagement.club.id}`,
      }),
    );

    filtered.push(clubsGroup as any);
  }

  return filtered;
};
