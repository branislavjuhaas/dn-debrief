export const useManagementNavigation = () => {
  const navigationItems = [
    {
      label: "Správa používateľov",
      icon: "ph:users-four",
      to: "/management/users",
    },
    { label: "Správa klubov", icon: "ph:buildings", to: "/management/clubs" },
    { separator: true },
    {
      label: "Správa podujatí",
      icon: "ph:globe-hemisphere-west",
      to: "/management/events",
    },
    {
      label: "Rozhodovanie",
      icon: "ph:gavel",
      to: "/management/adjudicators",
    },
    {
      label: "Modul SP",
      icon: "ph:lightning",
      to: "/msp",
      external: true,
    },
    { separator: true },
    {
      label: "Správa obsahu",
      icon: "ph:newspaper-clipping",
      to: "/management/content",
    },
    {
      label: "Správa pladieb",
      icon: "ph:invoice",
      to: "/dev/gallery",
    },
    { separator: true },
    {
      label: "Správa DK Sučany",
      icon: "ph:bank",
      to: "/clubs/1",
      external: true,
    },
    {
      label: "Správa DK Gym. Varšavská cesta",
      icon: "ph:bank",
      to: "/clubs/2",
      external: true,
    },
  ];

  return { navigationItems };
};
