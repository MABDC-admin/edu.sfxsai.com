CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed mock data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM calendar_events LIMIT 1) THEN
        INSERT INTO calendar_events (title, description, event_date, category) VALUES
        ('Quarterly Exams', 'First quarter examinations for all grade levels.', CURRENT_DATE + INTERVAL '5 days', 'MABDC'),
        ('Faculty Meeting', 'General faculty assembly to discuss new curriculum.', CURRENT_DATE + INTERVAL '2 days', 'SFXSAI'),
        ('Sports Fest Opening', 'Annual sports festival opening ceremony.', CURRENT_DATE + INTERVAL '12 days', 'MABDC'),
        ('Parent-Teacher Conference', 'Distribution of report cards and student evaluation.', CURRENT_DATE + INTERVAL '15 days', 'SFXSAI');
    END IF;
END $$;
