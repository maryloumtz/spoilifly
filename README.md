# Spoilifly

Base Next.js (App Router) structurée en MVVM avec une API backend interne.
Tailwind CSS est configuré (v4 via PostCSS).

Spoilifly est une application de découverte et de monétisation de spoilers premium. L'application combine un catalogue d'oeuvres, des spoilers payants, des packs, un panier, une simulation de paiement, une bibliothèque personnelle, une messagerie, des réunions thématiques et des espaces créateur / administration.

## Stack

- Next.js 15 avec App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Backend interne via routes `src/app/api`
- Stockage local JSON via `data/spoilifly-db.json`

## Architecture

- `src/models`: types métier, types de vues, types de formulaires
- `src/services`: clients HTTP front, formatteurs, accès aux routes API
- `src/services/server`: logique serveur, validations, accès base mockée, auth, catalogue, checkout, communauté, admin
- `src/viewmodels`: logique d'état et orchestration des écrans
- `src/views`: composants UI et pages côté client
- `src/app`: routes Next.js, pages App Router et endpoints API
- `data/spoilifly-db.json`: base de données mockée persistée localement

## Structure fonctionnelle

### Front public

- Accueil avec sections `En vedette`, `Récentes` et `Nouveautés`
- Catalogue d'oeuvres filtrable
- Détail d'une oeuvre avec spoilers et pack
- Détail d'un spoiler avec état débloqué / payant

### Espace utilisateur

- Authentification par cookie de session
- Panier stocké dans `localStorage`
- Simulation de paiement locale
- Bibliothèque personnelle
- Profil et historique d'achats
- Messagerie entre utilisateurs
- Réunions / salons spoiler

### Espace créateur

- Publication de spoilers monétisables
- Tableau de bord des spoilers créés
- Visualisation du solde créateur

### Administration

- CRUD oeuvres
- CRUD spoilers
- CRUD packs
- Upload média local

## Parcours principaux

### 1. Consommer un spoiler premium

1. L'utilisateur parcourt le catalogue ou l'accueil.
2. Il consulte une oeuvre ou un spoiler.
3. Il ajoute un spoiler ou un pack au panier.
4. Il passe par le checkout simulé.
5. Le paiement confirmé crée des `purchases` et `entitlements`.
6. Le contenu débloqué apparaît dans la bibliothèque.

### 2. Publier un spoiler

1. Le créateur ouvre l'espace créateur.
2. Il remplit le formulaire de publication.
3. Le spoiler est validé côté serveur.
4. Le spoiler est enregistré en base mockée.
5. Il devient visible dans les vues prévues selon son statut.

### 3. Créer une réunion

1. L'utilisateur choisit une oeuvre.
2. Il programme une réunion avec date, description et tarif.
3. Le backend valide la demande.
4. La réunion apparaît dans la liste et peut être rejointe.

## Pages principales

- `/`: accueil
- `/works`: catalogue
- `/works/[slug]`: détail oeuvre
- `/spoilers/[id]`: détail spoiler
- `/cart`: panier
- `/checkout/simulated-stripe`: paiement simulé
- `/checkout/success`: confirmation après paiement
- `/library`: bibliothèque
- `/profile`: profil utilisateur
- `/messages`: messagerie
- `/meetings`: réunions
- `/creator`: espace créateur
- `/admin`: administration
- `/login`: connexion
- `/register`: inscription

## API interne

### Authentification

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Catalogue et contenu

- `GET /api/home`
- `GET /api/works`
- `GET /api/works/[slug]`
- `GET /api/spoilers/[id]`
- `GET /api/library`
- `GET /api/purchases/history`

### Créateur et communauté

- `GET /api/creator/dashboard`
- `POST /api/creator/spoilers`
- `GET /api/messages`
- `POST /api/messages`
- `GET /api/meetings`
- `POST /api/meetings`
- `POST /api/meetings/[id]/join`
- `POST /api/meetings/[id]/messages`

### Checkout

