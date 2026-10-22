import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Sliders,
  PackageX,
  AlertTriangle,
  RotateCcw,
  ArrowRightLeft,
  ScanBarcode,
} from 'lucide-react';
import { stockApi, productsApi } from '../lib/api';
import type {
  StockLevel,
  StockMovement,
  StockTransfer,
  MovementType,
  Product,
} from '../lib/api';
import { formatDate } from '../lib/format';
import { useDebounce } from '../lib/hooks';
import { useAuth } from '../contexts/AuthContext';
import { highestRole, can } from '../lib/rbac';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/Skeleton';
import BarcodeScanner from '../components/BarcodeScanner';
import './StockPage.css';

/* ── Types ── */

type TabKey = 'levels' | 'movements' | 'transfers';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'levels', label: 'Niveaux de stock' },
  { key: 'movements', label: 'Mouvements' },
  { key: 'transfers', label: 'Transferts' },
];

const MOVEMENT_LABELS: Record<MovementType, string> = {
  ENTRY: 'Entree',
  EXIT: 'Sortie',
  TRANSFER: 'Transfert',
  ADJUSTMENT: 'Ajustement',
};

/* ── Movement badge ── */

function MovementBadge({ type }: { type: MovementType }) {
  return (
    <span className={`stock__movement-badge stock__movement-badge--${type}`}>
      {type === 'ENTRY' && <ArrowDownCircle size={12} />}
      {type === 'EXIT' && <ArrowUpCircle size={12} />}
      {type === 'TRANSFER' && <RefreshCw size={12} />}
      {type === 'ADJUSTMENT' && <Sliders size={12} />}
      {MOVEMENT_LABELS[type]}
    </span>
  );
}

/* ── Stock status ── */

function StockStatus({ quantity, threshold }: { quantity: number; threshold: number }) {
  if (quantity <= 0) return <Badge variant="error">Rupture</Badge>;
  if (quantity <= threshold) return <Badge variant="warning">Alerte</Badge>;
  return <Badge variant="success">OK</Badge>;
}

/* ── Zod schemas ── */

