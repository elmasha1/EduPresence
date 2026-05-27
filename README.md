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

## Roadmap

Améliorations futures listées dans le cahier des charges, non livrées dans ce MVP :

- [ ] Page Historique avec filtres avancés (classe / élève / date) et calcul du % d'absentéisme par élève
- [ ] Export PDF (DomPDF) et Excel (Maatwebsite/Laravel-Excel) des feuilles de présence
- [ ] Page Paramètres (préférences enseignant, changement de mot de passe)
- [ ] Mode sombre (toggle Tailwind `dark:`)
- [ ] Tests Pest pour les controllers + Vitest pour les hooks critiques

---

Conçu pour rester simple, rapide et lisible. 🎓
