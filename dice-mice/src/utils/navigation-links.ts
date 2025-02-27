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
  {
    label: 'Shields & Weapons',
    path: '/weapons',
  },
];
