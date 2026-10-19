# Securite -- Kassa

Ce document decrit les mesures de securite implementees dans Kassa.

## Authentification

- Les mots de passe sont haches avec **Argon2id** (parametres conformes aux recommandations OWASP).
- Les tokens JWT sont stockes dans des cookies **HttpOnly**, **Secure**, **SameSite=Strict**.
- Les refresh tokens sont stockes en base de donnees, avec rotation a chaque utilisation.
- Les refresh tokens sont revocables individuellement ou par utilisateur.
- Duree de vie courte pour les access tokens (15 minutes), longue pour les refresh tokens (7 jours).

## Autorisation

- Modele **RBAC** (Role-Based Access Control) avec trois roles : OWNER, MANAGER, CASHIER.
- **Isolation par organisation** : un utilisateur ne peut jamais acceder aux donnees d'une organisation a laquelle il n'appartient pas.
- Verification des permissions a chaque endpoint, pas seulement au niveau des routes.

## Protection des donnees

- Validation cote serveur obligatoire (Bean Validation sur toutes les entrees).
- Validation cote client avec Zod (defense en profondeur, pas de substitution).
- Requetes SQL exclusivement parametrees (Spring Data JPA). Aucune concatenation de chaines.
- Sanitisation des sorties pour prevenir les injections XSS.

## Transport

- HTTPS obligatoire en production via Caddy (TLS automatique avec Let's Encrypt).
- Headers de securite configures dans Caddy :
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (HSTS)
  - `Referrer-Policy: strict-origin-when-cross-origin`

## Rate Limiting

- Limitation de debit sur les endpoints sensibles :
  - Login : 5 tentatives par minute par IP.
  - Creation de compte : 3 par heure par IP.
  - Reset de mot de passe : 3 par heure par email.

## Audit

- Journalisation des evenements de securite : connexions, echecs, changements de role, suppressions.
- Les logs ne contiennent jamais de mots de passe, tokens ou donnees personnelles sensibles.

## Dependances

- Dependances verifiees avec `npm audit` (web) et `mvn dependency-check:check` (API).
- Mises a jour automatiques via Dependabot (GitHub).
- Aucune dependance avec des vulnerabilites connues de severite haute ou critique.

## Signaler une vulnerabilite

Si vous decouvrez une faille de securite, contactez **safwan.djazouli@gmail.com** directement. Ne creez pas d'issue publique.
