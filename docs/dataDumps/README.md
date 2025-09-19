# Data Dumps for Exercise Bulk Import

This folder contains SQL queries requested by CG for bulk exercise creation. Each file corresponds to a specific data export needed to generate correct INSERTs that match our existing database schema.

## Files Overview

### 01-enums.sql
Exports all enum values used by the schema to prevent invalid enum inserts during bulk creation.
**Output**: CSV with `enum_type, value` columns

### 02-equipment.sql  
Exports all equipment rows with essential fields for exercise mapping.
**Output**: Full CSV with all equipment data including UUIDs for FK references

### 03-movement-references.sql
Exports all reference tables that exercises link to (movement patterns, movements, body parts, muscles, grips, bar types).
**Output**: Multiple CSV files, each with `id, label` columns

### 04-current-exercises.sql
Exports existing exercises to understand patterns and avoid duplicates.
**Output**: CSV with current exercise data showing naming conventions and configurations

### 05-optional-translations-rls.sql
Optional exports for translations structure and RLS policies that might affect inserts.
**Output**: Sample translations CSV + RLS policies list

## Usage Instructions

1. Run each SQL query against your database
2. Export results as CSV files
3. Keep UUIDs exactly as returned (no modifications)
4. Send to CG for bulk exercise INSERT generation

## Why This Data is Needed

- **Enums**: Prevents type constraint violations
- **Equipment**: Enables correct `equipment_id` FK mapping  
- **Movement References**: Enables correct FK mapping for classification
- **Current Exercises**: Avoids duplicates and mirrors existing conventions
- **Translations/RLS**: Ensures INSERTs won't be blocked and labels are correct

## Expected Outcome

CG will produce clean, ID-safe INSERT statements for 60-100 canonical exercises using only existing columns and defaults, with `configured = false` until QA approval.