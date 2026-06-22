CREATE TABLE IF NOT EXISTS learner_support_tickets (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    support_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed mock data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM learner_support_tickets LIMIT 1) THEN
        INSERT INTO learner_support_tickets (student_name, grade_level, support_type, status, notes) VALUES
        ('Pedro Penduko', 'Grade 7', 'Counseling', 'Open', 'Student requested a session to discuss adjustment to high school.'),
        ('Apolinario Mabini', 'Grade 11', 'Intervention Plan', 'In Progress', 'Reading comprehension intervention. Assigned to Mrs. Reyes.'),
        ('Emilio Aguinaldo', 'Grade 12', 'General Support', 'Resolved', 'Career guidance session completed successfully.'),
        ('Melchora Aquino', 'Grade 9', 'Intervention Plan', 'Open', 'Math tutoring required twice a week.'),
        ('Diego Silang', 'Grade 10', 'Counseling', 'In Progress', 'Follow-up session scheduled for next Tuesday.');
    END IF;
END $$;
