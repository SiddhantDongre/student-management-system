# Student Management System

A complete beginner-friendly CRUD project using:

- Frontend: HTML5, CSS3, JavaScript
- Backend: FastAPI
- Database: Supabase / PostgreSQL
- API Server: Uvicorn

## Project Structure

```text
student_management/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .gitignore
│   └── supabase_setup.sql
│
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/
│       │   └── style.css
│       └── js/
│           └── app.js
│
└── README.md
```

## 1. Supabase

If your `students` table and RLS policies already exist, you do not need to recreate them.

Otherwise, open Supabase SQL Editor and run:

`backend/supabase_setup.sql`

Expected columns:

```text
id | created_at | name | course | marks
```

## 2. Configure Backend

Open the `backend` folder.

Create a new file named:

`.env`

Copy the structure from `.env.example`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_supabase_publishable_key
```

Do not commit your real `.env`.

## 3. Create Virtual Environment

PowerShell:

```powershell
cd backend
py -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## 4. Run FastAPI

From the `backend` folder:

```powershell
python -m uvicorn main:app --reload
```

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs

## 5. Run Frontend

Keep the backend terminal open.

Open a second PowerShell window:

```powershell
cd frontend
python -m http.server 5500
```

Frontend:

http://127.0.0.1:5500

## CRUD APIs

```text
POST   /students
GET    /students
GET    /students/{student_id}
PUT    /students/{student_id}
DELETE /students/{student_id}
```

The frontend is already configured to call:

http://127.0.0.1:8000

## Important

The RLS policies in `supabase_setup.sql` use `true` conditions for learning/development.
For a production system, add authentication and stricter policies.
