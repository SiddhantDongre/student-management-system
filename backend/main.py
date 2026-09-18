from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# ---------------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ---------------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "SUPABASE_URL or SUPABASE_KEY is missing. "
        "Create backend/.env using backend/.env.example."
    )

# ---------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------
app = FastAPI(
    title="Student Management API",
    description="CRUD API for Student Management using FastAPI + Supabase",
    version="1.0.0",
)

# Frontend runs separately in development, so enable CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only. Restrict this in production.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# SUPABASE CLIENT
# ---------------------------------------------------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def validate_marks(marks: int) -> None:
    if marks < 0 or marks > 100:
        raise HTTPException(
            status_code=422,
            detail="Marks must be between 0 and 100."
        )


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------
@app.get("/")
def home():
    return {
        "message": "Student Management API is running",
        "docs": "/docs",
    }


# ---------------------------------------------------------
# CREATE STUDENT
# POST /students
# ---------------------------------------------------------
@app.post("/students")
def create_student(
    name: str = Query(..., min_length=1),
    course: str = Query(..., min_length=1),
    marks: int = Query(...)
):
    validate_marks(marks)

    try:
        student = {
            "name": name.strip(),
            "course": course.strip(),
            "marks": marks,
        }

        response = (
            supabase
            .table("students")
            .insert(student)
            .execute()
        )

        return {
            "message": "Student created successfully",
            "data": response.data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# READ ALL STUDENTS
# GET /students
# ---------------------------------------------------------
@app.get("/students")
def get_students():
    try:
        response = (
            supabase
            .table("students")
            .select("*")
            .order("id")
            .execute()
        )

        return {
            "message": "Students fetched successfully",
            "data": response.data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# READ ONE STUDENT
# GET /students/{student_id}
# ---------------------------------------------------------
@app.get("/students/{student_id}")
def get_student(student_id: int):
    try:
        response = (
            supabase
            .table("students")
            .select("*")
            .eq("id", student_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "message": "Student fetched successfully",
            "data": response.data[0],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# UPDATE STUDENT
# PUT /students/{student_id}
# ---------------------------------------------------------
@app.put("/students/{student_id}")
def update_student(
    student_id: int,
    name: str = Query(..., min_length=1),
    course: str = Query(..., min_length=1),
    marks: int = Query(...)
):
    validate_marks(marks)

    try:
        updated_student = {
            "name": name.strip(),
            "course": course.strip(),
            "marks": marks,
        }

        response = (
            supabase
            .table("students")
            .update(updated_student)
            .eq("id", student_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "message": "Student updated successfully",
            "data": response.data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# DELETE STUDENT
# DELETE /students/{student_id}
# ---------------------------------------------------------
@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    try:
        response = (
            supabase
            .table("students")
            .delete()
            .eq("id", student_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "message": "Student deleted successfully",
            "data": response.data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
