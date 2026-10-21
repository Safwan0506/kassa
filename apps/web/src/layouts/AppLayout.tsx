import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  BarChart3,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from '../components/NotificationCenter';
import './AppLayout.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/sales', icon: ShoppingCart, label: 'Ventes' },
  { to: '/products', icon: Package, label: 'Produits' },
  { to: '/stock', icon: Warehouse, label: 'Stock' },
  { to: '/reports', icon: BarChart3, label: 'Rapports' },
  { to: '/team', icon: Users, label: 'Equipe' },
] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRole(role: string): string {
  const map: Record<string, string> = {
    PROPRIETAIRE: 'Proprietaire',
    GERANT: 'Gerant',
    CAISSIER: 'Caissier',
    MAGASINIER: 'Magasinier',
  };
  return map[role] ?? role;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside
        className={`sidebar ${sidebarExpanded ? 'sidebar--expanded' : ''}`}
      >
        <button
          className="sidebar__collapse-btn"
          onClick={() => setSidebarExpanded((v) => !v)}
          aria-label={sidebarExpanded ? 'Replier le menu' : 'Deployer le menu'}
        >
          {sidebarExpanded ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        <div className="sidebar__header">
          <span className="sidebar__logo">K</span>
          <div className="sidebar__org-name">
            {user?.organizationName ?? 'Mon Organisation'}
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
              }
            >
              <Icon size={20} />
              <span className="sidebar__nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : '?'}
            </div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}</div>
              <div className="sidebar__user-role">
                {user?.shops?.[0] ? formatRole(user.shops[0].role) : ''}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="app-header__left">
            <span className="app-header__mobile-logo">Kassa</span>
            <button className="app-header__shop-selector">
              <Warehouse size={16} />
              <span>{user?.shops?.[0]?.shopName ?? 'Boutique principale'}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="app-header__right">
            <NotificationCenter />

            <button className="app-header__avatar-btn">
              <div className="sidebar__avatar sidebar__avatar--sm">
                {user ? getInitials(`${user.firstName} ${user.lastName}`) : '?'}
              </div>
              <span className="app-header__role-badge">
                {user?.shops?.[0] ? formatRole(user.shops[0].role) : ''}
              </span>
            </button>

            <button
              className="app-header__icon-btn"
              onClick={handleLogout}
              aria-label="Se deconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom Tab Bar (mobile) ── */}
      <nav className="bottom-bar">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-bar__item ${isActive ? 'bottom-bar__item--active' : ''}`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
