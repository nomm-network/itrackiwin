# Database Documentation

This folder contains comprehensive documentation for the Supabase database schema and functions.

## 📁 File Structure

### Core Documentation
- `schema-overview.md` - Complete database schema overview
- `tables-reference.md` - Detailed tables reference with columns and constraints
- `foreign-keys.md` - All foreign key relationships
- `rls-policies.md` - Row Level Security policies documentation

### Functions & Procedures
- `functions/` - Database functions split by category
  - `functions-auth.md` - Authentication related functions  
  - `functions-business.md` - Business logic functions
  - `functions-data.md` - Data manipulation functions
  - `functions-geo.md` - Geographic/PostGIS functions
  - `functions-utility.md` - Utility functions

### Views Documentation  
- `views/` - Database views split by category
  - `views-admin.md` - Admin related views
  - `views-exercise.md` - Exercise related views
  - `views-user.md` - User related views
  - `views-business.md` - Business logic views
  - `views-system.md` - System views

### Data Export
- `data/` - Complete data exports from tables
  - `achievements-data.md` - Achievement system data
  - `exercises-data.md` - Exercise database data
  - `equipment-data.md` - Equipment and gym data
  - `users-data.md` - User system data

## 🔄 Last Updated
Generated on: {{ current_date }}

## 📊 Database Statistics
- **Total Tables**: 88 base tables
- **Total Views**: Multiple system and business views
- **Total Functions**: 200+ database functions
- **Total Data Types**: Custom enums and types

## 🔐 Security
This documentation includes RLS policies and security functions that protect user data and ensure proper access control.