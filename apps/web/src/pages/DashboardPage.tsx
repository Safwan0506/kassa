import { useEffect, useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Sliders,
  PackageX,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  dashboardApi,
  type DashboardStats,
  type StockAlert,
  type StockMovement,
  type MovementType,
} from '../lib/api';
import { formatCFA, formatDate } from '../lib/format';
import { SkeletonBox } from '../components/ui/Skeleton';
import './DashboardPage.css';

/* ── Movement type labels & badge mapping ── */

const MOVEMENT_LABELS: Record<MovementType, string> = {
  ENTRY: 'Entree',
  EXIT: 'Sortie',
  TRANSFER: 'Transfert',
  ADJUSTMENT: 'Ajustement',
};

function MovementBadge({ type }: { type: MovementType }) {
  return (
    <span className={`dashboard__movement-badge dashboard__movement-badge--${type}`}>
      {type === 'ENTRY' && <ArrowDownCircle size={12} />}
      {type === 'EXIT' && <ArrowUpCircle size={12} />}
      {type === 'TRANSFER' && <RefreshCw size={12} />}
      {type === 'ADJUSTMENT' && <Sliders size={12} />}
      {MOVEMENT_LABELS[type]}
    </span>
  );
}

/* ── Skeleton states ── */

function KpiSkeleton() {
  return (
    <div className="dashboard__kpi-skeleton">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBox width={80} height={36} borderRadius="var(--radius-md)" />
        <SkeletonBox width={120} height={14} borderRadius="var(--radius-sm)" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dashboard__table-wrapper">
      <table className="dashboard__table">
        <thead>
          <tr>
            {Array.from({ length: 4 }, (_, i) => (
              <th key={i}>
                <SkeletonBox width="60%" height={12} borderRadius="var(--radius-sm)" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: 4 }, (_, c) => (
                <td key={c}>
                  <SkeletonBox width="80%" height={14} borderRadius="var(--radius-sm)" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Error state ── */

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="dashboard__error">
      <AlertTriangle size={32} className="dashboard__error-icon" />
      <p className="dashboard__error-message">{message}</p>
      <button className="dashboard__error-retry" onClick={onRetry}>
        <RotateCcw size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Reessayer
      </button>
    </div>
  );
}

/* ── Main Dashboard ── */

export default function DashboardPage() {
  const { user } = useAuth();
  const shopId = user?.shops?.[0]?.shopId ?? '';
  const firstName = user?.firstName ?? 'Utilisateur';
  const shopName = user?.shops?.[0]?.shopName ?? 'Boutique principale';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      dashboardApi.getStats(shopId),
      dashboardApi.getAlerts(shopId),
      dashboardApi.getRecentMovements(shopId),
    ])
      .then(([s, a, m]) => {
        setStats(s);
        setAlerts(a);
        setMovements(m);
      })
      .catch(() => {
        setError('Impossible de charger les donnees du tableau de bord.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  return (
    <div className="dashboard">
      {/* ── Greeting ── */}
      <div className="dashboard__greeting">
        <h1>Bonjour, {firstName}</h1>
        <p>Bienvenue sur Kassa &mdash; {shopName}</p>
      </div>

      {/* ── KPI Cards ── */}
      {error && !loading ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <>
          <div className="dashboard__kpi-grid">
            {loading ? (
              <>
                <KpiSkeleton />
                <KpiSkeleton />
                <KpiSkeleton />
                <KpiSkeleton />
              </>
            ) : (
              <>
                <div className="dashboard__kpi-card dashboard__kpi-card--green">
                  <span className="dashboard__kpi-value">
                    {stats?.totalProducts ?? 0}
                  </span>
                  <span className="dashboard__kpi-label">Produits</span>
                </div>

                <div className={`dashboard__kpi-card ${(stats?.outOfStock ?? 0) > 0 ? 'dashboard__kpi-card--red' : 'dashboard__kpi-card--green'}`}>
                  <span className="dashboard__kpi-value">
                    {stats?.outOfStock ?? 0}
                  </span>
                  <span className="dashboard__kpi-label">Ruptures de stock</span>
                </div>

                <div className="dashboard__kpi-card dashboard__kpi-card--ochre">
                  <span className="dashboard__kpi-value">
                    {formatCFA(stats?.stockValue ?? 0)}
                  </span>
                  <span className="dashboard__kpi-label">Valeur du stock</span>
                </div>

                <div className="dashboard__kpi-card dashboard__kpi-card--green">
                  <span className="dashboard__kpi-value">
                    {stats?.todayMovements ?? 0}
                  </span>
                  <span className="dashboard__kpi-label">Mouvements aujourd&apos;hui</span>
                </div>
              </>
            )}
          </div>

          {/* ── Alertes de rupture ── */}
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">
                <AlertTriangle size={18} />
                Alertes de rupture
                {!loading && alerts.length > 0 && (
                  <span className="dashboard__section-count">{alerts.length}</span>
                )}
              </h2>
            </div>

            {loading ? (
              <TableSkeleton rows={3} />
            ) : alerts.length === 0 ? (
              <div className="dashboard__empty">
                <Package size={40} className="dashboard__empty-icon" />
                <p className="dashboard__empty-title">Aucune alerte</p>
                <p className="dashboard__empty-desc">
                  Tous vos produits sont au-dessus du seuil d&apos;alerte.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="dashboard__table-wrapper">
                  <table className="dashboard__table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>SKU</th>
                        <th>Stock actuel</th>
                        <th>Seuil</th>
                        <th>Boutique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((a) => (
                        <tr key={`${a.productId}-${a.shopId}`}>
                          <td style={{ fontWeight: 500 }}>{a.productName}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                            {a.sku}
                          </td>
                          <td>
                            <span className="dashboard__table-qty dashboard__table-qty--danger">
                              {a.currentStock}
                            </span>
                          </td>
                          <td>
                            <span className="dashboard__table-qty">{a.alertThreshold}</span>
                          </td>
                          <td>{a.shopName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="dashboard__card-list">
                  {alerts.map((a) => (
                    <div key={`${a.productId}-${a.shopId}-m`} className="dashboard__alert-card">
                      <div className="dashboard__alert-card-name">{a.productName}</div>
                      <div className="dashboard__alert-card-row">
                        <span>Stock actuel</span>
                        <span className="dashboard__table-qty dashboard__table-qty--danger">
                          {a.currentStock}
                        </span>
                      </div>
                      <div className="dashboard__alert-card-row">
                        <span>Seuil d&apos;alerte</span>
                        <span>{a.alertThreshold}</span>
                      </div>
                      <div className="dashboard__alert-card-row">
                        <span>Boutique</span>
                        <span>{a.shopName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Derniers mouvements ── */}
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">
                <Activity size={18} />
                Derniers mouvements
              </h2>
            </div>

            {loading ? (
              <TableSkeleton rows={5} />
            ) : movements.length === 0 ? (
              <div className="dashboard__empty">
                <PackageX size={40} className="dashboard__empty-icon" />
                <p className="dashboard__empty-title">Aucun mouvement</p>
                <p className="dashboard__empty-desc">
                  Aucun mouvement de stock enregistre pour le moment.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="dashboard__table-wrapper">
                  <table className="dashboard__table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Produit</th>
                        <th>Quantite</th>
                        <th>Date</th>
                        <th>Utilisateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.slice(0, 10).map((m) => (
                        <tr key={m.id}>
                          <td>
                            <MovementBadge type={m.type} />
                          </td>
                          <td style={{ fontWeight: 500 }}>{m.productName}</td>
                          <td>
                            <span
                              className={`dashboard__table-qty ${
                                m.type === 'ENTRY'
                                  ? 'dashboard__table-qty--positive'
                                  : m.type === 'EXIT'
                                    ? 'dashboard__table-qty--negative'
                                    : ''
                              }`}
                            >
                              {m.type === 'ENTRY' ? '+' : m.type === 'EXIT' ? '-' : ''}
                              {m.quantity}
                            </span>
                          </td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {formatDate(m.createdAt)}
                          </td>
                          <td>{m.userName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="dashboard__card-list">
                  {movements.slice(0, 10).map((m) => (
                    <div key={`${m.id}-m`} className="dashboard__movement-card">
                      <div className="dashboard__movement-card-header">
                        <span className="dashboard__movement-card-product">{m.productName}</span>
                        <MovementBadge type={m.type} />
                      </div>
                      <div className="dashboard__movement-card-details">
                        <span>
                          Qte:{' '}
                          <span
                            className={`dashboard__table-qty ${
                              m.type === 'ENTRY'
                                ? 'dashboard__table-qty--positive'
                                : m.type === 'EXIT'
                                  ? 'dashboard__table-qty--negative'
                                  : ''
                            }`}
                          >
                            {m.type === 'ENTRY' ? '+' : m.type === 'EXIT' ? '-' : ''}
                            {m.quantity}
                          </span>
                        </span>
                        <span>{formatDate(m.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Par {m.userName}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
