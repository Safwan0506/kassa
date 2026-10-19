import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackageX,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  productsApi,
  categoriesApi,
} from '../lib/api';
import type {
  Product,
  Category,
  PaginatedResponse,
} from '../lib/api';
import { formatCFA } from '../lib/format';
import { useDebounce } from '../lib/hooks';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/Skeleton';
import './ProductsPage.css';

/* ── Helpers ── */

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ── Zod schema ── */

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  sku: z.string().min(1, 'Le SKU est requis'),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  buyPrice: z.coerce.number().min(0, 'Le prix doit etre positif'),
  sellPrice: z.coerce.number().min(0, 'Le prix doit etre positif'),
  tvaRate: z.coerce.number().min(0).optional(),
  alertThreshold: z.coerce.number().min(0).optional(),
  photoUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

/* ── Component ── */

export default function ProductsPage() {
  const { user } = useAuth();
  void user; // auth context used for presence

  const { toast } = useToast();

  /* ── Data state ── */
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Filter state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 300);

  /* ── Modal state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Form ── */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      unit: 'unite',
      buyPrice: 0,
      sellPrice: 0,
      tvaRate: 0,
      alertThreshold: 5,
      photoUrl: '',
    },
  });

  /* ── Fetch products ── */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    productsApi
      .list({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
        isActive: showActive,
      })
      .then(setData)
      .catch(() => setError('Impossible de charger les produits.'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, categoryFilter, showActive]);

  /* ── Fetch categories ── */
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {
      /* silent */
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* Reset page when filters change */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, showActive]);

  /* ── Open add modal ── */
  const openAdd = () => {
    setEditingProduct(null);
    reset({
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      unit: 'unite',
      buyPrice: 0,
      sellPrice: 0,
      tvaRate: 0,
      alertThreshold: 5,
      photoUrl: '',
    });
    setFormOpen(true);
  };

  /* ── Open edit modal ── */
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? '',
      categoryId: product.categoryId ?? '',
      unit: product.unit ?? 'unite',
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      tvaRate: product.tvaRate ?? 0,
      alertThreshold: product.alertThreshold ?? 5,
      photoUrl: product.photoUrl ?? '',
    });
    setFormOpen(true);
  };

  /* ── Submit form ── */
  const onSubmit = async (formData: ProductFormData) => {
    setSubmitting(true);
    try {
      const dto = {
        ...formData,
        barcode: formData.barcode || undefined,
        categoryId: formData.categoryId || undefined,
        unit: formData.unit || 'unite',
        photoUrl: formData.photoUrl || undefined,
      };
      if (editingProduct) {
        await productsApi.update(editingProduct.id, dto);
        toast({ title: 'Produit modifie', variant: 'success' });
      } else {
        await productsApi.create(dto);
        toast({ title: 'Produit cree', variant: 'success' });
      }
      setFormOpen(false);
      fetchProducts();
    } catch {
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast({ title: 'Produit supprime', variant: 'success' });
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="products">
      {/* ── Header ── */}
      <div className="products__header">
        <h1 className="products__title">Produits</h1>
        <Button variant="primary" size="md" icon={<Plus size={18} />} onClick={openAdd}>
          Ajouter un produit
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="products__filters">
        <div className="products__search">
          <span className="products__search-icon">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="products__filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="products__toggle">
          <input
            type="checkbox"
            checked={showActive}
            onChange={(e) => setShowActive(e.target.checked)}
          />
          <span>Actifs uniquement</span>
        </label>
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <div className="products__error">
          <AlertTriangle size={32} className="products__error-icon" />
          <p className="products__error-message">{error}</p>
          <Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={fetchProducts}>
            Reessayer
          </Button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <SkeletonTable rows={8} cols={7} />}

      {/* ── Content ── */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="products__empty">
              <PackageX size={48} className="products__empty-icon" />
              <p className="products__empty-title">Aucun produit</p>
              <p className="products__empty-desc">
                {debouncedSearch || categoryFilter
                  ? 'Aucun produit ne correspond a vos filtres.'
                  : 'Commencez par ajouter votre premier produit.'}
              </p>
              {!debouncedSearch && !categoryFilter && (
                <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={openAdd}>
                  Ajouter un produit
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="products__table-wrapper">
                <table className="products__table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Categorie</th>
                      <th>Prix d&apos;achat</th>
                      <th>Prix de vente</th>
                      <th>Stock</th>
                      <th>Statut</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="products__product-cell">
                            <div className="products__product-avatar">
                              {getInitials(p.name)}
                            </div>
                            <div className="products__product-info">
                              <span className="products__product-name">{p.name}</span>
                              <span className="products__product-sku">{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.categoryName ?? '—'}</td>
                        <td className="products__price">{formatCFA(p.buyPrice)}</td>
                        <td className="products__price">{formatCFA(p.sellPrice)}</td>
                        <td className="products__qty">{p.currentStock}</td>
                        <td>
                          <Badge variant={p.isActive ? 'success' : 'neutral'}>
                            {p.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td>
                          <div className="products__actions">
                            <button
                              className="products__action-btn"
                              onClick={() => openEdit(p)}
                              aria-label="Modifier"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="products__action-btn products__action-btn--danger"
                              onClick={() => setDeleteTarget(p)}
                              aria-label="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="products__card-list">
                {products.map((p) => (
                  <div key={p.id} className="products__product-card">
                    <div className="products__card-header">
                      <div className="products__card-product">
                        <div className="products__product-avatar">
                          {getInitials(p.name)}
                        </div>
                        <div className="products__product-info">
                          <span className="products__product-name">{p.name}</span>
                          <span className="products__product-sku">{p.sku}</span>
                        </div>
                      </div>
                      <Badge variant={p.isActive ? 'success' : 'neutral'} size="sm">
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="products__card-row">
                      <span>Categorie</span>
                      <span>{p.categoryName ?? '—'}</span>
                    </div>
                    <div className="products__card-row">
                      <span>Prix d&apos;achat</span>
                      <span className="products__card-row-value">{formatCFA(p.buyPrice)}</span>
                    </div>
                    <div className="products__card-row">
                      <span>Prix de vente</span>
                      <span className="products__card-row-value">{formatCFA(p.sellPrice)}</span>
                    </div>
                    <div className="products__card-row">
                      <span>Stock</span>
                      <span className="products__card-row-value">{p.currentStock}</span>
                    </div>
                    <div className="products__actions" style={{ marginTop: 4, justifyContent: 'flex-end' }}>
                      <button
                        className="products__action-btn"
                        onClick={() => openEdit(p)}
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="products__action-btn products__action-btn--danger"
                        onClick={() => setDeleteTarget(p)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="products__pagination">
                  <button
                    className="products__page-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Page precedente"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="products__page-info">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    className="products__page-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Page suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Add/Edit Modal ── */}
      <Modal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
        maxWidth="560px"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="products__form" noValidate>
          <div className="products__form-field">
            <label htmlFor="pf-name">Nom *</label>
            <input id="pf-name" type="text" placeholder="Nom du produit" {...register('name')} />
            {errors.name && <span className="products__form-field-error">{errors.name.message}</span>}
          </div>

          <div className="products__form-row">
            <div className="products__form-field">
              <label htmlFor="pf-sku">SKU *</label>
              <input id="pf-sku" type="text" placeholder="SKU-001" {...register('sku')} />
              {errors.sku && <span className="products__form-field-error">{errors.sku.message}</span>}
            </div>
            <div className="products__form-field">
              <label htmlFor="pf-barcode">Code-barres</label>
              <input id="pf-barcode" type="text" placeholder="1234567890" {...register('barcode')} />
            </div>
          </div>

          <div className="products__form-row">
            <div className="products__form-field">
              <label htmlFor="pf-category">Categorie</label>
              <select id="pf-category" {...register('categoryId')}>
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="products__form-field">
              <label htmlFor="pf-unit">Unite</label>
              <input id="pf-unit" type="text" placeholder="unite" {...register('unit')} />
            </div>
          </div>

          <div className="products__form-row">
            <div className="products__form-field">
              <label htmlFor="pf-buy">Prix d&apos;achat (FCFA) *</label>
              <input id="pf-buy" type="number" min="0" step="1" {...register('buyPrice')} />
              {errors.buyPrice && (
                <span className="products__form-field-error">{errors.buyPrice.message}</span>
              )}
            </div>
            <div className="products__form-field">
              <label htmlFor="pf-sell">Prix de vente (FCFA) *</label>
              <input id="pf-sell" type="number" min="0" step="1" {...register('sellPrice')} />
              {errors.sellPrice && (
                <span className="products__form-field-error">{errors.sellPrice.message}</span>
              )}
            </div>
          </div>

          <div className="products__form-row">
            <div className="products__form-field">
              <label htmlFor="pf-tva">Taux TVA (%)</label>
              <input id="pf-tva" type="number" min="0" step="0.1" {...register('tvaRate')} />
            </div>
            <div className="products__form-field">
              <label htmlFor="pf-alert">Seuil d&apos;alerte</label>
              <input id="pf-alert" type="number" min="0" step="1" {...register('alertThreshold')} />
            </div>
          </div>

          <div className="products__form-field">
            <label htmlFor="pf-photo">URL photo</label>
            <input id="pf-photo" type="text" placeholder="https://..." {...register('photoUrl')} />
          </div>

          <div className="products__form-actions">
            <Button type="button" variant="secondary" size="md" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              {editingProduct ? 'Enregistrer' : 'Creer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <Modal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Supprimer le produit"
      >
        <p className="products__delete-text">
          Etes-vous sur de vouloir supprimer{' '}
          <span className="products__delete-name">{deleteTarget?.name}</span> ? Cette action est
          irreversible.
        </p>
        <div className="products__form-actions">
          <Button type="button" variant="secondary" size="md" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button type="button" variant="danger" size="md" loading={deleting} onClick={handleDelete}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
