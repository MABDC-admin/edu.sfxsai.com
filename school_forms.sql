CREATE TABLE IF NOT EXISTS school_forms (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    sf1_status VARCHAR(20) DEFAULT 'pending',
    sf2_status VARCHAR(20) DEFAULT 'pending',
    sf4_status VARCHAR(20) DEFAULT 'pending',
    sf9_status VARCHAR(20) DEFAULT 'pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some mock data for existing teachers
-- First, get a few teacher IDs
DO $$
DECLARE
    t1_id INTEGER;
    t2_id INTEGER;
BEGIN
    SELECT id INTO t1_id FROM users WHERE role = 'teacher' LIMIT 1;
    SELECT id INTO t2_id FROM users WHERE role = 'teacher' OFFSET 1 LIMIT 1;
    
    IF t1_id IS NOT NULL THEN
        -- Check if it already exists to be idempotent
        IF NOT EXISTS (SELECT 1 FROM school_forms WHERE teacher_id = t1_id AND section_name = 'Rizal') THEN
            INSERT INTO school_forms (teacher_id, section_name, grade_level, sf1_status, sf2_status, sf4_status, sf9_status)
            VALUES (t1_id, 'Rizal', 'Grade 10', 'submitted', 'pending', 'pending', 'pending');
        END IF;
    END IF;

    IF t2_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM school_forms WHERE teacher_id = t2_id AND section_name = 'Mabini') THEN
            INSERT INTO school_forms (teacher_id, section_name, grade_level, sf1_status, sf2_status, sf4_status, sf9_status)
            VALUES (t2_id, 'Mabini', 'Grade 9', 'submitted', 'submitted', 'pending', 'returned');
        END IF;
    END IF;
END $$;
