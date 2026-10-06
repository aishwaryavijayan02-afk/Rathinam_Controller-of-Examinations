-- ====================================================================
-- EXAM CELL PORTAL - SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STAFF', 'HOD', 'DEAN', 'COE')),
    role_title TEXT,
    dept TEXT,
    is_subject_faculty BOOLEAN DEFAULT FALSE,
    avatar_bg TEXT DEFAULT '#6366f1',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    hod TEXT,
    total_faculty INTEGER DEFAULT 0,
    active_subjects INTEGER DEFAULT 0,
    building TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. FACULTY TABLE
CREATE TABLE IF NOT EXISTS public.faculty (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    subjects_assigned JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active',
    phone TEXT,
    designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    semester TEXT,
    department TEXT,
    total_questions INTEGER DEFAULT 0,
    approved INTEGER DEFAULT 0,
    pending INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. SYLLABUS UNITS TABLE
CREATE TABLE IF NOT EXISTS public.syllabus_units (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    num TEXT NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topics INTEGER DEFAULT 0,
    docs INTEGER DEFAULT 0,
    subtopics JSONB DEFAULT '[]'::jsonb,
    co_mapping JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT,
    question TEXT NOT NULL,
    subject TEXT NOT NULL,
    unit TEXT NOT NULL,
    topic TEXT,
    type TEXT DEFAULT 'Descriptive',
    difficulty TEXT DEFAULT 'Medium',
    marks INTEGER DEFAULT 5,
    bloom_level TEXT DEFAULT 'Understand',
    status TEXT DEFAULT 'Pending',
    options JSONB,
    answer TEXT,
    explanation TEXT,
    verifier TEXT,
    verified_date TEXT,
    submitted_by TEXT,
    submitted_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    related_to TEXT,
    status TEXT DEFAULT 'Unread',
    time_ago TEXT,
    exact_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    time TEXT,
    activity TEXT NOT NULL,
    module TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- DISABLE RLS OR ENABLE PERMISSIVE RLS FOR ANON FRONTEND ACCESS
-- ====================================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- INITIAL SEED DATA FOR PRESET ACCOUNTS & SYSTEM RECORDS
-- ====================================================================
INSERT INTO public.users (id, name, email, role, role_title, dept, is_subject_faculty, avatar_bg, phone)
VALUES 
  ('usr-staff-1', 'Prof. Priya Sharma', 'staff@rathinam.in', 'STAFF', 'Faculty / Staff', 'Visual Communication', TRUE, 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', '+91 98765 43210'),
  ('usr-hod-1', 'Dr. Sathish Murugan', 'hod.viscom@rathinam.in', 'HOD', 'HOD / Associate Dean', 'Visual Arts & VFX', TRUE, 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', '+91 98765 43211'),
  ('usr-dean-1', 'Dr. K. Ramesh', 'dean.fashionmedia@rathinam.in', 'DEAN', 'Dean Academic Affairs', 'School of Media & Arts', FALSE, 'linear-gradient(135deg, #10b981 0%, #059669 100%)', '+91 98765 43212'),
  ('usr-coe-1', 'Vignesh R.', 'coe@rathinam.in', 'COE', 'Controller of Examinations', 'Exam Cell Office', FALSE, 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', '+91 98765 43213')
ON CONFLICT (email) DO NOTHING;
