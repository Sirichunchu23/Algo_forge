# ⚡ AlgoForge – Coding Platform

A full-stack coding challenge platform with **Student** and **Admin** roles, Monaco Editor, real code execution, and detailed test case results.

---

## 🚀 Features

### Students
- Register & login securely (JWT)
- Browse problems with difficulty/category filters
- Solve problems in Monaco Editor (JavaScript, Python, Java)
- **Run** code against visible test cases instantly
- **Submit** solution — all test cases evaluated including hidden ones
- See detailed per-test-case pass/fail results like LeetCode
- View submission history per problem and globally
- Personal profile with stats (solved, easy/medium/hard breakdown)

### Admins
- Separate admin dashboard with platform analytics
- **Create / Edit / Delete** problems with full Markdown descriptions
- Add examples, constraints, visible & hidden test cases
- Set starter code templates per language
- View all student submissions with filters
- Manage (deactivate) student accounts

---

## 🏃 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier)

### 1. Install dependencies
```bash
cd algoforge
npm run install:all
# Or manually:
# cd backend && npm install
# cd ../frontend && npm install
```

### 2. Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@algoforge.dev | Admin@123456 |
| Student | Register at /register | Your choice |

---

## 🌍 Code Execution

AlgoForge ships with a **built-in JavaScript sandbox** (Node.js `vm` module) that works out of the box for JavaScript problems — no setup needed.

For **Python and Java** support (production), configure [Judge0 CE](https://github.com/judge0/judge0):

### Option A: RapidAPI Judge0 (easiest)
1. Sign up at [rapidapi.com](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Get free API key
3. Add to `backend/.env`:
```
USE_BUILTIN_EXECUTOR=false
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
```

### Option B: Self-hosted Judge0 (production recommended)
```bash
# With Docker Compose
git clone https://github.com/judge0/judge0
cd judge0
docker-compose up -d
```
Then set in `.env`:
```
USE_BUILTIN_EXECUTOR=false
JUDGE0_URL=http://localhost:2358
```


## 📁 Project Structure

```
algoforge/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js        # register, login, me
│   │   ├── problem.controller.js     # list, get (public)
│   │   ├── submission.controller.js  # submit, history
│   │   ├── execute.controller.js     # run (without saving)
│   │   └── admin.controller.js       # full CRUD + analytics
│   ├── middleware/
│   │   └── auth.middleware.js        # JWT verify, adminOnly
│   ├── models/
│   │   ├── User.model.js             # role, stats, solvedProblems
│   │   ├── Problem.model.js          # testCases, starterCode, examples
│   │   └── Submission.model.js       # testResults, status, runtime
│   ├── routes/                       # 5 route files
│   ├── utils/
│   │   └── executor.js               # JS sandbox + Judge0 bridge
│   └── server.js                     # seeds admin + 6 problems
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   └── ProtectedRoute.jsx
        │   └── editor/
        │       ├── TestResults.jsx       # LeetCode-style results panel
        │       └── SubmissionHistory.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Problems.jsx             # problem list dashboard
        │   ├── EditorPage.jsx           # Monaco editor + split view
        │   ├── MySubmissions.jsx
        │   ├── Profile.jsx
        │   ├── NotFound.jsx
        │   └── admin/
        │       ├── AdminLayout.jsx      # sidebar layout
        │       ├── AdminDashboard.jsx
        │       ├── AdminProblems.jsx
        │       ├── AdminProblemForm.jsx  # create/edit with test cases
        │       ├── AdminUsers.jsx
        │       └── AdminSubmissions.jsx
        ├── services/api.js              # Axios with token interceptor
        ├── store/authStore.js           # Zustand auth state
        └── styles/globals.css           # dark terminal theme
```

---

## 🔐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create student account |
| POST | `/api/auth/login` | Public | Login (any role) |
| GET | `/api/auth/me` | Any | Get current user |
| GET | `/api/problems` | Any | List active problems |
| GET | `/api/problems/:slug` | Any | Get problem detail |
| POST | `/api/execute/run` | Any | Run code (no save) |
| POST | `/api/submissions` | Any | Submit solution |
| GET | `/api/submissions/me` | Any | My submissions |
| GET | `/api/submissions/problem/:id` | Any | My subs for problem |
| GET | `/api/admin/stats` | Admin | Platform analytics |
| GET/POST | `/api/admin/problems` | Admin | List / create problems |
| PUT/DELETE | `/api/admin/problems/:id` | Admin | Update / delete |
| GET | `/api/admin/users` | Admin | All students |
| GET | `/api/admin/submissions` | Admin | All submissions |

---

## ⚙️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Editor | Monaco Editor (@monaco-editor/react) |
| State | Zustand |
| HTTP | Axios |
| UI | Lucide Icons, React Hot Toast, React Markdown |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Execution | Node.js vm (JS) + Judge0 CE (Python/Java) |


Live : https://algo-forge-1.onrender.com
