# Decisions d'architecture (ADR) -- Kassa

Ce fichier recense les decisions techniques importantes du projet, leur contexte et leurs consequences.

Format : [Architecture Decision Records](https://adr.github.io/).

---

## ADR-001 : Monorepo avec apps/api et apps/web

**Date :** 2026-10-19
**Statut :** Accepte

**Contexte :** Le projet comporte un backend Java et un frontend React. Nous devons choisir entre un monorepo et des depots separes.

**Decision :** Monorepo unique avec separation dans `apps/api` et `apps/web`.

**Consequences :**
- CI unique, deployments coordonnes.
- Partage facile des types et de la documentation.
- Docker Compose a la racine pour orchestrer les deux services.

---

<!-- Ajouter les prochaines decisions ci-dessous -->
