import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Package } from 'lucide-react';
import { reportsApi } from '../lib/api';
import type {
  RevenueReport,
  TopProduct,
  MarginReport,
  StockEvolution,
} from '../lib/api';
import { formatCFA } from '../lib/format';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/Skeleton';
import './ReportsPage.css';

type TabKey = 'revenue' | 'top-products' | 'margins' | 'stock-evolution';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'revenue', label: 'Chiffre d\'affaires' },
  { key: 'top-products', label: 'Top produits' },
  { key: 'margins', label: 'Marges' },
  { key: 'stock-evolution', label: 'Evolution stock' },
];

function getDefaultDates() {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  return { from, to };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const shopId = user?.shops?.[0]?.shopId || '';

  const [tab, setTab] = useState<TabKey>('revenue');
  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [loading, setLoading] = useState(false);

  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [margins, setMargins] = useState<MarginReport[]>([]);
  const [stockEvolution, setStockEvolution] = useState<StockEvolution | null>(null);

  const fetchData = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const filters = { shopId, from, to };
      switch (tab) {
        case 'revenue':
          setRevenue(await reportsApi.revenue(filters));
          break;
        case 'top-products':
          setTopProducts(await reportsApi.topProducts({ ...filters, limit: 10 }));
          break;
        case 'margins':
          setMargins(await reportsApi.margins(filters));
          break;
        case 'stock-evolution':
          setStockEvolution(await reportsApi.stockEvolution(filters));
          break;
      }
    } catch {
      addToast('Erreur lors du chargement du rapport', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, shopId, from, to, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportCsv = () => {
    let csv = '';
    if (tab === 'revenue' && revenue) {
      csv = 'Periode,CA HT,TVA,Nb factures\n';
      revenue.periods.forEach((p) => {
        csv += `${p.period},${p.revenue},${p.tax},${p.count}\n`;
      });
    } else if (tab === 'top-products') {
      csv = 'Produit,SKU,Quantite,CA\n';
      topProducts.forEach((p) => {
        csv += `${p.productName},${p.sku},${p.totalQuantity},${p.totalRevenue}\n`;
      });
    } else if (tab === 'margins') {
      csv = 'Produit,SKU,Prix achat,Prix vente,Marge/u,Marge %,Vendus,Marge totale\n';
      margins.forEach((m) => {
        csv += `${m.productName},${m.sku},${m.buyPrice},${m.sellPrice},${m.marginPerUnit},${m.marginPercent},${m.totalSold},${m.totalMargin}\n`;
      });
    } else if (tab === 'stock-evolution' && stockEvolution) {
      csv = 'Date,Entrees,Sorties,Net\n';
      stockEvolution.points.forEach((p) => {
        csv += `${p.date},${p.entries},${p.exits},${p.net}\n`;
      });
    }
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${tab}-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports">
      <div className="reports__header">
        <h1 className="reports__title">Rapports</h1>
      </div>

      {/* Filters */}
      <div className="reports__filters">
        <div className="reports__filter-field">
          <label>Du</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="reports__filter-field">
          <label>Au</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="reports__tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`reports__tab ${tab === t.key ? 'reports__tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Export */}
      <div className="reports__export">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download size={14} /> Exporter CSV
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : (
        <>
          {tab === 'revenue' && <RevenueTab data={revenue} />}
          {tab === 'top-products' && <TopProductsTab data={topProducts} />}
          {tab === 'margins' && <MarginsTab data={margins} />}
          {tab === 'stock-evolution' && <StockEvolutionTab data={stockEvolution} />}
        </>
      )}
    </div>
  );
}

/* ── Revenue Tab ── */

