import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { ApiError } from '../lib/api';
import './LoginPage.css';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email('Adresse email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [shaking, setShaking] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg =
        apiErr?.message ?? 'Impossible de se connecter. Veuillez reessayer.';
      setServerError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="login-wrapper">
      {/* ── Left branding panel (desktop) ── */}
      <div className="login-branding">
        {/* Decorative elements */}
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
              Gerez vos boutiques
              <br />
              en toute confiance
            </p>
          </div>

          <div className="login-branding__features">
            <div className="login-branding__feature">
              <div className="login-branding__feature-dot" />
              <span className="login-branding__feature-text">Multi-boutiques</span>
            </div>
            <div className="login-branding__feature">
              <div className="login-branding__feature-dot" />
              <span className="login-branding__feature-text">Temps reel</span>
            </div>
            <div className="login-branding__feature">
              <div className="login-branding__feature-dot" />
              <span className="login-branding__feature-text">Securise</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Mobile branding */}
          <div className="login-mobile-branding">
            <h1 className="login-mobile-branding__wordmark">Kassa</h1>
            <p className="login-mobile-branding__tagline">
              Gerez vos boutiques en toute confiance
            </p>
          </div>

          <div className="login-form__header">
            <h2 className="login-form__title">Connexion</h2>
            <p className="login-form__subtitle">
              Entrez vos identifiants pour acceder a votre espace
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="login-form"
            noValidate
          >
            <Input
              label="Adresse email"
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
              placeholder="Votre mot de passe"
              icon={<Lock size={18} />}
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div
                className={`login-form__error ${shaking ? 'animate-shake' : ''}`}
              >
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              style={{ width: '100%', marginTop: '8px' }}
            >
              Se connecter
            </Button>
          </form>

          <p className="login-form__footer">
            Kassa &middot; Gestion de stock multi-boutiques
          </p>
        </div>
      </div>
    </div>
  );
}
