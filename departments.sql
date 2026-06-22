CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    head_name VARCHAR(255) NOT NULL,
    coordinator_name VARCHAR(255) NOT NULL,
    faculty_count INTEGER NOT NULL DEFAULT 0,
    performance_score INTEGER NOT NULL DEFAULT 100
);

-- Seed mock data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM departments LIMIT 1) THEN
        INSERT INTO departments (name, head_name, coordinator_name, faculty_count, performance_score) VALUES
        ('Science Department', 'Dr. Arturo Paz', 'Ms. Elena Cruz', 12, 94),
        ('Mathematics Department', 'Mr. Roberto Luna', 'Ms. Maria Santos', 15, 88),
        ('English Department', 'Mrs. Carmen Reyes', 'Mr. Jose Bautista', 10, 91),
        ('Filipino Department', 'Ms. Teresa Magbanua', 'Mr. Andres Delos Reyes', 8, 85),
        ('Araling Panlipunan', 'Mr. Gregorio Del Pilar', 'Ms. Leonor Rivera', 9, 89);
    END IF;
END $$;
