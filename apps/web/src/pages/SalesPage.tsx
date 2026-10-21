import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  CreditCard,
  X,
  Download,
  Truck,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  invoicesApi,
  productsApi,
  customersApi,
} from '../lib/api';
import type {
  Invoice,
  InvoiceStatus,
  InvoiceLineRequest,
  Product,
  Customer,
  PaymentMethodType,
} from '../lib/api';
import { formatCFA, formatDate } from '../lib/format';
import { useDebounce } from '../lib/hooks';
import { useAuth } from '../contexts/AuthContext';
import { highestRole, can } from '../lib/rbac';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/Skeleton';
import './SalesPage.css';

/* ── Constants ── */

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validee',
  PARTIALLY_PAID: 'Partiel',
  PAID: 'Payee',
  CANCELLED: 'Annulee',
};

const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  CASH: 'Especes',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement',
  CARD: 'Carte',
  OTHER: 'Autre',
};

/* ── Status badge ── */

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`sales__status sales__status--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ── Main component ── */

export default function SalesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const shops = user?.shops ?? [];
  const role = highestRole(shops.map((s) => s.role));
  const canCreateSale = can(role, 'sales:create');
  const canValidateSale = can(role, 'sales:validate');
  const canCancelSale = can(role, 'sales:cancel');
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.shopId ?? '');
  const shopId = selectedShopId || shops[0]?.shopId;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await invoicesApi.list({
        shopId,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setInvoices(res.data);
      setTotalPages(res.totalPages);
    } catch {
      addToast('Erreur lors du chargement des factures', 'error');
    } finally {
      setLoading(false);
    }
  }, [shopId, statusFilter, page, addToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, selectedShopId]);

  const filtered = invoices.filter((inv) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const matchesNumber = inv.invoiceNumber.toLowerCase().includes(q);
      const matchesCustomer = inv.customerName?.toLowerCase().includes(q);
      if (!matchesNumber && !matchesCustomer) return false;
    }
    if (dateFrom && inv.createdAt < dateFrom) return false;
    if (dateTo && inv.createdAt.slice(0, 10) > dateTo) return false;
    return true;
  });

  const openDetail = async (invoice: Invoice) => {
    try {
      const full = await invoicesApi.getById(invoice.id);
      setSelectedInvoice(full);
      setShowDetail(true);
    } catch {
      addToast('Erreur lors du chargement de la facture', 'error');
    }
  };

  const handleValidate = async () => {
    if (!selectedInvoice) return;
    try {
      const updated = await invoicesApi.validate(selectedInvoice.id);
      setSelectedInvoice(updated);
      fetchInvoices();
      addToast('Facture validee — stock deduit', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la validation', 'error');
    }
  };

  const handleCancel = async () => {
    if (!selectedInvoice) return;
    try {
      const updated = await invoicesApi.cancel(selectedInvoice.id);
      setSelectedInvoice(updated);
      fetchInvoices();
      addToast('Facture annulee', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de l\'annulation', 'error');
    }
  };

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Ventes</h1>
        {canCreateSale && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nouvelle facture
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="sales__toolbar">
        <div className="sales__toolbar-left">
          <div className="sales__search">
            <span className="sales__search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Rechercher par numero ou client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {shops.length > 1 && (
            <select
              className="sales__filter-select"
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
            >
              {shops.map((s) => (
                <option key={s.shopId} value={s.shopId}>{s.shopName}</option>
              ))}
            </select>
          )}
          <select
            className="sales__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="VALIDATED">Validee</option>
            <option value="PARTIALLY_PAID">Paiement partiel</option>
            <option value="PAID">Payee</option>
            <option value="CANCELLED">Annulee</option>
          </select>
          <input
            type="date"
            className="sales__filter-date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Date debut"
          />
          <input
            type="date"
            className="sales__filter-date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Date fin"
          />
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filtered.length === 0 ? (
        <div className="sales__empty">
          <FileText size={48} className="sales__empty-icon" />
          <div className="sales__empty-title">Aucune facture</div>
          <div className="sales__empty-desc">
            {debouncedSearch || dateFrom || dateTo
              ? 'Aucune facture ne correspond a vos criteres.'
              : 'Creez votre premiere facture pour commencer.'}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="sales__table-wrapper">
            <table className="sales__table">
              <thead>
                <tr>
                  <th>Numero</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Total</th>
                  <th>Reste du</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} onClick={() => openDetail(inv)}>
                    <td className="sales__table-cell--mono-bold">
                      {inv.invoiceNumber}
                    </td>
                    <td>{inv.customerName || '—'}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td className="sales__table-cell--mono">{formatCFA(inv.total)}</td>
                    <td className={`sales__table-cell--conditional ${inv.amountDue > 0 ? 'sales__table-cell--error' : 'sales__table-cell--success'}`}>
                      {formatCFA(inv.amountDue)}
                    </td>
                    <td className="sales__table-cell--muted">
                      {formatDate(inv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sales__card-list">
            {filtered.map((inv) => (
              <div key={inv.id} className="sales__card" onClick={() => openDetail(inv)}>
                <div className="sales__card-header">
                  <span className="sales__card-number">{inv.invoiceNumber}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="sales__card-row">
                  <span>{inv.customerName || 'Sans client'}</span>
                  <span>{formatDate(inv.createdAt)}</span>
                </div>
                <div className="sales__card-total">{formatCFA(inv.total)}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sales__pagination">
              <button
                className="sales__page-btn"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Page precedente"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="sales__page-info">
                Page {page + 1} sur {totalPages}
              </span>
              <button
                className="sales__page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle facture">
        <CreateInvoiceForm
          shopId={shopId || ''}
          onSuccess={() => {
            setShowCreate(false);
            fetchInvoices();
          }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {/* Detail modal */}
      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedInvoice ? `Facture ${selectedInvoice.invoiceNumber}` : 'Facture'}
      >
        {selectedInvoice && (
          <InvoiceDetail
            invoice={selectedInvoice}
            onValidate={handleValidate}
            onCancel={handleCancel}
            onPayment={() => setShowPayment(true)}
            canValidate={canValidateSale}
            canCancel={canCancelSale}
          />
        )}
      </Modal>

      {/* Payment modal */}
      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title="Enregistrer un paiement"
      >
        {selectedInvoice && (
          <PaymentForm
            invoice={selectedInvoice}
            onSuccess={async () => {
              setShowPayment(false);
              const updated = await invoicesApi.getById(selectedInvoice.id);
              setSelectedInvoice(updated);
              fetchInvoices();
            }}
            onCancel={() => setShowPayment(false)}
          />
        )}
      </Modal>
    </div>
  );
}

/* ── Create Invoice Form ── */

function CreateInvoiceForm({
  shopId,
  onSuccess,
  onCancel,
}: {
  shopId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<(InvoiceLineRequest & { name: string; price: number })[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productsApi.list({ limit: 200, isActive: true }).then((res) => setProducts(res.data));
    customersApi.list().then(setCustomers);
  }, []);

  const addLine = (productId: string) => {
    if (lines.some((l) => l.productId === productId)) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLines([...lines, { productId, quantity: 1, name: product.name, price: product.sellPrice }]);
  };

  const updateQty = (idx: number, qty: number) => {
    const updated = [...lines];
    updated[idx].quantity = Math.max(1, qty);
    setLines(updated);
  };

  const removeLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const handleSubmit = async () => {
    if (lines.length === 0) {
      addToast('Ajoutez au moins un produit', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await invoicesApi.create({
        shopId,
        customerId: customerId || undefined,
        lines: lines.map(({ productId, quantity }) => ({ productId, quantity })),
        notes: notes || undefined,
      });
      addToast('Facture creee', 'success');
      onSuccess();
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la creation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sales__form">
      <div className="sales__form-field">
        <label>Client (optionnel)</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Sans client</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="sales__form-field">
        <label>Ajouter un produit</label>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) addLine(e.target.value);
          }}
        >
          <option value="">Selectionner un produit...</option>
          {products
            .filter((p) => !lines.some((l) => l.productId === p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCFA(p.sellPrice)}
              </option>
            ))}
        </select>
      </div>

      {lines.length > 0 && (
        <div className="sales__line-items">
          {lines.map((line, idx) => (
            <div key={line.productId} className="sales__line-item">
              <span className="sales__line-item-name">{line.name}</span>
              <span className="sales__line-item-price">{formatCFA(line.price)}</span>
              <input
                type="number"
                className="sales__line-item-qty"
                value={line.quantity}
                min={1}
                onChange={(e) => updateQty(idx, parseInt(e.target.value) || 1)}
              />
              <span className="sales__line-item-total">{formatCFA(line.price * line.quantity)}</span>
              <button className="sales__line-item-remove" onClick={() => removeLine(idx)} type="button">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="sales__form-field">
        <label>Notes (optionnel)</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="sales__detail-totals">
        <div className="sales__detail-total-row sales__detail-total-row--grand">
          <span>Total HT</span>
          <span>{formatCFA(total)}</span>
        </div>
      </div>

      <div className="sales__form-actions">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={lines.length === 0}>
          Creer la facture
        </Button>
      </div>
    </div>
  );
}

/* ── Invoice Detail ── */

function InvoiceDetail({
  invoice,
  onValidate,
  onCancel,
  onPayment,
  canValidate = true,
  canCancel = true,
}: {
  invoice: Invoice;
  onValidate: () => void;
  onCancel: () => void;
  onPayment: () => void;
  canValidate?: boolean;
  canCancel?: boolean;
}) {
  const { addToast } = useToast();
  return (
    <div className="sales__detail">
      <div className="sales__detail-header">
        <div className="sales__detail-info">
          <span className="sales__detail-number">{invoice.invoiceNumber}</span>
          <span className="sales__detail-meta">
            {invoice.shopName} — {formatDate(invoice.createdAt)}
            {invoice.customerName && ` — ${invoice.customerName}`}
          </span>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Lines */}
      <table className="sales__lines-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qte</th>
            <th>P.U.</th>
            <th>TVA</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.id}>
              <td>{line.productName}</td>
              <td>{line.quantity}</td>
              <td className="sales__table-cell--mono">{formatCFA(line.unitPrice)}</td>
              <td>{line.tvaRate}%</td>
              <td className="sales__table-cell--mono-bold">{formatCFA(line.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="sales__detail-totals">
        <div className="sales__detail-total-row">
          <span>Sous-total HT</span>
          <span>{formatCFA(invoice.subtotal)}</span>
        </div>
        <div className="sales__detail-total-row">
          <span>TVA</span>
          <span>{formatCFA(invoice.taxTotal)}</span>
        </div>
        <div className="sales__detail-total-row sales__detail-total-row--grand">
          <span>Total TTC</span>
          <span>{formatCFA(invoice.total)}</span>
        </div>
        <div className="sales__detail-total-row">
          <span>Paye</span>
          <span>{formatCFA(invoice.amountPaid)}</span>
        </div>
        {invoice.amountDue > 0 && (
          <div className="sales__detail-total-row sales__detail-total-row--due">
            <span>Reste du</span>
            <span>{formatCFA(invoice.amountDue)}</span>
          </div>
        )}
      </div>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <div className="sales__payments">
          <h4 className="sales__payments-title">Paiements</h4>
          {invoice.payments.map((p) => (
            <div key={p.id} className="sales__payment-item">
              <div>
                <span className="sales__payment-method">{PAYMENT_LABELS[p.method]}</span>
                {p.reference && <span className="sales__payment-date"> — {p.reference}</span>}
                <div className="sales__payment-date">{formatDate(p.createdAt)}</div>
              </div>
              <span className="sales__payment-amount">{formatCFA(p.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* PDF Export */}
      {invoice.status !== 'DRAFT' && (
        <div className="sales__detail-actions">
          <Button variant="secondary" onClick={async () => {
            try {
              const blob = await invoicesApi.downloadPdf(invoice.id);
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
              setTimeout(() => URL.revokeObjectURL(url), 30000);
            } catch {
              addToast('Erreur lors du telechargement du PDF', 'error');
            }
          }}>
            <Download size={16} /> Facture PDF
          </Button>
          <Button variant="secondary" onClick={async () => {
            try {
              const blob = await invoicesApi.downloadDeliveryNote(invoice.id);
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
              setTimeout(() => URL.revokeObjectURL(url), 30000);
            } catch {
              addToast('Erreur lors du telechargement du bon', 'error');
            }
          }}>
            <Truck size={16} /> Bon de livraison
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="sales__detail-actions">
        {invoice.status === 'DRAFT' && (
          <>
            {canValidate && (
              <Button onClick={onValidate}>
                <CheckCircle size={16} /> Valider
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" onClick={onCancel}>
                <XCircle size={16} /> Annuler
              </Button>
            )}
          </>
        )}
        {(invoice.status === 'VALIDATED' || invoice.status === 'PARTIALLY_PAID') && (
          <>
            <Button onClick={onPayment}>
              <CreditCard size={16} /> Paiement
            </Button>
            {canCancel && (
              <Button variant="danger" onClick={onCancel}>
                <XCircle size={16} /> Annuler
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Payment Form ── */

function PaymentForm({
  invoice,
  onSuccess,
  onCancel,
}: {
  invoice: Invoice;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { addToast } = useToast();
  const [method, setMethod] = useState<PaymentMethodType>('CASH');
  const [amount, setAmount] = useState(String(invoice.amountDue));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      addToast('Montant invalide', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await invoicesApi.addPayment({
        invoiceId: invoice.id,
        method,
        amount: numAmount,
        reference: reference || undefined,
        notes: notes || undefined,
      });
      addToast('Paiement enregistre', 'success');
      onSuccess();
    } catch (err: any) {
      addToast(err.message || 'Erreur lors du paiement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sales__form">
      <div className="sales__detail-totals">
        <div className="sales__detail-total-row sales__detail-total-row--due">
          <span>Reste du</span>
          <span>{formatCFA(invoice.amountDue)}</span>
        </div>
      </div>

      <div className="sales__form-field">
        <label>Methode de paiement</label>
        <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethodType)}>
          <option value="CASH">Especes</option>
          <option value="MOBILE_MONEY">Mobile Money</option>
          <option value="BANK_TRANSFER">Virement bancaire</option>
          <option value="CARD">Carte bancaire</option>
          <option value="OTHER">Autre</option>
        </select>
      </div>

      <div className="sales__form-field">
        <label>Montant (FCFA)</label>
        <input
          type="number"
          value={amount}
          min={1}
          max={invoice.amountDue}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="sales__form-field">
        <label>Reference (optionnel)</label>
        <input
          type="text"
          value={reference}
          placeholder="N° transaction, cheque..."
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div className="sales__form-field">
        <label>Notes (optionnel)</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="sales__form-actions">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Enregistrer le paiement
        </Button>
      </div>
    </div>
  );
}
