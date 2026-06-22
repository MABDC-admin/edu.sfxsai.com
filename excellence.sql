CREATE TABLE IF NOT EXISTS academic_awards (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    award_type VARCHAR(100) NOT NULL,
    award_title VARCHAR(255) NOT NULL,
    date_awarded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed mock data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM academic_awards LIMIT 1) THEN
        INSERT INTO academic_awards (student_name, grade_level, award_type, award_title, date_awarded) VALUES
        ('Juan Dela Cruz', 'Grade 10', 'Honor Roll', 'With Highest Honors', CURRENT_DATE - INTERVAL '10 days'),
        ('Maria Clara', 'Grade 9', 'Competition', '1st Place - Regional Science Fair', CURRENT_DATE - INTERVAL '15 days'),
        ('Jose Rizal', 'Grade 12', 'Scholarship', 'DOST Merit Scholarship', CURRENT_DATE - INTERVAL '30 days'),
        ('Andres Bonifacio', 'Grade 11', 'Honor Roll', 'With High Honors', CURRENT_DATE - INTERVAL '10 days'),
        ('Gabriela Silang', 'Grade 8', 'Competition', 'Gold Medalist - Math Olympiad', CURRENT_DATE - INTERVAL '5 days');
    END IF;
END $$;
