-- Add priority column to todos
ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 0;

-- Create index on priority for faster filtering
CREATE INDEX idx_todos_priority ON todos(priority);