function RevenueTab({ data }: { data: RevenueReport | null }) {
  if (!data || data.invoiceCount === 0) {
    return (
      <div className="reports__empty">
        <BarChart3 size={48} className="reports__empty-icon" />
        <div className="reports__empty-title">Aucune donnee</div>
        <div className="reports__empty-desc">Pas de factures sur cette periode.</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.periods.map((p) => p.revenue), 1);

  return (
    <>
      <div className="reports__kpi-grid">
        <div className="reports__kpi-card">
          <span className="reports__kpi-label">CA HT</span>
          <span className="reports__kpi-value">{formatCFA(data.totalRevenue)}</span>
        </div>
        <div className="reports__kpi-card">
          <span className="reports__kpi-label">TVA</span>
          <span className="reports__kpi-value">{formatCFA(data.totalTax)}</span>
        </div>
        <div className="reports__kpi-card">
          <span className="reports__kpi-label">Encaisse</span>
          <span className="reports__kpi-value reports__kpi-value--success">{formatCFA(data.totalPaid)}</span>
        </div>
        <div className="reports__kpi-card">
          <span className="reports__kpi-label">Reste du</span>
          <span className={`reports__kpi-value ${data.totalDue > 0 ? 'reports__kpi-value--error' : ''}`}>
            {formatCFA(data.totalDue)}
          </span>
        </div>
        <div className="reports__kpi-card">
          <span className="reports__kpi-label">Factures</span>
          <span className="reports__kpi-value">{data.invoiceCount}</span>
        </div>
      </div>

      {data.periods.length > 0 && (
        <div className="reports__chart">
          <div className="reports__chart-title">CA journalier</div>
          <div className="reports__bars">
            {data.periods.map((p) => (
              <div key={p.period} className="reports__bar-col">
                <div className="reports__bar-value">{formatCFA(p.revenue)}</div>
                <div
                  className="reports__bar"
                  style={{ height: `${(p.revenue / maxRevenue) * 100}%` }}
                  title={`${p.period}: ${formatCFA(p.revenue)}`}
                  aria-label={`${p.period}: ${formatCFA(p.revenue)}`}
                />
                <div className="reports__bar-label">{p.period.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Top Products Tab ── */

function TopProductsTab({ data }: { data: TopProduct[] }) {
  if (data.length === 0) {
    return (
      <div className="reports__empty">
        <TrendingUp size={48} className="reports__empty-icon" />
        <div className="reports__empty-title">Aucune vente</div>
        <div className="reports__empty-desc">Pas de ventes sur cette periode.</div>
      </div>
    );
  }

  const maxQty = Math.max(...data.map((p) => p.totalQuantity), 1);

  return (
    <>
      <div className="reports__chart">
        <div className="reports__chart-title">Produits les plus vendus</div>
        <div className="reports__bars">
          {data.map((p) => (
            <div key={p.productId} className="reports__bar-col">
              <div className="reports__bar-value">{p.totalQuantity}</div>
              <div
                className="reports__bar reports__bar--secondary"
                style={{ height: `${(p.totalQuantity / maxQty) * 100}%` }}
                title={`${p.productName}: ${p.totalQuantity} vendus`}
                aria-label={`${p.productName}: ${p.totalQuantity} vendus`}
              />
              <div className="reports__bar-label">{p.productName}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports__table-wrapper">
        <table className="reports__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Produit</th>
              <th>SKU</th>
              <th>Quantite</th>
              <th>CA</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={p.productId}>
                <td>{i + 1}</td>
                <td className="reports__table-cell--bold">{p.productName}</td>
                <td className="reports__table-cell--muted">{p.sku}</td>
                <td className="reports__table-cell--mono-bold">{p.totalQuantity}</td>
                <td className="reports__table-cell--mono">{formatCFA(p.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Margins Tab ── */

function MarginsTab({ data }: { data: MarginReport[] }) {
  if (data.length === 0) {
    return (
      <div className="reports__empty">
        <Package size={48} className="reports__empty-icon" />
        <div className="reports__empty-title">Aucune donnee</div>
        <div className="reports__empty-desc">Pas de marges a afficher.</div>
      </div>
    );
  }

  return (
    <div className="reports__table-wrapper">
      <table className="reports__table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Prix achat</th>
            <th>Prix vente</th>
            <th>Marge/u</th>
            <th>Marge %</th>
            <th>Vendus</th>
            <th>Marge totale</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.productId}>
              <td className="reports__table-cell--bold">{m.productName}</td>
              <td className="reports__table-cell--mono">{formatCFA(m.buyPrice)}</td>
              <td className="reports__table-cell--mono">{formatCFA(m.sellPrice)}</td>
              <td className={`reports__table-cell--conditional ${m.marginPerUnit > 0 ? 'reports__table-cell--success' : 'reports__table-cell--error'}`}>
                {formatCFA(m.marginPerUnit)}
              </td>
              <td className="reports__table-cell--mono">{m.marginPercent}%</td>
              <td className="reports__table-cell--mono-bold">{m.totalSold}</td>
              <td className={`reports__table-cell--mono-bolder ${m.totalMargin > 0 ? 'reports__table-cell--success' : 'reports__table-cell--error'}`}>
                {formatCFA(m.totalMargin)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Stock Evolution Tab ── */

function StockEvolutionTab({ data }: { data: StockEvolution | null }) {
  if (!data || data.points.length === 0) {
    return (
      <div className="reports__empty">
        <BarChart3 size={48} className="reports__empty-icon" />
        <div className="reports__empty-title">Aucun mouvement</div>
        <div className="reports__empty-desc">Pas de mouvements de stock sur cette periode.</div>
      </div>
    );
  }

  const maxVal = Math.max(...data.points.map((p) => Math.max(p.entries, p.exits)), 1);

  return (
    <>
      <div className="reports__chart">
        <div className="reports__chart-title">Entrees vs Sorties par jour</div>
        <div className="reports__bars">
          {data.points.map((p) => (
            <div key={p.date} className="reports__bar-col reports__bar-col--tight">
              <div className="reports__bar-value reports__bar-value--success">+{p.entries}</div>
              <div
                className="reports__bar reports__bar--entry"
                style={{ height: `${(p.entries / maxVal) * 45}%` }}
                aria-label={`Entrees: ${p.entries}`}
              />
              <div
                className="reports__bar reports__bar--exit"
                style={{ height: `${(p.exits / maxVal) * 45}%` }}
                aria-label={`Sorties: ${p.exits}`}
              />
              <div className="reports__bar-value reports__bar-value--error">-{p.exits}</div>
              <div className="reports__bar-label">{p.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports__table-wrapper">
        <table className="reports__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Entrees</th>
              <th>Sorties</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {data.points.map((p) => (
              <tr key={p.date}>
                <td>{p.date}</td>
                <td className="reports__table-cell--conditional reports__table-cell--success">+{p.entries}</td>
                <td className="reports__table-cell--conditional reports__table-cell--error">-{p.exits}</td>
                <td className={`reports__table-cell--mono-bold ${p.net >= 0 ? 'reports__table-cell--success' : 'reports__table-cell--error'}`}>
                  {p.net >= 0 ? '+' : ''}{p.net}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
