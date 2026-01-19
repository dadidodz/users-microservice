# 🚀 Users Microservice - NestJS

Ce microservice est dédié à la gestion des utilisateurs et à l'authentification. Conçu avec **NestJS (v11)** et **pnpm**, il se distingue par l'utilisation des **UUID v7**, offrant des identifiants uniques, performants et naturellement triables par date de création.

---

### 🛠 Technologies & Fonctionnalités

* **Framework** : NestJS avec architecture modulaire pour une scalabilité optimale.
* **Gestionnaire de paquets** : pnpm (performant et économe en espace disque).
* **Identifiants** : UUID v7 (Standardisé, optimisé pour l'indexation en base de données).
* **Sécurité** :
    * Authentification JWT complète (Access & Refresh Tokens).
    * Hachage des mots de passe avec `bcrypt`.
    * Sérialisation automatique pour exclure les données sensibles (ex: mots de passe) des réponses API.
* **Documentation** : Swagger / OpenAPI v3 intégré et auto-généré via plugin CLI.
* **Validation** : Validation des données entrantes via `class-validator` et `class-transformer`.

---

### 📋 Prérequis

* **Node.js** (v18 ou supérieur)
* **pnpm** (Installation : `npm install -g pnpm`)
* **Base de données** : PostgreSQL

---

### 🚀 Installation et Configuration

**1. Récupérer le projet :**

git clone <votre-url-de-depot>
cd users-microservice

**2. Installer les dépendances :**

pnpm install

**3. Configurer l'environnement :**

Créez un fichier **.env** à la racine du projet :

```text
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_NAME=db_name
JWT_SECRET=votre_secret_jwt_access
JWT_REFRESH_SECRET=votre_secret_jwt_refresh
```

### 🏃 Lancement de l'application

**Démarrer en mode développement (avec auto-reload) :**

pnpm run start:dev

**Compiler et lancer pour la production :**

pnpm run build
pnpm run start:prod

---
### 📖 Documentation API (Swagger)

L'API expose une documentation interactive permettant de tester les endpoints et de consulter les schémas de données (DTOs).

🔗 **Accès local :** http://localhost:3000/api


> [!TIP]
> Pour tester les routes sécurisées (marquées par un cadenas), authentifiez-vous via la route `/login`, récupérez l'Access Token, puis utilisez le bouton **"Authorize"** en haut à droite de l'interface Swagger.

---
### 📂 Structure du Projet

```text
src/
├── modules/v1/
│   ├── auth/           # Login, Register, Refresh Token
│   └── users/          # CRUD Profil, Check availability
├── common/             # Decorators, Guards, Interceptors
├── main.ts             # Bootstrapping & Swagger config
```

🔒 **Pourquoi les UUID v7 ?**

Ce projet implémente les UUID v7 au lieu de la version 4 traditionnelle. Voici pourquoi :

* **Performance BDD** : Contrairement aux UUID v4 (aléatoires), les v7 incluent un timestamp. Cela permet des insertions triées, évitant la fragmentation des index.

* **Tri naturel** : Vous pouvez trier vos utilisateurs par date de création directement via leur clé primaire.