- `POST /api/checkout`
- `POST /api/checkout/pay`
- `POST /api/checkout/confirm`
- `POST /api/webhooks/stripe`

### Administration

- `GET /api/admin/reference`
- `POST /api/admin/works`
- `PATCH /api/admin/works/[id]`
- `DELETE /api/admin/works/[id]`
- `POST /api/admin/spoilers`
- `PATCH /api/admin/spoilers/[id]`
- `DELETE /api/admin/spoilers/[id]`
- `POST /api/admin/packs`
- `PATCH /api/admin/packs/[id]`
- `DELETE /api/admin/packs/[id]`
- `POST /api/upload`

## Modèles de données

### Domaine

Les principaux objets métier sont définis dans [src/models/domain.ts](/home/marti/Documents/DeveloppementProject/spoilifly/src/models/domain.ts).

- `User`, `Profile`, `SessionUser`
- `Work`, `SpoilItem`, `Pack`
- `Purchase`, `Entitlement`, `CheckoutSession`
- `Conversation`, `ChatMessage`
- `SpoilMeeting`, `MeetingAttendee`
- `WalletEntry`

### Vues

Les objets de projection front sont définis dans [src/models/view.ts](/home/marti/Documents/DeveloppementProject/spoilifly/src/models/view.ts).

- `WorkCardView`
- `WorkDetailView`
- `SpoilerDetailView`
- `LibraryEntry`
- `CreatorDashboardView`
- `MeetingView`
- `HomePayload`

## Logique applicative

### Session et panier

Le provider global [src/viewmodels/useAppVM.tsx](/home/marti/Documents/DeveloppementProject/spoilifly/src/viewmodels/useAppVM.tsx) centralise :

- la session courante
- le chargement initial du profil de session
- le panier stocké en `localStorage`
- le calcul du total panier
- les actions `addToCart`, `removeFromCart`, `clearCart`, `logoutUser`

### Backend mocké

La base locale est gérée dans [src/services/server/db.ts](/home/marti/Documents/DeveloppementProject/spoilifly/src/services/server/db.ts).

- initialisation automatique depuis le seed
- lecture / écriture JSON
- persistance locale entre redémarrages

Les données de démonstration sont dans [src/services/server/seed.ts](/home/marti/Documents/DeveloppementProject/spoilifly/src/services/server/seed.ts).

### Validation

Les validations d'entrées sont centralisées dans [src/services/server/validators.ts](/home/marti/Documents/DeveloppementProject/spoilifly/src/services/server/validators.ts).

Exemples :

- validation login / inscription
- validation profil
- validation spoilers / packs
- validation réunions
- validation paiement simulé

### Client API

[src/services/apiClient.ts](/home/marti/Documents/DeveloppementProject/spoilifly/src/services/apiClient.ts) fournit :

- `apiGet`
- `apiSend`
- `ApiClientError`
- remontée des `fieldErrors` pour affichage dans les formulaires

## Interface et conventions

- architecture MVVM stricte
- composants UI réutilisables dans `src/views/components`
- formatage monétaire centralisé dans `src/services/formatters.ts`
- saisie des prix en euros côté UI, stockage interne en centimes
- messages d'erreur serveur remontés dans les formulaires

## Fonctionnalités ajoutées / ajustées récemment

- correction de la création de réunions avec gestion propre des erreurs API et des erreurs par champ
- validation explicite de l'oeuvre lors de la création d'une réunion
- passage des champs tarifaires de la saisie en centimes à la saisie en euros
- affichage immédiat des spoilers créés dans la bibliothèque de l'utilisateur
- ajout d'une route `GET /api/home`
- ajout d'une vraie section `Nouveautés` sur la page d'accueil basée sur les derniers spoils publiés

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3001`.

## Vérification

```bash
npx tsc --noEmit
npm run lint
```

## Notes

- le projet utilise un backend mocké local, il n'y a pas de base externe requise
- le panier est persistant côté navigateur
- l'authentification repose sur un cookie signé
- le paiement est simulé localement pour les besoins de la démo
