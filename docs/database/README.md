# ⚠️ DATABASE SCHEMA - CRITICAL SYSTEM FAILURE ⚠️

## 🚨 EMERGENCY STATUS
**WORKOUT SET LOGGING COMPLETELY BROKEN** due to database constraint conflicts

### Crisis Summary:
- **Error**: `duplicate key value violates unique constraint "personal_records_user_ex_kind_unique"`
- **Impact**: Multi-set workouts impossible, core functionality unusable
- **Failed Fixes**: 4 migration attempts unsuccessful
- **Root Cause**: Old constraint still active, blocks grip-aware personal records

This directory contains comprehensive documentation for the **CURRENTLY BROKEN** fitness application database schema.

## ⚠️ Critical Issues
The database currently has **conflicting constraints** that prevent set logging:
- Old constraint blocks new grip-aware logic
- Manual database intervention required
- 5 different set logging implementations cause chaos

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

## 🚨 EMERGENCY Actions Required

1. **Manual database constraint cleanup** via Supabase SQL console
2. **Force drop** `personal_records_user_ex_kind_unique` constraint  
3. **Verify** only grip-aware constraint remains active
4. **Test** multi-set logging functionality
5. **Consolidate** multiple set logging implementations

**⚠️ WARNING**: Documentation below describes the intended schema, but the system is currently BROKEN due to constraint conflicts.