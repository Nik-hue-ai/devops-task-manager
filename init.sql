-- Initialize the AutoDeploy Hub database
-- This script is automatically run when the PostgreSQL container starts

-- Create the tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the completed column for faster queries
CREATE INDEX IF NOT EXISTS idx_task_completed ON task(completed);

-- Create an index on the created_at column for sorting
CREATE INDEX IF NOT EXISTS idx_task_created_at ON task(created_at);

-- Insert some sample data for demonstration
INSERT INTO task (title, description, completed) VALUES
('Setup CI/CD Pipeline', 'Configure GitHub Actions for automated testing and deployment', true),
('Implement Monitoring', 'Set up Prometheus and Grafana for application monitoring', false),
('Write Documentation', 'Create comprehensive README and deployment guides', false),
('Security Audit', 'Review application security and implement best practices', false),
('Performance Testing', 'Conduct load testing and optimize application performance', false)
ON CONFLICT DO NOTHING;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_task_updated_at ON task;
CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
