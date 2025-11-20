# 🚀 Quick Start Guide

## Pornire Rapidă - 3 Pași

### 1️⃣ Setup Backend (2 minute)

```bash
cd backend
npm install
npm run seed
npm run dev
```

✅ Backend rulează pe `http://localhost:3000`

### 2️⃣ Setup Frontend (1 minut)

```bash
# În alt terminal
cd frontend  
npm install
npm run dev
```

✅ Frontend rulează pe `http://localhost:8080`

### 3️⃣ Login & Test

1. Deschide `http://localhost:8080` în browser
2. Login cu:
   - **Username:** `admin`
   - **Password:** `password`
3. Explorează aplicația! 🎉

## 📋 Credențiale Complete

| Username | Password | Rol |
|----------|----------|-----|
| admin | password | Super Admin |
| manager1 | password | Manager |
| alice | password | Developer |
| bob | password | Developer |
| carol | password | Tester |

## 🔍 Verificare Rapidă

### Backend OK?
```bash
curl http://localhost:3000/api/health
# Trebuie să vezi: {"status":"ok","message":"Server is running"}
```

### Frontend OK?
- Accesează `http://localhost:8080`
- Ar trebui să vezi pagina de Login

### Database OK?
- După `npm run seed`, ar trebui să vezi mesaj de succes
- Login cu `admin/password` ar trebui să funcționeze

## ⚡ Comenzi Utile

```bash
# Backend
cd backend
npm run dev      # Pornește server cu hot-reload
npm run seed     # Repopulează DB cu date test
npm start        # Pornește server (production)

# Frontend  
cd frontend
npm run dev      # Pornește dev server
npm run build    # Build pentru production
npm run preview  # Preview build-ul
```

## 🎯 Ce Să Testezi

1. **Login/Register** - Autentificare funcțională
2. **Projects** - Creare, vizualizare proiecte
3. **Tasks** - Creare, editare, reassign tasks
4. **Team** - Adăugare membri noi
5. **Navigation** - Toate paginile sunt accesibile

## ❌ Probleme Comune

### Port 3000 ocupat
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Port 8080 ocupat
Schimbă în `frontend/vite.config.ts`:
```typescript
server: {
  port: 8081, // sau alt port liber
}
```

### MongoDB connection error
Verifică `.env` în backend:
```env
dbURI='mongodb+srv://...'
```

## 📱 Ce Funcționează

✅ Autentificare JWT  
✅ CRUD Projects  
✅ CRUD Tasks  
✅ CRUD Users  
✅ CRUD Teams  
✅ Role-based access  
✅ Protected routes  
✅ Real-time updates  

## 🎓 Mai Multe Info

- **Arhitectură:** Vezi `INTEGRATION.md`
- **API Docs:** Vezi `README.md` - secțiunea API Endpoints
- **Database Models:** Vezi `backend/models/`

---

**Gata de dezvoltare! Happy coding! 🚀**
