# EduPresence

Mini SaaS pour la gestion des présences scolaires.
Une application moderne permettant aux enseignants de gérer leurs classes, leurs élèves et l'appel quotidien depuis un tableau de bord clair et professionnel.

> **Périmètre actuel (MVP)** : authentification, tableau de bord, gestion des classes, gestion des élèves (recherche + pagination), pointage des présences (présent / absent / retard), profil enseignant. UI en français, design SaaS épuré noir & blanc.
>
> Réservé pour une itération future : historique avec filtres avancés, export PDF / Excel, page paramètres, mode sombre.

## Stack technique

| Couche       | Technologie                                                  |
|--------------|---------------------------------------------------------------|
| Frontend     | React 19 + Vite + JavaScript                                  |
| Styling      | Tailwind CSS 3                                                |
| Formulaires  | React Hook Form + Zod                                         |
| HTTP         | Axios (avec intercepteurs token / 401 / erreurs)              |
| Notifications| react-hot-toast                                               |
| Icônes       | lucide-react                                                  |
| Backend      | Laravel 11 (API REST)                                         |
| Auth         | Laravel Sanctum (tokens personnels)                           |
| Base de données | SQLite (par défaut) — switch MySQL en 1 ligne (voir plus bas)|

## Arborescence

```
college/
├── backend/                  # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/        # Auth, Dashboard, Classroom, Student, Attendance
│   │   ├── Http/Requests/           # Form Requests (validation)
│   │   ├── Http/Resources/          # API Resources
│   │   └── Models/                  # User, Classroom, Student, Attendance, AttendanceRecord
│   ├── database/
│   │   ├── migrations/              # users, classrooms, students, attendances, attendance_records
│   │   ├── factories/
│   │   └── seeders/DatabaseSeeder.php
│   └── routes/api.php
│
└── frontend/                 # SPA React
    └── src/
        ├── components/ui/    # Button, Input, Select, Card, Modal, Spinner, Badge, EmptyState
        ├── context/          # AuthContext
        ├── layouts/          # DashboardLayout (sidebar + topbar)
        ├── pages/            # Login, Register, Dashboard, Classes, Students, Attendance, Profile, NotFound
        ├── routes/           # ProtectedRoute, GuestRoute
        ├── services/api.js   # Axios + interceptors
        └── utils/cn.js
```

## Installation

### Prérequis
- PHP 8.2+ (avec extensions standard) — XAMPP convient
- Composer 2+
- Node.js 18+
- (Optionnel) MySQL / MariaDB — non requis par défaut

### Backend

```bash
cd backend
composer install                       # déjà installé via create-project
cp .env.example .env                   # (déjà fait — .env existe)
php artisan key:generate               # (déjà fait)
php artisan migrate:fresh --seed       # crée la DB SQLite + données de démo
php artisan serve --host=127.0.0.1 --port=8000
```

L'API est disponible sur **http://127.0.0.1:8000/api**.

### Frontend

```bash
cd frontend
npm install                            # déjà installé
npm run dev
```

L'application est servie sur **http://localhost:5173**.

### Identifiants de démonstration

Après le seed :

| Email                          | Mot de passe |
|--------------------------------|--------------|
| `teacher@edupresence.test`     | `password`   |

Le compte démo dispose de 3 classes, ~28 élèves, et 1 semaine d'historique de présences générée automatiquement.

## Basculer vers MySQL

Le projet utilise SQLite par défaut pour un démarrage sans configuration. Pour passer à MySQL :

1. Créer la base : `CREATE DATABASE edupresence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Dans `backend/.env`, commenter `DB_CONNECTION=sqlite` et décommenter le bloc MySQL (`DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
3. Relancer `php artisan migrate:fresh --seed`.

## API — endpoints principaux

Toutes les routes (sauf register/login) requièrent un header `Authorization: Bearer <token>`.

| Méthode | URL                                  | Description                         |
|---------|--------------------------------------|-------------------------------------|
| POST    | `/api/register`                      | Créer un compte enseignant          |
| POST    | `/api/login`                         | Authentification (renvoie un token) |
| POST    | `/api/logout`                        | Révoquer le token courant           |
| GET     | `/api/me`                            | Profil de l'utilisateur connecté    |
| GET     | `/api/dashboard`                     | Statistiques tableau de bord        |
| GET     | `/api/classrooms`                    | Liste des classes (+ comptage élèves) |
| POST    | `/api/classrooms`                    | Créer une classe                    |
| PUT     | `/api/classrooms/{id}`               | Modifier une classe                 |
| DELETE  | `/api/classrooms/{id}`               | Supprimer une classe                |
| GET     | `/api/students?search=&classroom_id=&page=` | Liste paginée des élèves   |
| POST    | `/api/students`                      | Ajouter un élève                    |
| PUT     | `/api/students/{id}`                 | Modifier un élève                   |
| DELETE  | `/api/students/{id}`                 | Supprimer un élève                  |
| GET     | `/api/attendances`                   | Historique des feuilles de présence |
| GET     | `/api/attendances/lookup?classroom_id=&date=` | Récupérer la feuille existante |
| POST    | `/api/attendances`                   | Créer/mettre à jour une feuille (idempotent par (classe, date)) |
| DELETE  | `/api/attendances/{id}`              | Supprimer une feuille               |

## Architecture & choix de conception

