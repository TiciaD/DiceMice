export interface NavLinks {
  label: string;
  path: string;
}

export const NavigationLinks: NavLinks[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
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
    label: 'My Characters',
    path: '/characters',
  },
  {
    label: 'Logout',
    path: '/logout',
  },
];
