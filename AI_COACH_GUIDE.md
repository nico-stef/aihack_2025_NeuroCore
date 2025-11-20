# AI Coach - Gemini Integration Guide

## Funcționalitate

AI Coach-ul folosește **Google Gemini API** pentru a oferi asistență inteligentă dezvoltatorilor în sarcinile lor. Chatbot-ul:

- **Primește context complet** despre task (titlu, descriere, status, prioritate, ore estimate/lucrate, deadline)
- **Cunoaște proiectul** (nume, descriere, GitHub link)
- **Păstrează istoricul conversației** pentru răspunsuri contextuale
- **Oferă sfaturi practice** bazate pe date reale din baza de date
- **Salvează interacțiunile** în `AICoachLog` pentru analiză ulterioară

## Configurare

### 1. Obține Gemini API Key

1. Mergi la [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in cu Google Account
3. Click pe **"Get API Key"** sau **"Create API Key"**
4. Copiază cheia generată (format: `AIzaSy...`)

### 2. Configurează Backend

Editează `backend/.env`:

```env
GEMINI_API_KEY='AIzaSyYourActualGeminiAPIKeyHere'
```

### 3. Restart Backend

```bash
cd backend
npm start
```

## Utilizare

### În aplicație:

1. **Login** ca developer (alice, bob, sau carol)
2. **Mergi la Tasks** → Click pe un task
3. **Scroll down** până la secțiunea "AI Coach"
4. **Scrie întrebări** despre task, tehnologii, best practices, etc.

### Exemple de întrebări:

```
"How should I approach implementing JWT authentication?"
"What are the best practices for this task?"
"I'm stuck on this error: [paste error]. Can you help?"
"What steps should I take to complete this on time?"
"Can you break down this task into smaller subtasks?"
"What testing strategies should I use?"
```

## API Endpoints

### POST /api/ai-coach/chat

**Request:**
```json
{
  "taskId": "691ef50f873ec4ee53b3c114",
  "message": "How should I approach this task?",
  "conversationHistory": [
    { "isAI": true, "content": "Hello! I'm your AI Coach..." },
    { "isAI": false, "content": "Previous question..." }
  ]
}
```

**Response:**
```json
{
  "response": "Based on your task details, I recommend...",
  "taskContext": {
    "title": "Implement user authentication",
    "status": "in-progress",
    "progress": "75.0"
  }
}
```

### GET /api/ai-coach/history/:taskId

Returnează istoricul conversațiilor pentru un task specific.

**Response:**
```json
[
  {
    "id": "673e1234567890abcdef1234",
    "userMessage": "How do I start?",
    "aiResponse": "I recommend starting with...",
    "timestamp": "2025-11-20T10:30:00.000Z",
    "user": {
      "name": "Alice Developer",
      "username": "alice"
    }
  }
]
```

## Contextul Trimis către Gemini

Pentru fiecare mesaj, AI-ul primește:

```
Task Information:
- Title: [task.title]
- Description: [task.description]
- Status: [task.status]
- Priority: [task.priority]
- Estimated Hours: [task.estimateHours]
- Actual Hours Logged: [task.realHours]
- Due Date: [task.dueDate]
- Assigned To: [task.assignedTo.name]

Project Context:
- Project Name: [project.name]
- Project Description: [project.description]
- Project Status: [project.status]
- GitHub Repository: [project.githubLink]

Previous Conversation:
[Istoricul complet al conversației]

Developer's Question: [user message]
```

## Features

### ✅ Implementate:

1. **Integrare Gemini API** - folosește `gemini-pro` model
2. **Context dinamic** - task + project + conversation history
3. **Logging interacțiuni** - salvate în `AICoachLog`
4. **Error handling** - mesaje clare când API key lipsește
5. **Loading states** - indicator vizual când AI "gândește"
6. **Conversation history** - păstrează contextul discuției
7. **Responsive UI** - chat box cu scroll, mesaje formatate

### 🔄 Fallback fără API Key:

Dacă `GEMINI_API_KEY` nu este configurat:
```json
{
  "message": "AI Coach is not configured. Please add GEMINI_API_KEY to environment variables.",
  "response": "I apologize, but I am currently unavailable..."
}
```

## Database Model

`AICoachLog` schema:
```javascript
{
  taskId: ObjectId,        // Reference to Task
  userId: ObjectId,        // Reference to User
  userMessage: String,     // Developer's question
  aiResponse: String,      // Gemini's response
  context: {
    taskTitle: String,
    taskStatus: String,
    projectName: String
  },
  timestamp: Date
}
```

## Costuri

- **Gemini API** este **GRATIS** pentru primele 60 requests/minut
- Foarte generos pentru development și testing
- Vezi [Gemini Pricing](https://ai.google.dev/pricing) pentru detalii

## Troubleshooting

### "AI Coach is not configured"
→ Verifică că `GEMINI_API_KEY` este setat în `backend/.env`

### "Invalid or missing API key"
→ API key-ul este greșit sau expirat. Generează unul nou.

### "Failed to get AI response"
→ Verifică conexiunea la internet și că API key-ul este valid

### Mesajele nu apar
→ Verifică browser console pentru erori
→ Verifică că backend-ul rulează pe port 3000

## Testing

### Test rapid din terminal:

```powershell
$chatData = @{
  taskId = "691ef50f873ec4ee53b3c114"
  message = "How should I approach this task?"
  conversationHistory = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/ai-coach/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $chatData
```

## Best Practices

1. **Fii specific** în întrebări - include detalii tehnice
2. **Menționează erorile** - copiază stack traces
3. **Cere exemple** - "Can you show me an example?"
4. **Întreabă despre best practices** - AI-ul cunoaște standardele industriei
5. **Folosește-l pentru debugging** - explică problema în detaliu

## Exemple de Interacțiuni

**Developer:** "I need to implement JWT authentication. Where should I start?"

**AI Coach:** "Based on your task 'Implement user authentication', here's a structured approach:

1. **Install Dependencies**: bcryptjs, jsonwebtoken
2. **Create User Model**: Include password hashing in pre-save hook
3. **Login Endpoint**: Verify credentials and generate JWT
4. **Protected Routes**: Create middleware to verify tokens
5. **Frontend Integration**: Store token in localStorage

Your task has 16h estimated. I recommend:
- Day 1 (6h): Backend setup + User model
- Day 2 (6h): Auth endpoints + testing
- Day 3 (4h): Frontend integration + debugging

Would you like specific code examples for any of these steps?"

---

## Summary

AI Coach oferă asistență inteligentă, contextuală pentru fiecare task, folosind Google Gemini pentru răspunsuri de calitate înaltă, bazate pe datele reale din aplicație.
