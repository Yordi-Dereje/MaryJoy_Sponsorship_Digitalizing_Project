-- Drop the old documents table if it exists
DROP TABLE IF EXISTS documents CASCADE;

-- Create documents table with correct schema matching the Document model
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  type VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  sponsor_cluster_id VARCHAR(10),
  sponsor_specific_id VARCHAR(10),
  guardian_id INTEGER,
  beneficiary_id INTEGER,
  created_by INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_documents_sponsor ON documents(sponsor_cluster_id, sponsor_specific_id);
CREATE INDEX idx_documents_guardian ON documents(guardian_id);
CREATE INDEX idx_documents_beneficiary ON documents(beneficiary_id);
CREATE INDEX idx_documents_type ON documents(type);

-- Add comment
COMMENT ON TABLE documents IS 'Stores document records for sponsors, beneficiaries, guardians';
