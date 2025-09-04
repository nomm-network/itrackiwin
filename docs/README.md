# Fitness Application Documentation

This directory contains comprehensive documentation for the fitness tracking application.

## Current Documentation (Updated 2025-09-04)

### Core Documentation
- [`db-schema-complete.md`](./db-schema-complete.md) - **Complete database schema** with all 118 tables, relationships, and RLS policies
- [`database-full-export.sql`](./database-full-export.sql) - **Full database export** with sample data and real workout sessions
- [`FILE_STRUCTURE_GUIDELINES.md`](./FILE_STRUCTURE_GUIDELINES.md) - **Project architecture** and coding standards
- [`EDGE_FUNCTIONS_DOCUMENTATION.md`](./EDGE_FUNCTIONS_DOCUMENTATION.md) - **Supabase Edge Functions** catalog and documentation

### API & System Documentation
- [`api.md`](./api.md) - API endpoints and usage examples
- [`coach.md`](./coach.md) - AI coaching system documentation
- [`data-model.md`](./data-model.md) - Data modeling patterns and relationships
- [`fflow.md`](./fflow.md) - FlutterFlow integration guide

### Database Details
- [`database/`](./database/) - Detailed database schema files
  - `foreign-keys.md` - Foreign key relationships
  - `rls-policies.md` - Row-Level Security policies
  - `enums-types.md` - Custom PostgreSQL types
  - `FUNCTIONS_CATALOG.md` - Database functions reference

### Architecture & Guidelines
- [`architecture/FEATURE_FIRST_MIGRATION_COMPLETE.md`](./architecture/FEATURE_FIRST_MIGRATION_COMPLETE.md) - Feature-first architecture migration
- [`UNIFIED_WORKOUT_SYSTEM_IMPLEMENTATION.md`](./UNIFIED_WORKOUT_SYSTEM_IMPLEMENTATION.md) - Workout system implementation guide

## Project Overview

This is a comprehensive fitness application built with:
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, real-time features)
- **Architecture**: Modern web application with admin panel and user interface

## Key Features

- Exercise management and database
- Workout planning and tracking
- User authentication and profiles
- Equipment and gym management
- Multi-language support
- Admin panel for content management

## Recent Major Changes

The project recently underwent significant architectural changes, particularly the removal of the handle system in favor of equipment-grip compatibility management. See [`recent-changes.md`](./recent-changes.md) for detailed information.

## Database Statistics

- **Total Tables**: 144 tables
- **Core Exercise Data**: 1 exercise with translations
- **Equipment Types**: 40+ different equipment types
- **Multi-language Support**: English translations available
- **User Management**: Role-based access control system

## Audit Notes

This documentation was generated on 2025-09-01 and reflects the current state of the database and application structure. All sensitive data has been excluded from this export.