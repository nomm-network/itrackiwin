# Database Schema Documentation

This directory contains comprehensive documentation for the fitness application database schema.

## Overview

The database is built on PostgreSQL with Supabase and includes the following main functional areas:

- **Exercises & Equipment**: Core exercise library with equipment, handles, grips
- **Workouts**: User workouts, templates, sets, and tracking
- **Users & Social**: User profiles, friendships, challenges
- **Fitness & Health**: Body tracking, cycle events, readiness
- **Admin & Analytics**: Administrative functions and data quality

## Documentation Files

- [`tables-overview.md`](./tables-overview.md) - Complete table listing with descriptions
- [`exercises-schema.md`](./exercises-schema.md) - Exercise-related tables and relationships
- [`workouts-schema.md`](./workouts-schema.md) - Workout and template system tables
- [`users-social-schema.md`](./users-social-schema.md) - User profiles and social features
- [`foreign-keys.md`](./foreign-keys.md) - All foreign key relationships
- [`rls-policies.md`](./rls-policies.md) - Row Level Security policies
- [`enums-types.md`](./enums-types.md) - Custom types and enums

## Key Design Principles

1. **Row Level Security (RLS)**: All user data is protected with RLS policies
2. **Internationalization**: Translation tables for multi-language support
3. **Extensibility**: JSON fields for flexible metadata and settings
4. **Audit Trail**: Created/updated timestamps on all major tables
5. **Soft References**: UUIDs with nullable foreign keys where appropriate

## Getting Started

1. Review the [tables overview](./tables-overview.md) for a high-level understanding
2. Dive into specific functional areas based on your needs
3. Check [foreign keys](./foreign-keys.md) to understand table relationships
4. Review [RLS policies](./rls-policies.md) for data access patterns