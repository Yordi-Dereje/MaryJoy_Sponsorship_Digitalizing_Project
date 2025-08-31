-- Create the database
CREATE DATABASE mary_joy_ethiopia;

-- Connect to the database
\c mary_joy_ethiopia;

-- Create enum types
CREATE TYPE access_level_enum AS ENUM ('admin', 'moderator', 'viewer');
CREATE TYPE beneficiary_status_enum AS ENUM ('active', 'inactive', 'pending', 'graduated', 'deceased');
CREATE TYPE beneficiary_type_enum AS ENUM ('child', 'elderly');
CREATE TYPE document_type_enum AS ENUM ('id_card', 'passport', 'bank_statement', 'contract', 'other');
CREATE TYPE entity_type_enum AS ENUM ('sponsor', 'beneficiary', 'guardian');
CREATE TYPE enum_sponsors_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE enum_sponsors_status AS ENUM ('pending_review', 'active', 'inactive', 'suspended');
CREATE TYPE enum_sponsors_type AS ENUM ('individual', 'organization');
CREATE TYPE feedback_status_enum AS ENUM ('pending', 'responded', 'resolved');
CREATE TYPE gender_enum AS ENUM ('male', 'female');
CREATE TYPE request_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE sponsor_status_enum AS ENUM ('active', 'inactive', 'pending_review', 'suspended');
CREATE TYPE sponsor_type_enum AS ENUM ('individual', 'organization');
CREATE TYPE sponsorship_status_enum AS ENUM ('active', 'completed', 'terminated', 'pending');

-- Create tables
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    sub_region VARCHAR(100),
    woreda VARCHAR(100),
    house_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender gender_enum,
    department VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    access_level access_level_enum NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sponsors (
    cluster_id VARCHAR(2) NOT NULL,
    specific_id VARCHAR(4) NOT NULL,
    type sponsor_type_enum NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender enum_sponsors_gender,
    profile_picture_url VARCHAR(500),
    starting_date DATE,
    agreed_monthly_payment NUMERIC,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    status sponsor_status_enum NOT NULL DEFAULT 'pending_review',
    is_diaspora BOOLEAN NOT NULL DEFAULT false,
    address_id INTEGER,
    password_hash VARCHAR(255),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(20),
    sponsor_id VARCHAR(255),
    consent_document_url VARCHAR(255),
    PRIMARY KEY (cluster_id, specific_id),
    FOREIGN KEY (address_id) REFERENCES addresses(id),
    FOREIGN KEY (created_by) REFERENCES employees(id)
);

CREATE TABLE guardians (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    relation_to_beneficiary VARCHAR(100) NOT NULL,
    address_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE beneficiaries (
    id SERIAL PRIMARY KEY,
    type beneficiary_type_enum NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender gender_enum NOT NULL,
    date_of_birth DATE NOT NULL,
    photo_url VARCHAR(500),
    status beneficiary_status_enum NOT NULL DEFAULT 'pending',
    guardian_id INTEGER,
    address_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES guardians(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE phone_numbers (
    id SERIAL PRIMARY KEY,
    entity_type entity_type_enum NOT NULL,
    sponsor_cluster_id VARCHAR(2),
    sponsor_specific_id VARCHAR(4),
    beneficiary_id INTEGER,
    guardian_id INTEGER,
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    tertiary_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES sponsors(cluster_id, specific_id),
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);

CREATE TABLE bank_information (
    id SERIAL PRIMARY KEY,
    entity_type entity_type_enum NOT NULL,
    sponsor_cluster_id VARCHAR(2),
    sponsor_specific_id VARCHAR(4),
    beneficiary_id INTEGER,
    guardian_id INTEGER,
    bank_account_number VARCHAR(100) NOT NULL UNIQUE,
    bank_name VARCHAR(100) NOT NULL,
    bank_book_photo_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES sponsors(cluster_id, specific_id),
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);

CREATE TABLE sponsorships (
    id SERIAL PRIMARY KEY,
    sponsor_cluster_id VARCHAR(2) NOT NULL,
    sponsor_specific_id VARCHAR(4) NOT NULL,
    beneficiary_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_amount NUMERIC NOT NULL,
    status sponsorship_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES sponsors(cluster_id, specific_id),
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    sponsor_cluster_id VARCHAR(2) NOT NULL,
    sponsor_specific_id VARCHAR(4) NOT NULL,
    payment_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    start_month INTEGER NOT NULL,
    end_month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    bank_receipt_url VARCHAR(500) NOT NULL,
    company_receipt_url VARCHAR(500) NOT NULL,
    reference_number VARCHAR(100),
    confirmed_by INTEGER NOT NULL,
    confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES sponsors(cluster_id, specific_id),
    FOREIGN KEY (confirmed_by) REFERENCES employees(id)
);
