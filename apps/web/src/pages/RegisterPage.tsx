import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Building2, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { ApiError } from '../lib/api';
import './LoginPage.css';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prenom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
  organizationName: z.string().min(1, "Le nom de l'organisation est requis"),
  shopName: z.string().min(1, 'Le nom de la boutique est requis'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [shaking, setShaking] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '',
      organizationName: '', shopName: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setServerError(apiErr?.message ?? "Erreur lors de l'inscription.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-branding">
        <div className="login-branding__grid" />
        <div className="login-branding__line-1" />
        <div className="login-branding__line-2" />
        <div className="login-branding__circle-1" />
        <div className="login-branding__circle-2" />
        <div className="login-branding__square" />
        <div className="login-branding__dots" />
        <div className="login-branding__diamond" />
        <div className="login-branding__content">
          <div>
            <h1 className="login-branding__wordmark">Kassa</h1>
            <div className="login-branding__divider" />
            <p className="login-branding__tagline">
              Creez votre espace<br />en quelques clics
            </p>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-mobile-branding">
            <h1 className="login-mobile-branding__wordmark">Kassa</h1>
            <p className="login-mobile-branding__tagline">Creez votre espace</p>
          </div>

          <div className="login-form__header">
            <h2 className="login-form__title">Inscription</h2>
            <p className="login-form__subtitle">
              Creez votre organisation et votre premiere boutique
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <Input
                label="Prenom"
                placeholder="Jean"
                icon={<User size={18} />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                icon={<User size={18} />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              icon={<Mail size={18} />}
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="Minimum 8 caracteres"
              icon={<Lock size={18} />}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Nom de l'organisation"
              placeholder="Ma Societe SARL"
              icon={<Building2 size={18} />}
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              label="Nom de la boutique"
              placeholder="Boutique Principale"
              icon={<Store size={18} />}
              error={errors.shopName?.message}
              {...register('shopName')}
            />

            {serverError && (
              <div className={`login-form__error ${shaking ? 'animate-shake' : ''}`}>
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="login-form__submit">
              Creer mon compte
            </Button>
          </form>

          <p className="login-form__footer">
            Deja un compte ? <Link to="/login" className="login-form__link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
