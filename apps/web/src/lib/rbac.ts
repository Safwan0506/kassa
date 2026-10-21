export type Role = 'PROPRIETAIRE' | 'GERANT' | 'CAISSIER';

const ROLE_RANK: Record<Role, number> = {
  PROPRIETAIRE: 3,
  GERANT: 2,
  CAISSIER: 1,
};

export function highestRole(roles: string[]): Role {
  let best: Role = 'CAISSIER';
  for (const r of roles) {
    const role = r as Role;
    if (ROLE_RANK[role] > ROLE_RANK[best]) best = role;
  }
  return best;
}

const NAV_ACCESS: Record<string, Role[]> = {
  '/dashboard': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  '/sales': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  '/products': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  '/stock': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  '/customers': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  '/reports': ['PROPRIETAIRE', 'GERANT'],
  '/team': ['PROPRIETAIRE'],
};

export function canAccessNav(role: Role, path: string): boolean {
  const allowed = NAV_ACCESS[path];
  return allowed ? allowed.includes(role) : false;
}

type Feature =
  | 'products:create' | 'products:edit' | 'products:delete'
  | 'stock:create' | 'stock:adjust'
  | 'sales:create' | 'sales:validate' | 'sales:cancel' | 'sales:viewAll'
  | 'customers:create' | 'customers:edit' | 'customers:delete'
  | 'reports:view' | 'reports:export'
  | 'team:manage';

const FEATURE_ACCESS: Record<Feature, Role[]> = {
  'products:create': ['PROPRIETAIRE', 'GERANT'],
  'products:edit': ['PROPRIETAIRE', 'GERANT'],
  'products:delete': ['PROPRIETAIRE', 'GERANT'],
  'stock:create': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  'stock:adjust': ['PROPRIETAIRE', 'GERANT'],
  'sales:create': ['PROPRIETAIRE', 'GERANT', 'CAISSIER'],
  'sales:validate': ['PROPRIETAIRE', 'GERANT'],
  'sales:cancel': ['PROPRIETAIRE', 'GERANT'],
  'sales:viewAll': ['PROPRIETAIRE', 'GERANT'],
  'customers:create': ['PROPRIETAIRE', 'GERANT'],
  'customers:edit': ['PROPRIETAIRE', 'GERANT'],
  'customers:delete': ['PROPRIETAIRE', 'GERANT'],
  'reports:view': ['PROPRIETAIRE', 'GERANT'],
  'reports:export': ['PROPRIETAIRE', 'GERANT'],
  'team:manage': ['PROPRIETAIRE'],
};

export function can(role: Role, feature: Feature): boolean {
  const allowed = FEATURE_ACCESS[feature];
  return allowed ? allowed.includes(role) : false;
}

export function getRoleForShop(shops: { shopId: string; role: string }[], shopId: string): Role {
  const match = shops.find((s) => s.shopId === shopId);
  return (match?.role as Role) ?? 'CAISSIER';
}
