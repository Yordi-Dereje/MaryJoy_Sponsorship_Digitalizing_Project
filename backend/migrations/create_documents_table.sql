-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('sponsor', 'beneficiary', 'employee', 'guardian')),
  entity_cluster_id VARCHAR(10),
  entity_specific_id VARCHAR(10),
  entity_id INTEGER,
  document_type VARCHAR(100) NOT NULL,
  document_url VARCHAR(500) NOT NULL,
  uploaded_by INTEGER REFERENCES employees(id),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_cluster_id, entity_specific_id);
CREATE INDEX idx_documents_entity_id ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);

-- Add comment
COMMENT ON TABLE documents IS 'Stores document records for all entities (sponsors, beneficiaries, employees, guardians)';
