-- approvals_expansion.sql

CREATE TABLE IF NOT EXISTS examinations (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

CREATE TABLE IF NOT EXISTS grade_submissions (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    quarter INTEGER NOT NULL,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

CREATE TABLE IF NOT EXISTS academic_events (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    event_name VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    budget_required DECIMAL(10,2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

CREATE TABLE IF NOT EXISTS curriculum_revisions (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    proposed_changes TEXT NOT NULL,
    rationale TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

CREATE TABLE IF NOT EXISTS intervention_plans (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    student_name VARCHAR(255) NOT NULL,
    target_goals TEXT NOT NULL,
    duration_weeks INTEGER,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

-- Insert dummy data to make the UI immediately testable
INSERT INTO examinations (teacher_id, subject, grade_level, exam_type, file_url, status)
SELECT id, 'Mathematics', 'Grade 7', 'Midterm', '/files/math_midterm.pdf', 'submitted'
FROM users WHERE role = 'teacher' LIMIT 1;

INSERT INTO grade_submissions (teacher_id, subject, grade_level, quarter, file_url, status)
SELECT id, 'Science', 'Grade 8', 1, '/files/science_q1_grades.pdf', 'submitted'
FROM users WHERE role = 'teacher' LIMIT 1;

INSERT INTO academic_events (teacher_id, event_name, event_date, budget_required, description, status)
SELECT id, 'Science Museum Field Trip', '2026-08-15 09:00:00', 500.00, 'Visit to the national science museum for Grade 8 students.', 'submitted'
FROM users WHERE role = 'teacher' LIMIT 1;

INSERT INTO curriculum_revisions (teacher_id, subject, proposed_changes, rationale, status)
SELECT id, 'History', 'Include local history in Q2', 'Aligns with the new DepEd regional guidelines.', 'submitted'
FROM users WHERE role = 'teacher' LIMIT 1;

INSERT INTO intervention_plans (teacher_id, student_name, target_goals, duration_weeks, status)
SELECT id, 'Juan Dela Cruz', 'Improve reading comprehension to Grade level', 6, 'submitted'
FROM users WHERE role = 'teacher' LIMIT 1;