const movementSchema = z.object({
  productId: z.string().min(1, 'Le produit est requis'),
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT']),
  quantity: z.number().min(1, 'La quantite doit etre superieure a 0'),
  reason: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

const transferSchema = z.object({
  productId: z.string().min(1, 'Le produit est requis'),
  fromShopId: z.string().min(1, 'La boutique source est requise'),
  toShopId: z.string().min(1, 'La boutique destination est requise'),
  quantity: z.number().min(1, 'La quantite doit etre superieure a 0'),
  reason: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

/* ── Main Component ── */

export default function StockPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const shops = user?.shops ?? [];
  const role = highestRole(shops.map((s) => s.role));
  const canCreateMovement = can(role, 'stock:create');
  const canAdjust = can(role, 'stock:adjust');
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.shopId ?? '');
  const shopId = selectedShopId || (shops[0]?.shopId ?? '');

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState<TabKey>('levels');

  /* ── Data state ── */
  const [levels, setLevels] = useState<StockLevel[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Filter state ── */
  const [levelSearch, setLevelSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedLevelSearch = useDebounce(levelSearch, 300);

  /* ── Modal state ── */
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<'movement' | 'transfer'>('movement');

  /* ── Forms ── */
  const movementForm = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: { productId: '', type: 'ENTRY' as const, quantity: 1, reason: '' },
  });

  const transferForm = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: { productId: '', fromShopId: shopId, toShopId: '', quantity: 1, reason: '' },
  });

  /* ── Fetch products for dropdowns ── */
  useEffect(() => {
    productsApi
      .list({ limit: 1000 })
      .then((res) => setProducts(res.data))
      .catch(() => {
        /* silent */
      });
  }, []);

  /* ── Fetch data based on active tab ── */
  const fetchTabData = useCallback(() => {
    if (!shopId) return;
    setLoading(true);
    setError(null);

    if (activeTab === 'levels') {
      stockApi
        .getLevels(shopId)
        .then(setLevels)
        .catch(() => setError('Impossible de charger les niveaux de stock.'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'movements') {
      stockApi
        .getMovements(shopId, {
          type: (movementTypeFilter as MovementType) || undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        })
        .then(setMovements)
        .catch(() => setError('Impossible de charger les mouvements.'))
        .finally(() => setLoading(false));
    } else {
      stockApi
        .getTransfers(shopId)
        .then(setTransfers)
        .catch(() => setError('Impossible de charger les transferts.'))
        .finally(() => setLoading(false));
    }
  }, [shopId, activeTab, movementTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  /* ── Filtered levels ── */
  const filteredLevels = debouncedLevelSearch
    ? levels.filter((l) =>
        l.productName.toLowerCase().includes(debouncedLevelSearch.toLowerCase()),
      )
    : levels;

  /* ── Submit movement ── */
  const onSubmitMovement = async (data: MovementFormData) => {
    setSubmitting(true);
    try {
      await stockApi.createMovement({ ...data, shopId });
      toast({ title: 'Mouvement enregistre', variant: 'success' });
      setMovementModalOpen(false);
      movementForm.reset({ productId: '', type: 'ENTRY', quantity: 1, reason: '' });
      fetchTabData();
    } catch {
      toast({ title: 'Erreur lors de la creation', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Submit transfer ── */
  const onSubmitTransfer = async (data: TransferFormData) => {
    setSubmitting(true);
    try {
      await stockApi.createTransfer(data);
      toast({ title: 'Transfert enregistre', variant: 'success' });
      setTransferModalOpen(false);
      transferForm.reset({ productId: '', fromShopId: shopId, toShopId: '', quantity: 1, reason: '' });
      fetchTabData();
    } catch {
      toast({ title: 'Erreur lors du transfert', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Barcode scan handler ── */
  const handleBarcodeScan = (barcode: string) => {
    setScannerOpen(false);
    const product = products.find((p) => p.barcode === barcode || p.sku === barcode);
    if (product) {
      if (scanTarget === 'movement') {
        movementForm.setValue('productId', product.id);
      } else {
        transferForm.setValue('productId', product.id);
      }
      toast({ title: `Produit trouve : ${product.name}`, variant: 'success' });
    } else {
      toast({ title: `Aucun produit avec le code ${barcode}`, variant: 'warning' });
    }
  };

  /* ── Open movement modal ── */
  const openMovementModal = () => {
    movementForm.reset({ productId: '', type: 'ENTRY', quantity: 1, reason: '' });
    setMovementModalOpen(true);
  };

  /* ── Open transfer modal ── */
  const openTransferModal = () => {
    transferForm.reset({ productId: '', fromShopId: shopId, toShopId: '', quantity: 1, reason: '' });
    setTransferModalOpen(true);
  };

  return (
    <div className="stock">
      {/* ── Header ── */}
      <div className="stock__header">
        <h1 className="stock__title">Stock</h1>
        {shops.length > 1 && (
          <select
            className="stock__shop-select"
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
          >
            {shops.map((s) => (
              <option key={s.shopId} value={s.shopId}>{s.shopName}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="stock__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`stock__tab ${activeTab === tab.key ? 'stock__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Error state ── */}
      {error && !loading && (
        <div className="stock__error">
          <AlertTriangle size={32} className="stock__error-icon" />
          <p className="stock__error-message">{error}</p>
          <Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={fetchTabData}>
            Reessayer
          </Button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: Niveaux de stock                                           */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'levels' && (
        <>
          <div className="stock__toolbar">
            <div className="stock__toolbar-left">
              <div className="stock__search">
                <span className="stock__search-icon">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={levelSearch}
                  onChange={(e) => setLevelSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonTable rows={6} cols={5} />
          ) : filteredLevels.length === 0 ? (
            <div className="stock__empty">
              <PackageX size={48} className="stock__empty-icon" />
              <p className="stock__empty-title">Aucun produit en stock</p>
              <p className="stock__empty-desc">
                {debouncedLevelSearch
                  ? 'Aucun produit ne correspond a votre recherche.'
                  : 'Aucun niveau de stock disponible pour cette boutique.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="stock__table-wrapper">
                <table className="stock__table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Categorie</th>
                      <th>Quantite</th>
                      <th>Seuil d&apos;alerte</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLevels.map((l) => (
                      <tr key={l.productId}>
                        <td className="stock__table-cell--bold">{l.productName}</td>
                        <td>{l.categoryName ?? '—'}</td>
                        <td>
                          <span className="stock__qty">{l.quantity}</span>
                          <span className="stock__table-cell--unit">
                            {l.unit}
                          </span>
                        </td>
                        <td>
                          <span className="stock__qty stock__qty--sm">{l.alertThreshold}</span>
                        </td>
                        <td>
                          <StockStatus quantity={l.quantity} threshold={l.alertThreshold} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="stock__card-list">
                {filteredLevels.map((l) => (
                  <div key={l.productId} className="stock__level-card">
                    <div className="stock__level-card-header">
                      <span className="stock__level-card-name">{l.productName}</span>
                      <StockStatus quantity={l.quantity} threshold={l.alertThreshold} />
                    </div>
                    <div className="stock__level-card-qty">{l.quantity}</div>
                    <div className="stock__level-card-row">
                      <span>Categorie</span>
                      <span>{l.categoryName ?? '—'}</span>
                    </div>
                    <div className="stock__level-card-row">
                      <span>Seuil d&apos;alerte</span>
                      <span className="stock__level-card-row--mono">{l.alertThreshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: Mouvements                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'movements' && (
        <>
          <div className="stock__toolbar">
            <div className="stock__toolbar-left">
              <select
                className="stock__filter-select"
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="ENTRY">Entree</option>
                <option value="EXIT">Sortie</option>
                <option value="ADJUSTMENT">Ajustement</option>
                <option value="TRANSFER">Transfert</option>
              </select>
              <input
                type="date"
                className="stock__date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Du"
              />
              <input
                type="date"
                className="stock__date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Au"
              />
            </div>
            {canCreateMovement && (
              <Button variant="primary" size="md" icon={<Plus size={18} />} onClick={openMovementModal}>
                Nouveau mouvement
              </Button>
            )}
          </div>

          {loading ? (
            <SkeletonTable rows={6} cols={6} />
          ) : movements.length === 0 ? (
            <div className="stock__empty">
              <PackageX size={48} className="stock__empty-icon" />
              <p className="stock__empty-title">Aucun mouvement</p>
              <p className="stock__empty-desc">Aucun mouvement de stock enregistre.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="stock__table-wrapper">
                <table className="stock__table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Produit</th>
                      <th>Quantite</th>
                      <th>Raison</th>
                      <th>Date</th>
                      <th>Utilisateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <MovementBadge type={m.type} />
                        </td>
                        <td className="stock__table-cell--bold">{m.productName}</td>
                        <td>
                          <span
                            className={`stock__qty stock__qty--sm ${
                              m.type === 'ENTRY'
                                ? 'stock__qty--positive'
                                : m.type === 'EXIT'
                                  ? 'stock__qty--negative'
                                  : ''
                            }`}
                          >
                            {m.type === 'ENTRY' ? '+' : m.type === 'EXIT' ? '-' : ''}
                            {m.quantity}
                          </span>
                        </td>
                        <td className="stock__table-cell--reason">
                          {m.reason || '—'}
                        </td>
                        <td className="stock__table-cell--muted">
                          {formatDate(m.createdAt)}
                        </td>
                        <td>{m.userName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="stock__card-list">
                {movements.map((m) => (
                  <div key={m.id} className="stock__movement-card">
                    <div className="stock__movement-card-header">
                      <span className="stock__movement-card-product">{m.productName}</span>
                      <MovementBadge type={m.type} />
                    </div>
                    <div className="stock__movement-card-details">
                      <span>
                        Qte:{' '}
                        <span
                          className={`stock__qty stock__qty--sm ${
                            m.type === 'ENTRY'
                              ? 'stock__qty--positive'
                              : m.type === 'EXIT'
                                ? 'stock__qty--negative'
                                : ''
                          }`}
                        >
                          {m.type === 'ENTRY' ? '+' : m.type === 'EXIT' ? '-' : ''}
                          {m.quantity}
                        </span>
                      </span>
                      <span>{formatDate(m.createdAt)}</span>
                    </div>
                    {m.reason && (
                      <div className="stock__movement-card-meta">
                        {m.reason}
                      </div>
                    )}
                    <div className="stock__movement-card-meta">
                      Par {m.userName}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: Transferts                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'transfers' && (
        <>
          <div className="stock__toolbar">
            <div className="stock__toolbar-left" />
            {canAdjust && (
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRightLeft size={18} />}
                onClick={openTransferModal}
              >
                Nouveau transfert
              </Button>
            )}
          </div>

          {loading ? (
            <SkeletonTable rows={6} cols={7} />
          ) : transfers.length === 0 ? (
            <div className="stock__empty">
              <ArrowRightLeft size={48} className="stock__empty-icon" />
              <p className="stock__empty-title">Aucun transfert</p>
              <p className="stock__empty-desc">Aucun transfert de stock enregistre.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="stock__table-wrapper">
                <table className="stock__table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>De</th>
                      <th>Vers</th>
                      <th>Quantite</th>
                      <th>Raison</th>
                      <th>Date</th>
                      <th>Utilisateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => (
                      <tr key={t.id}>
                        <td className="stock__table-cell--bold">{t.productName}</td>
                        <td>{t.fromShopName}</td>
                        <td>{t.toShopName}</td>
                        <td>
                          <span className="stock__qty stock__qty--sm">{t.quantity}</span>
                        </td>
                        <td className="stock__table-cell--reason">
                          {t.reason || '—'}
                        </td>
                        <td className="stock__table-cell--muted">
                          {formatDate(t.createdAt)}
                        </td>
                        <td>{t.userName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="stock__card-list">
                {transfers.map((t) => (
                  <div key={t.id} className="stock__transfer-card">
                    <div className="stock__transfer-card-header">{t.productName}</div>
                    <div className="stock__transfer-card-row">
                      <span>De</span>
                      <span>{t.fromShopName}</span>
                    </div>
                    <div className="stock__transfer-card-row">
                      <span>Vers</span>
                      <span>{t.toShopName}</span>
                    </div>
                    <div className="stock__transfer-card-row">
                      <span>Quantite</span>
                      <span className="stock__transfer-card-row--mono">{t.quantity}</span>
                    </div>
                    {t.reason && (
                      <div className="stock__transfer-card-row">
                        <span>Raison</span>
                        <span>{t.reason}</span>
                      </div>
                    )}
                    <div className="stock__transfer-card-row">
                      <span>Date</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                    <div className="stock__transfer-card-row">
                      <span>Par</span>
                      <span>{t.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Movement Modal ── */}
      <Modal
        open={movementModalOpen}
        onOpenChange={setMovementModalOpen}
        title="Nouveau mouvement"
        description="Enregistrer une entree, sortie ou ajustement de stock."
      >
        <form onSubmit={movementForm.handleSubmit(onSubmitMovement)} className="stock__form" noValidate>
          <div className="stock__form-field">
            <label htmlFor="mv-product">Produit *</label>
            <div className="stock__form-field-row">
              <select id="mv-product" {...movementForm.register('productId')}>
                <option value="">Selectionner un produit</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <Button type="button" variant="secondary" size="sm" onClick={() => { setScanTarget('movement'); setScannerOpen(true); }}>
                <ScanBarcode size={16} />
              </Button>
            </div>
            {movementForm.formState.errors.productId && (
              <span className="stock__form-field-error">
                {movementForm.formState.errors.productId.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="mv-type">Type *</label>
            <select id="mv-type" {...movementForm.register('type')}>
              <option value="ENTRY">Entree</option>
              <option value="EXIT">Sortie</option>
              {canAdjust && <option value="ADJUSTMENT">Ajustement</option>}
            </select>
            {movementForm.formState.errors.type && (
              <span className="stock__form-field-error">
                {movementForm.formState.errors.type.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="mv-qty">Quantite *</label>
            <input id="mv-qty" type="number" min="1" step="1" {...movementForm.register('quantity')} />
            {movementForm.formState.errors.quantity && (
              <span className="stock__form-field-error">
                {movementForm.formState.errors.quantity.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="mv-reason">Raison</label>
            <input id="mv-reason" type="text" placeholder="Optionnel" {...movementForm.register('reason')} />
          </div>

          <div className="stock__form-actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setMovementModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Barcode Scanner ── */}
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* ── Transfer Modal ── */}
      <Modal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        title="Nouveau transfert"
        description="Transferer du stock entre deux boutiques."
      >
        <form onSubmit={transferForm.handleSubmit(onSubmitTransfer)} className="stock__form" noValidate>
          <div className="stock__form-field">
            <label htmlFor="tr-product">Produit *</label>
            <div className="stock__form-field-row">
              <select id="tr-product" {...transferForm.register('productId')}>
                <option value="">Selectionner un produit</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <Button type="button" variant="secondary" size="sm" onClick={() => { setScanTarget('transfer'); setScannerOpen(true); }}>
                <ScanBarcode size={16} />
              </Button>
            </div>
            {transferForm.formState.errors.productId && (
              <span className="stock__form-field-error">
                {transferForm.formState.errors.productId.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="tr-from">Boutique source *</label>
            <select id="tr-from" {...transferForm.register('fromShopId')}>
              <option value="">Selectionner</option>
              {shops.map((s) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
            {transferForm.formState.errors.fromShopId && (
              <span className="stock__form-field-error">
                {transferForm.formState.errors.fromShopId.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="tr-to">Boutique destination *</label>
            <select id="tr-to" {...transferForm.register('toShopId')}>
              <option value="">Selectionner</option>
              {shops.map((s) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
            {transferForm.formState.errors.toShopId && (
              <span className="stock__form-field-error">
                {transferForm.formState.errors.toShopId.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="tr-qty">Quantite *</label>
            <input id="tr-qty" type="number" min="1" step="1" {...transferForm.register('quantity')} />
            {transferForm.formState.errors.quantity && (
              <span className="stock__form-field-error">
                {transferForm.formState.errors.quantity.message}
              </span>
            )}
          </div>

          <div className="stock__form-field">
            <label htmlFor="tr-reason">Raison</label>
            <input
              id="tr-reason"
              type="text"
              placeholder="Optionnel"
              {...transferForm.register('reason')}
            />
          </div>

          <div className="stock__form-actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setTransferModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              Transferer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
