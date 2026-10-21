import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  AlertTriangle,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { customersApi } from '../lib/api';
import type { Customer } from '../lib/api';
import { useDebounce } from '../lib/hooks';
import { useAuth } from '../contexts/AuthContext';
import { highestRole, can } from '../lib/rbac';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/Skeleton';
import './CustomersPage.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const customerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const { user } = useAuth();
  const role = highestRole(user?.shops?.map((s) => s.role) ?? []);
  const canCreate = can(role, 'customers:create');
  const canEditCustomer = can(role, 'customers:edit');
  const canDeleteCustomer = can(role, 'customers:delete');

  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phone: '', email: '', address: '' },
  });

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    setError(null);
    customersApi
      .list()
      .then(setCustomers)
      .catch(() => setError('Impossible de charger les clients.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = debouncedSearch
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.phone?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.email?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : customers;

  const openAdd = () => {
    setEditingCustomer(null);
    reset({ name: '', phone: '', email: '', address: '' });
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
    });
    setFormOpen(true);
  };

  const onSubmit = async (formData: CustomerFormData) => {
    setSubmitting(true);
    try {
      const dto = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
      };
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, dto);
        toast({ title: 'Client modifie', variant: 'success' });
      } else {
        await customersApi.create(dto);
        toast({ title: 'Client cree', variant: 'success' });
      }
      setFormOpen(false);
      fetchCustomers();
    } catch {
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await customersApi.delete(deleteTarget.id);
      toast({ title: 'Client supprime', variant: 'success' });
      setDeleteTarget(null);
      fetchCustomers();
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="customers">
      <div className="customers__header">
        <h1 className="customers__title">Clients</h1>
        {canCreate && (
          <Button variant="primary" size="md" icon={<Plus size={18} />} onClick={openAdd}>
            Ajouter un client
          </Button>
        )}
      </div>

      <div className="customers__filters">
        <div className="customers__search">
          <span className="customers__search-icon">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="customers__count">
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && !loading && (
        <div className="customers__error">
          <AlertTriangle size={32} className="customers__error-icon" />
          <p className="customers__error-message">{error}</p>
          <Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={fetchCustomers}>
            Reessayer
          </Button>
        </div>
      )}

      {loading && <SkeletonTable rows={6} cols={5} />}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="customers__empty">
              <UserPlus size={48} className="customers__empty-icon" />
              <p className="customers__empty-title">Aucun client</p>
              <p className="customers__empty-desc">
                {debouncedSearch
                  ? 'Aucun client ne correspond a votre recherche.'
                  : 'Commencez par ajouter votre premier client.'}
              </p>
              {!debouncedSearch && canCreate && (
                <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={openAdd}>
                  Ajouter un client
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="customers__table-wrapper">
                <table className="customers__table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Telephone</th>
                      <th>Email</th>
                      <th>Adresse</th>
                      {(canEditCustomer || canDeleteCustomer) && <th className="customers__th--actions">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="customers__cell">
                            <div className="customers__avatar">{getInitials(c.name)}</div>
                            <span className="customers__name">{c.name}</span>
                          </div>
                        </td>
                        <td>
                          {c.phone ? (
                            <span className="customers__contact">
                              <Phone size={14} />
                              {c.phone}
                            </span>
                          ) : (
                            <span className="customers__muted">&mdash;</span>
                          )}
                        </td>
                        <td>
                          {c.email ? (
                            <span className="customers__contact">
                              <Mail size={14} />
                              {c.email}
                            </span>
                          ) : (
                            <span className="customers__muted">&mdash;</span>
                          )}
                        </td>
                        <td>
                          {c.address ? (
                            <span className="customers__contact">
                              <MapPin size={14} />
                              {c.address}
                            </span>
                          ) : (
                            <span className="customers__muted">&mdash;</span>
                          )}
                        </td>
                        {(canEditCustomer || canDeleteCustomer) && (
                          <td>
                            <div className="customers__actions">
                              {canEditCustomer && (
                                <button
                                  className="customers__action-btn"
                                  onClick={() => openEdit(c)}
                                  aria-label="Modifier"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}
                              {canDeleteCustomer && (
                                <button
                                  className="customers__action-btn customers__action-btn--danger"
                                  onClick={() => setDeleteTarget(c)}
                                  aria-label="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="customers__card-list">
                {filtered.map((c) => (
                  <div key={c.id} className="customers__card">
                    <div className="customers__card-header">
                      <div className="customers__cell">
                        <div className="customers__avatar">{getInitials(c.name)}</div>
                        <span className="customers__name">{c.name}</span>
                      </div>
                      {(canEditCustomer || canDeleteCustomer) && (
                        <div className="customers__actions">
                          {canEditCustomer && (
                            <button
                              className="customers__action-btn"
                              onClick={() => openEdit(c)}
                              aria-label="Modifier"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {canDeleteCustomer && (
                            <button
                              className="customers__action-btn customers__action-btn--danger"
                              onClick={() => setDeleteTarget(c)}
                              aria-label="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {c.phone && (
                      <div className="customers__card-row">
                        <Phone size={14} />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="customers__card-row">
                        <Mail size={14} />
                        <span>{c.email}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="customers__card-row">
                        <MapPin size={14} />
                        <span>{c.address}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Modal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingCustomer ? 'Modifier le client' : 'Ajouter un client'}
        maxWidth="480px"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="customers__form" noValidate>
          <div className="customers__form-field">
            <label htmlFor="cf-name">Nom *</label>
            <input id="cf-name" type="text" placeholder="Nom du client" {...register('name')} />
            {errors.name && <span className="customers__form-error">{errors.name.message}</span>}
          </div>

          <div className="customers__form-field">
            <label htmlFor="cf-phone">Telephone</label>
            <input id="cf-phone" type="tel" placeholder="+237 6XX XXX XXX" {...register('phone')} />
          </div>

          <div className="customers__form-field">
            <label htmlFor="cf-email">Email</label>
            <input id="cf-email" type="email" placeholder="client@example.com" {...register('email')} />
            {errors.email && <span className="customers__form-error">{errors.email.message}</span>}
          </div>

          <div className="customers__form-field">
            <label htmlFor="cf-address">Adresse</label>
            <input id="cf-address" type="text" placeholder="Adresse du client" {...register('address')} />
          </div>

          <div className="customers__form-actions">
            <Button type="button" variant="secondary" size="md" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              {editingCustomer ? 'Enregistrer' : 'Creer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Supprimer le client"
      >
        <p className="customers__delete-text">
          Etes-vous sur de vouloir supprimer{' '}
          <span className="customers__delete-name">{deleteTarget?.name}</span> ? Cette action est
          irreversible.
        </p>
        <div className="customers__form-actions">
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