- **Sécurité** : chaque controller filtre via `user()->classrooms()` / `user()->students()` — un enseignant ne peut jamais voir ou modifier les données d'un autre. Les Form Requests valident l'appartenance des ressources liées (ex: `classroom_id` doit appartenir au teacher).
- **Idempotence du pointage** : `POST /api/attendances` utilise `updateOrCreate` sur la clé unique `(classroom_id, date)` puis recrée les records dans une transaction — pas de duplication possible.
- **Optimisations DB** : index composés sur `(user_id, classroom_id)` et `(classroom_id, date)`, agrégations SQL natives pour le dashboard (pas de N+1).
- **DX frontend** : `data.data ?? data` dans les composants pour gérer aussi bien les réponses Resource que les payloads bruts ; intercepteur Axios qui auto-redirige en 401 et toast les erreurs serveur.

## Commandes utiles

```bash
# Backend
php artisan migrate:fresh --seed       # reset DB + reseed
php artisan tinker                     # REPL Laravel
php artisan route:list                 # lister les routes

# Frontend
npm run dev                            # dev server
npm run build                          # bundle production
npm run lint                           # ESLint
```

## Déploiement

### Vue d'ensemble

| Composant | Plateforme | Fichier de configuration         |
|-----------|------------|----------------------------------|
| Frontend  | Vercel     | [frontend/vercel.json](frontend/vercel.json) |
| Backend   | Render (Docker) | [backend/Dockerfile](backend/Dockerfile) |
| Base de données | Render Postgres | [render.yaml](render.yaml) (Blueprint) |

> Render ne propose pas de MySQL géré, l'API tourne donc sur **PostgreSQL** en production. Laravel gère le changement de driver de manière transparente via les variables d'environnement — aucun changement de code requis.

### 1. Backend + base de données → Render

**Pré-requis** : pousser ce dépôt sur GitHub (ou GitLab/Bitbucket).

1. Dans Render : **New + → Blueprint → Connect repository**. Render lit automatiquement [render.yaml](render.yaml) et propose de créer :
   - `edupresence-db` (PostgreSQL, plan gratuit)
   - `edupresence-api` (service web Docker, plan gratuit)
   Toutes les variables `DB_*` sont câblées automatiquement depuis l'instance Postgres.

2. **Générer la clé Laravel localement** (à faire une seule fois) :
   ```bash
   cd backend
   php artisan key:generate --show
   ```
   Copier la valeur complète (avec le préfixe `base64:`) et la coller dans l'éditeur d'env vars Render → variable `APP_KEY`.

3. Cliquer sur **Apply** pour lancer le build. Render :
   - construit l'image Docker (~3-4 min)
   - lance `php artisan migrate --force` au démarrage
   - démarre le serveur sur `https://edupresence-api.onrender.com` (URL exacte affichée par Render)

4. Une fois l'URL connue, dans l'onglet **Environment** de `edupresence-api` :
   - définir `APP_URL` à l'URL Render (ex: `https://edupresence-api.onrender.com`)
   - redéployer le service

5. (Optionnel) **Charger les données de démo** une fois pour le compte de démonstration :
   - Render → service → **Shell**
   - `php artisan db:seed --force`
   - Identifiants démo : `teacher@edupresence.test` / `password`

> ⚠️ **Plan gratuit Render** : le service s'endort après 15 min d'inactivité (cold start ~30 s à la première requête). La base Postgres gratuite expire au bout de 30 jours.

### 2. Frontend → Vercel

1. Dans Vercel : **Add New → Project** → importer le dépôt.
2. **Root Directory** : `frontend` (Vercel détecte automatiquement Vite).
3. **Environment Variables** :
   - `VITE_API_URL` = `https://edupresence-api.onrender.com/api` (l'URL de votre backend Render + `/api`)
4. **Deploy**.

Vercel lit [frontend/vercel.json](frontend/vercel.json) qui contient la règle de rewrite SPA — toutes les routes (`/classes`, `/presences`, etc.) renvoient vers `index.html` pour que React Router fonctionne sur rechargement direct.

### 3. CORS

Le backend autorise déjà `*` comme origine ([backend/config/cors.php](backend/config/cors.php)) — l'authentification par token Bearer ne nécessite pas de credentials. Aucun changement nécessaire.

Pour restreindre en production, éditer `config/cors.php` :
```php
'allowed_origins' => [env('FRONTEND_URL', '*')],
```
puis ajouter `FRONTEND_URL=https://votre-app.vercel.app` dans les env vars Render.

### 4. Mise à jour continue

- **Push sur la branche `main`** → Render et Vercel rebuilds automatiques.
- Les migrations sont rejouées à chaque démarrage (`php artisan migrate --force` est idempotent).
- Les `config:cache` et `route:cache` sont rafraîchis à chaque build.

## Roadmap

Améliorations futures listées dans le cahier des charges, non livrées dans ce MVP :

- [ ] Page Historique avec filtres avancés (classe / élève / date) et calcul du % d'absentéisme par élève
- [ ] Export PDF (DomPDF) et Excel (Maatwebsite/Laravel-Excel) des feuilles de présence
- [ ] Page Paramètres (préférences enseignant, changement de mot de passe)
- [ ] Mode sombre (toggle Tailwind `dark:`)
- [ ] Tests Pest pour les controllers + Vitest pour les hooks critiques

---

Conçu pour rester simple, rapide et lisible. 🎓
