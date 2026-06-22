CREATE TABLE IF NOT EXISTS learner_portfolios (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_added DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed mock data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM learner_portfolios LIMIT 1) THEN
        INSERT INTO learner_portfolios (student_name, grade_level, item_type, title, description) VALUES
        ('Juan Dela Cruz', 'Grade 10', 'Certificate', 'Best in Mathematics', 'Awarded for topping the regional math quiz bee.'),
        ('Maria Clara', 'Grade 9', 'Research Output', 'Solar Powered Water Purifier', 'A working prototype submitted for the science fair.'),
        ('Jose Rizal', 'Grade 12', 'Achievement Record', 'Varsity Team Captain', 'Led the basketball team to the district championships.'),
        ('Andres Bonifacio', 'Grade 11', 'Certificate', 'Leadership Excellence', 'Awarded for exceptional service in the Student Council.'),
        ('Gabriela Silang', 'Grade 8', 'Research Output', 'Local Plant Biodiversity Study', 'Comprehensive catalog of indigenous flora.');
    END IF;
END $$;
