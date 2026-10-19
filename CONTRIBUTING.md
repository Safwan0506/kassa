# Contribuer a Kassa

Merci de votre interet pour Kassa. Voici comment contribuer efficacement.

## Processus

1. **Fork** le depot et creez une branche depuis `main`.
2. **Nommez** votre branche selon la convention : `feat/description`, `fix/description`, `docs/description`.
3. **Codez** en respectant les directives de `CLAUDE.md` (design tokens, securite, qualite).
4. **Testez** : assurez-vous que tous les tests passent et que la couverture reste au-dessus de 70%.
5. **Committez** avec des messages conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
6. **Ouvrez une Pull Request** vers `main` avec une description claire du changement.

## Regles de code

- Pas de TODO, FIXME ou HACK dans le code livre.
- Pas de code mort ni d'imports inutilises.
- Typage strict (TypeScript `strict: true`, pas de `any`).
- Tout texte affiche en francais, pas de lorem ipsum.
- Formatage monetaire : `1 500 FCFA`.

## Environnement de developpement

```bash
# Cloner le depot
git clone https://github.com/SafwanMusic/kassa.git
cd kassa

# Lancer l'environnement Docker
cd infra
docker compose up -d

# API (Java 21 requis)
cd apps/api
./mvnw spring-boot:run

# Web (Node.js 20+ requis)
cd apps/web
npm install
npm run dev
```

## Signaler un bug

Ouvrez une issue en precisant :
- Les etapes pour reproduire le bug.
- Le comportement attendu vs. le comportement observe.
- Votre environnement (OS, navigateur, version de Java/Node).

## Securite

Pour les vulnerabilites de securite, voir [SECURITY.md](SECURITY.md). Ne creez pas d'issue publique.
