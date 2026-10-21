import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import './IntroPage.css';

const HeroScene = lazy(() => import('../components/intro/HeroScene'));
const ActScene = lazy(() => import('../components/intro/ActScene'));

const INTRO_SEEN_KEY = 'kassa_intro_seen';

const ACTS = [
  {
    id: 'stock' as const,
    number: 'Acte 01',
    title: 'Stock en temps reel',
    desc: 'Suivez chaque article, chaque mouvement, chaque boutique. Alertes de seuil, transferts inter-boutiques, historique complet.',
  },
  {
    id: 'caisse' as const,
    number: 'Acte 02',
    title: 'Caisse intelligente',
    desc: 'Scanner de codes-barres, calcul automatique, moyens de paiement multiples. La vente en quelques secondes.',
  },
  {
    id: 'facture' as const,
    number: 'Acte 03',
    title: 'Facturation precise',
    desc: 'Factures PDF conformes, bons de livraison, suivi des paiements partiels. Votre comptabilite en ordre.',
  },
  {
    id: 'vision' as const,
    number: 'Acte 04',
    title: 'Vision multi-boutiques',
    desc: 'Tableau de bord unifie, rapports par periode, comparaisons entre boutiques. Decidez avec les bonnes donnees.',
  },
] as const;

function useWebGLSupported() {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function FallbackBackground() {
  return (
    <div className="intro__fallback-bg">
      <div className="intro__fallback-gradient" />
      <div className="intro__fallback-grid" />
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

function ActSection({
  act,
  showWebGL,
}: {
  act: (typeof ACTS)[number];
  showWebGL: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="intro__act" ref={ref}>
      <div className="intro__act-canvas">
        {showWebGL ? (
          <Suspense fallback={<FallbackBackground />}>
            <ActScene act={act.id} />
          </Suspense>
        ) : (
          <FallbackBackground />
        )}
      </div>

      <motion.div
        className="intro__act-content"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={stagger}
      >
        <motion.span className="intro__act-number" variants={fadeUp}>
          {act.number}
        </motion.span>
        <motion.div className="intro__act-accent" variants={fadeUp} />
        <motion.h2 className="intro__act-title" variants={fadeUp}>
          {act.title}
        </motion.h2>
        <motion.p className="intro__act-desc" variants={fadeUp}>
          {act.desc}
        </motion.p>
      </motion.div>
    </section>
  );
}

export default function IntroPage() {
  const navigate = useNavigate();
  const webgl = useWebGLSupported();
  const reducedMotion = useReducedMotion();
  const showWebGL = webgl && !reducedMotion;

  const skip = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch { /* quota exceeded — fine */ }
    navigate('/login');
  }, [navigate]);

  return (
    <div className="intro">
      {/* Skip button */}
      <button className="intro__skip" onClick={skip} type="button">
        Passer l&apos;intro
      </button>

      {/* Hero */}
      <section className="intro__hero">
        <div className="intro__hero-canvas">
          {showWebGL ? (
            <Suspense fallback={<FallbackBackground />}>
              <HeroScene />
            </Suspense>
          ) : (
            <FallbackBackground />
          )}
        </div>

        <motion.div
          className="intro__hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="intro__brand">Kassa</h1>
          <p className="intro__tagline">
            Gerez vos boutiques avec confiance.
            Stock, ventes, factures — tout en un.
          </p>
        </motion.div>

        <div className="intro__scroll-hint">
          <span>Decouvrir</span>
          <ChevronDown size={16} />
          <div className="intro__scroll-line" />
        </div>
      </section>

      {/* Acts */}
      {ACTS.map((act) => (
        <ActSection key={act.id} act={act} showWebGL={showWebGL} />
      ))}

      {/* CTA */}
      <section className="intro__cta">
        <motion.h2
          className="intro__cta-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          Pret a transformer votre gestion ?
        </motion.h2>

        <motion.button
          className="intro__cta-btn"
          onClick={skip}
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          Commencer
          <ArrowRight size={20} />
        </motion.button>

        <motion.p
          className="intro__cta-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          100 % auto-heberge — vos donnees restent chez vous
        </motion.p>
      </section>
    </div>
  );
}
