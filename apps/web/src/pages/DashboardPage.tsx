import {
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const PLACEHOLDER_CARDS = [
  {
    icon: ShoppingCart,
    iconVariant: 'green' as const,
    title: 'Ventes du jour',
    description: 'Consultez les ventes en temps reel, les tickets et le chiffre d\'affaires de votre boutique.',
    badge: 'Phase 2',
  },
  {
    icon: Package,
    iconVariant: 'ochre' as const,
    title: 'Catalogue produits',
    description: 'Gerez vos produits, categories, prix et promotions depuis un seul endroit.',
    badge: 'Phase 2',
  },
  {
    icon: Warehouse,
    iconVariant: 'green' as const,
    title: 'Gestion de stock',
    description: 'Suivez les niveaux de stock, les entrees et sorties, et les alertes de rupture.',
    badge: 'Phase 2',
  },
  {
    icon: Users,
    iconVariant: 'ochre' as const,
    title: 'Equipe',
    description: 'Gerez les membres de votre equipe, les roles et les permissions d\'acces.',
    badge: 'Phase 2',
  },
  {
    icon: TrendingUp,
    iconVariant: 'green' as const,
    title: 'Rapports',
    description: 'Analysez les performances de vos boutiques avec des rapports detailles.',
    badge: 'Phase 2',
  },
  {
    icon: BarChart3,
    iconVariant: 'ochre' as const,
    title: 'Tableau de bord avance',
    description: 'Visualisez les KPIs, tendances et comparaisons entre boutiques.',
    badge: 'Phase 2',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.firstName ?? 'Utilisateur';
  const shopName = user?.shops?.[0]?.shopName ?? 'Boutique principale';

  return (
    <div className="dashboard">
      <div className="dashboard__greeting">
        <h1>Bonjour, {firstName}</h1>
        <p>
          Bienvenue sur Kassa &mdash; {shopName}
        </p>
      </div>

      <div className="dashboard__grid">
        {PLACEHOLDER_CARDS.map((card) => (
          <div key={card.title} className="dashboard__card">
            <div
              className={`dashboard__card-icon dashboard__card-icon--${card.iconVariant}`}
            >
              <card.icon size={20} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <span className="dashboard__card-badge">{card.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
