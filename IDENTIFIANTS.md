# Identifiants de connexion Kassa

## Environnement de développement

### Utilisateurs de test

L'application crée automatiquement des utilisateurs de démonstration au démarrage (profil `dev`).

#### 1. Administrateur (Propriétaire)
- **Email** : `admin@kassa.com`
- **Mot de passe** : `Kassa2024!`
- **Accès** : Boutique Akwa + Boutique Bonaberi
- **Rôle** : PROPRIETAIRE (accès complet)

#### 2. Gérant
- **Email** : `gerant@kassa.com`
- **Mot de passe** : `Kassa2024!`
- **Accès** : Boutique Akwa uniquement
- **Rôle** : GERANT

#### 3. Caissier
- **Email** : `caissier@kassa.com`
- **Mot de passe** : `Kassa2024!`
- **Accès** : Boutique Bonaberi uniquement
- **Rôle** : CAISSIER

## URLs de l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8080
- **Swagger UI** : http://localhost:8080/swagger-ui.html

## Données de démonstration

L'application est pré-remplie avec :
- 2 boutiques (Akwa, Bonaberi)
- 3 catégories (Alimentaire, Boissons, Divers)
- 8 produits avec stock initial
- 2 fournisseurs

## Notes importantes

⚠️ **Base de données en mémoire** : Les données sont perdues à chaque redémarrage du serveur (H2 en mode mémoire).

Pour persister les données, modifiez `application.yml` pour utiliser PostgreSQL en production.
