# Proiect Hackathon GenAI

**Acest proiect a fost realizat în cadrul unui hackathon GenAI de o zi, de o echipă formată din 2 persoane.**

---

# AI-Powered Team Management System

Un sistem inteligent de management al echipelor și proiectelor, care, cu ajutorul AI-ului, detectează semnele de burnout și alertează automat team leader-ul. Aplicația oferă și funcții de coaching AI, ajutând dezvoltatorii să își organizeze inteligent task-urile și să primească sfaturi sau sugestii de cod personalizate.

## 🚀 Funcționalități Principale

- **Autentificare & Autorizare** - Sistem JWT cu roluri multiple (superadmin, manager, developer, tester)
- **Managementul Proiectelor** - Creare, editare și monitorizare proiecte
- **Task Management** - Organizare task-uri cu statusuri, priorități și estimări de timp
- **Team Management** - Gestionarea echipelor și membrilor
- **Burnout Detection** - Monitorizare și alertare pentru riscul de burnout
- **GitHub Integration** - Sincronizare activitate GitHub
- **AI Coach** - Asistent AI pentru îmbunătățirea productivității
- **Insights & Analytics** - Rapoarte și statistici despre performanța echipei

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server-side framework
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Autentificare
- **bcrypt** - Hash-uire parole
- **CORS** - Cross-origin requests

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Router** - Routing
- **Sonner** - Toast notifications

## 📦 Instalare și Rulare

### Cerințe Preliminare
- Node.js 18+ 
- MongoDB (cloud sau local)
- npm sau yarn

### 1. Clonare Proiect

```bash
git clone https://github.com/mihaimoje/aihack_2025_NeuroCore.git
cd aihack_2025_NeuroCore
```

### 2. Configurare Backend

```bash
cd backend
npm install
```

Creează fișierul `.env`:
```env
DB_URI=                    # Stringul de conectare la baza de date MongoDB 
JWT_SECRET=                # Cheia folosită pentru generarea și validarea token-urilor JWT
BUCKET_NAME=               # Numele bucket-ului bazei de date
BUCKET_REGION=             # Regiunea bucket-ului
BUCKET_ACCESS_KEY=         # Access key pentru bucket
BUCKET_SECRET_ACCESS_KEY=  # Secret access key pentru bucket

SENDGRID_API_KEY=          # Cheia API pentru SendGrid
SENDGRID_FROM_EMAIL=       # Emailul expeditor folosit la trimiterea mesajelor

FRONTEND_URL=http://172.30.176.1:8080/   # URL-ul frontendului (folosit pentru redirecționări, email-uri etc.)

GEMINI_API_KEY=            # Cheia API pentru Google Gemini

```

Pornește serverul:
```bash
node server.js
```

Backend va rula pe `http://localhost:3000`

### 3. Configurare Frontend

```bash
cd frontend
npm install
```

Creează fișierul `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Pornește serverul de dezvoltare:
```bash
npm run dev
```

Frontend va rula pe `http://localhost:8080`

### 4. Baza de date

Structura bazei de date pentru acest proiect este inclusă în directorul **database structure** in **format JSON**, fiecare fișier reprezentând o colecție MongoDB.  
Aceste fișiere pot fi folosite pentru a importa rapid datele într-o instanță MongoDB.  
Observatie: Userii cu functie de manager trebuie să aibă în baza de date un token GitHub pentru ca aplicația să poată analiza activitatea proiectelor sale

## 👥 Credențiale de Test

După rularea `npm run seed`, vei avea următorii utilizatori:

| Rol | Username | Password | Descriere |
|-----|----------|----------|-----------|
| Super Admin | `admin` | `password` | Acces complet la sistem |
| Manager | `manager1` | `password` | Gestionare echipe și proiecte |
| Developer | `alice` | `password` | Developer cu acces la task-uri |

