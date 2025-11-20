# Backend-Frontend Integration

## Modificări Realizate

Am conectat backend-ul cu frontend-ul pentru a înlocui datele hardcodate din `mockData.ts` cu date reale din baza de date MongoDB.

### 1. Backend (Node.js + Express + MongoDB)

#### Pachete Instalate:
- `cors` - pentru a permite cererile cross-origin de la frontend
- `bcryptjs` - pentru hash-uirea parolelor
- `jsonwebtoken` - pentru autentificare JWT

#### Rute API Create:
- **Auth** (`/api/auth`):
  - `POST /register` - Înregistrare utilizator nou
  - `POST /login` - Autentificare
  - `GET /me` - Obține utilizatorul curent

- **Users** (`/api/users`):
  - `GET /` - Lista tuturor utilizatorilor
  - `GET /:id` - Detalii utilizator
  - `PUT /:id` - Actualizare utilizator
  - `DELETE /:id` - Ștergere utilizator

- **Projects** (`/api/projects`):
  - `GET /` - Lista proiectelor
  - `GET /:id` - Detalii proiect
  - `POST /` - Creare proiect nou
  - `PUT /:id` - Actualizare proiect
  - `DELETE /:id` - Ștergere proiect

- **Tasks** (`/api/tasks`):
  - `GET /` - Lista task-urilor (cu filtrare opțională)
  - `GET /:id` - Detalii task
  - `POST /` - Creare task nou
  - `PUT /:id` - Actualizare task
  - `DELETE /:id` - Ștergere task

- **Teams** (`/api/teams`):
  - `GET /` - Lista echipelor
  - `GET /:id` - Detalii echipă
  - `POST /` - Creare echipă nouă
  - `PUT /:id` - Actualizare echipă
  - `DELETE /:id` - Ștergere echipă

- **Burnout** (`/api/burnout`):
  - `GET /` - Scoruri burnout (cu filtrare)
  - `GET /:id` - Detalii scor burnout
  - `POST /` - Creare scor burnout
  - `PUT /:id` - Actualizare scor
  - `DELETE /:id` - Ștergere scor

- **Insights** (`/api/insights`):
  - `GET /` - Lista insights (cu filtrare)
  - `GET /:id` - Detalii insight
  - `POST /` - Creare insight nou
  - `PUT /:id` - Actualizare insight
  - `DELETE /:id` - Ștergere insight

#### Fișiere Modificate:
- `server.js` - Adăugat CORS, importat toate rutele, configurat dotenv
- Toate fișierele din `routes/` au fost create

### 2. Frontend (React + TypeScript + Vite)

#### Fișiere Create/Modificate:

**`src/lib/api.ts`** - Nou fișier cu toate funcțiile API:
- Funcții pentru fiecare endpoint (auth, users, projects, tasks, teams, burnout, insights)
- Gestionare automată a token-ului JWT
- Headers configurate corect

**`src/contexts/AuthContext.tsx`** - Actualizat:
- Înlocuit logica de autentificare mock cu API real
- Adăugat validare token la încărcare
- Stocare token JWT în localStorage
- Tipuri actualizate pentru rolurile din backend

**Pagini Actualizate:**
- `Projects.tsx` - Folosește `projectsApi` și `tasksApi`
- `Tasks.tsx` - Folosește `tasksApi` și `usersApi`
- `ProjectDetails.tsx` - Folosește `projectsApi.getById()` și `tasksApi.getAll()`
- `TaskDetail.tsx` - Folosește `tasksApi.getById()`
- `TeamManagement.tsx` - Folosește `usersApi` și `authApi`

**`vite.config.ts`** - Adăugat proxy:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

**`.env`** - Creat:
```
VITE_API_URL=http://localhost:3000/api
```

## Cum să Rulezi Aplicația

### 1. Populare Bază de Date (Prima Rulare)

```bash
cd backend
npm install  # instalează dependențele
npm run seed  # populează baza de date cu date de test
```

Acest script va crea:
- 5 utilizatori (admin, manager, 2 developeri, 1 tester)
- 1 echipă
- 3 proiecte
- 6 task-uri

**Credențiale pentru testare:**
- Admin: `username=admin, password=password`
- Manager: `username=manager1, password=password`
- Developer: `username=alice, password=password`
- Developer: `username=bob, password=password`
- Tester: `username=carol, password=password`

### 2. Pornire Backend

```bash
cd backend
nodemon server.js
```

Serverul backend va rula pe `http://localhost:3000`

### 2. Pornire Frontend

```bash
cd frontend
npm install  # doar prima dată
npm run dev
```

Serverul frontend va rula pe `http://localhost:8080`

### 3. Testare

1. Accesează `http://localhost:8080` în browser
2. Creează un cont nou sau încearcă să te autentifici
3. Toate datele vor fi salvate în baza de date MongoDB

## Structura Bazei de Date

Modelele din `backend/models/`:
- **User** - utilizatori (name, username, email, password, role, teamId, githubUsername)
- **Project** - proiecte (name, description, githubLink, teamId, members, status)
- **Task** - task-uri (projectId, title, description, assignedTo, createdBy, status, priority, estimateHours, realHours)
- **Team** - echipe (name, managerId, members)
- **BurnoutScore** - scoruri burnout (userId, score, week, year, factors)
- **Insight** - insights (teamId, projectId, workloadOverview, estimationVsReality, blockedTasks, githubSummary)
- **GithubActivity** - activitate GitHub
- **AICoachLog** - loguri coach AI

## Mapare Roluri

Backend (MongoDB) → Frontend:
- `superadmin` → `superadmin`
- `manager` → `manager`
- `developer` → user/developer
- `tester` → user/tester

## Autentificare

Sistemul folosește JWT (JSON Web Tokens):
1. Utilizatorul se autentifică cu username și parolă
2. Backend-ul returnează un token JWT
3. Frontend-ul stochează token-ul în localStorage
4. Toate cererile ulterioare includ token-ul în header-ul `Authorization: Bearer <token>`

## Note Importante

- **Parola default** pentru utilizatori noi: `password123` (poate fi schimbată)
- **JWT_SECRET** este configurat în `backend/.env`
- **Conexiunea MongoDB** este configurată în `backend/connectionDb.js`
- Toate parolele sunt hash-uite folosind bcrypt
- CORS este activat pentru a permite cererile de la frontend

## Următorii Pași

1. ✅ Backend conectat la frontend
2. ✅ Autentificare funcțională
3. ✅ CRUD pentru Projects, Tasks, Teams
4. ⏳ Implementare completă pentru Burnout și Insights
5. ⏳ Integrare GitHub API
6. ⏳ Implementare AI Coach

## Troubleshooting

### Backend nu pornește
- Verifică că MongoDB este conectat (vezi `.env`)
- Verifică portul 3000 este liber

### Frontend nu se conectează la backend
- Verifică că backend-ul rulează pe portul 3000
- Verifică proxy-ul în `vite.config.ts`
- Verifică variabila `VITE_API_URL` în `.env`

### Eroare de autentificare
- Verifică că `JWT_SECRET` este setat în `backend/.env`
- Șterge token-ul din localStorage și încearcă din nou
