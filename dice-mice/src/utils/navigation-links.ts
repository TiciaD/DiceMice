export interface NavLinks {
  label: string;
  path: string;
}

export const NavigationLinks: NavLinks[] = [
  {
    label: 'Create Mouse',
    path: '/characters/create',
  },
  {
    label: 'Classes',
    path: '/classes',
  },
  {
    label: 'Skills',
    path: '/skills',
  },
  {
    label: 'Counties',
    path: '/counties',
  },
  // {
  //   label: 'Shields & Weapons',
  //   path: '/weapons',
  // },
];

export const GameRulesMenuNavigationLinks: NavLinks[] = [
  {
    label: 'Classes',
    path: '/classes',
  },
  {
    label: 'Skills',
    path: '/skills',
  },
  {
    label: 'Counties',
    path: '/counties',
  },
  {
    label: 'Shields & Weapons',
    path: '/weapons',
  },
];

export const ToolsMenuNavigationLinks: NavLinks[] = [
  {
    label: 'Create Mouse',
    path: '/characters/create',
  },
];

export const UserMenuNavigationLinks: NavLinks[] = [
  {
    label: 'My House',
    path: '/house',
  },
  {
    label: 'Preferences',
    path: '/preferences',
  },
  {
    label: 'Logout',
    path: '/logout',
  },
];
