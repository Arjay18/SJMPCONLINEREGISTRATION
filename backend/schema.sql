-- Database Schema for Online Registration System

-- Create database
-- Run: CREATE DATABASE registration_db;

-- Connect to registration_db and run the following:

-- Members master table (imported from Excel)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    passbook_no VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table (tracks who registered)
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id),
    passbook_no VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info VARCHAR(255),
    UNIQUE(passbook_no)
);

-- Create indexes for faster lookups
CREATE INDEX idx_members_passbook ON members(passbook_no);
CREATE INDEX idx_registrations_passbook ON registrations(passbook_no);
CREATE INDEX idx_registrations_date ON registrations(registration_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
