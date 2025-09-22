# ⚠️ DOCUMENTATION & CRISIS STATUS ⚠️

## ❌ CRITICAL SYSTEM FAILURE 
**WORKOUT SET LOGGING COMPLETELY BROKEN** - All multi-set workouts fail due to database constraint violation

## Overview
Documentation exists but **SYSTEM IS NON-FUNCTIONAL** due to unresolved database constraint conflicts.

## Documentation Created

### 1. AI Coach System Documentation (`docs/coach.md`)
**Covers**:
- **Coach Functions**: AI Coach, Form Coach, Progress Insights
- **Input/Output Specifications**: Detailed API contracts
- **Coaching Algorithms**: Progressive overload, RPE calculation, fatigue management
- **Prompt Engineering**: System prompts and context management
- **Performance Metrics**: Response times, rate limiting, caching
- **Error Handling**: Common patterns and fallback strategies
- **Security & Privacy**: Data protection and access control

**Key Sections**:
- Function inputs/outputs with JSON schemas
- Mathematical formulas for progression and intensity
- Integration points with database triggers
- Monitoring and analytics guidelines

### 2. API Documentation (`docs/api.md`)
**Covers**:
- **Authentication**: Supabase JWT and API key management
- **Core Endpoints**: Exercises, workouts, user data APIs
- **Edge Functions**: Complete integration guide
- **RPC Functions**: Database function calls
- **Error Handling**: Standard responses and status codes
- **Real-time Features**: Subscription patterns
- **Performance Guidelines**: Pagination, caching, optimization

**Key Sections**:
- HTTP endpoint specifications with examples
- SDK integration patterns (JavaScript/TypeScript, cURL)
- Rate limiting and performance considerations
- Testing strategies and tools

### 3. FlutterFlow Integration Guide (`docs/fflow.md`)
**Covers**:
- **Authentication Setup**: Supabase integration in FlutterFlow
- **API Integration**: Direct queries, RPC calls, edge functions
- **Data Models**: Dart classes for core entities
- **Custom Actions**: Workout flow and AI coach integration
- **Real-time Features**: Subscription implementation
- **Custom Widgets**: Exercise cards, set logging, UI components
- **Performance Optimization**: Pagination, caching, error handling

**Key Sections**:
- Complete Flutter/Dart code examples
- Widget testing and integration testing
- Deployment and environment configuration
- Mobile-specific patterns and best practices

### 4. Data Model Documentation (`docs/data-model.md`)
**Covers**:
- **Core Entities**: Users, exercises, workouts, templates
- **Advanced Systems**: Metrics, performance tracking, AI logs
- **Relationships**: Complete ERD and foreign key mappings
- **Query Patterns**: Common SQL queries and optimizations
- **Performance Considerations**: Indexes, materialized views, RLS
- **Migration Patterns**: Data import and schema updates

**Key Sections**:
- SQL schema definitions with constraints
- Mermaid ERD diagram showing relationships
- Performance optimization strategies
- Data quality and migration guidelines

## Documentation Integration

### README Updates
- **Navigation Links**: Direct links to all documentation
- **Clear Structure**: Organized by topic and use case
- **Quick Access**: Essential docs highlighted prominently

### Documentation Standards
- **Consistent Format**: Standardized structure across all docs
- **Code Examples**: Practical, copy-paste ready snippets
- **Visual Aids**: Diagrams and schemas where helpful
- **Update Guidelines**: Version control and maintenance notes

## Team Alignment Benefits

### For Developers
- **API Reference**: Complete endpoint documentation
- **Integration Patterns**: Proven code examples
- **Error Handling**: Standard approaches and best practices
- **Performance Guidelines**: Optimization strategies

### For Mobile Teams
- **FlutterFlow Guide**: Complete integration walkthrough
- **Data Models**: Ready-to-use Dart classes
- **Real-time Features**: Subscription implementation
- **Testing Strategies**: Widget and integration testing

### For Data Teams
- **Schema Documentation**: Complete database structure
- **Relationship Mapping**: Foreign key and constraint details
- **Query Optimization**: Performance patterns and indexes
- **Migration Strategies**: Safe data update procedures

### For AI/ML Teams  
- **Coach Architecture**: Function specifications and flows
- **Algorithm Documentation**: Mathematical formulas and logic
- **Context Management**: Prompt engineering and state handling
- **Performance Metrics**: Monitoring and analytics requirements

## Maintenance Strategy

### Documentation Updates
- **Version Control**: All docs in Git with proper versioning
- **Review Process**: Updates reviewed with code changes
- **Automated Checks**: Link validation and format consistency
- **Regular Audits**: Quarterly documentation review cycles

### Knowledge Sharing
- **Onboarding**: New team members start with documentation
- **Training Materials**: Docs serve as training foundation
- **Reference Guide**: Quick lookup for daily development
- **Best Practices**: Consolidated team knowledge

## Access and Navigation

### File Structure
```
docs/
├── coach.md          # AI Coach system documentation
├── api.md           # API reference and integration
├── fflow.md         # FlutterFlow mobile integration  
└── data-model.md    # Database schema and patterns
```

### ⚠️ CRITICAL SYSTEM STATUS
- 🔴 **Set Logging**: BROKEN - constraint violation `personal_records_user_ex_kind_unique`
- 🔴 **Multi-Set Workouts**: IMPOSSIBLE - second set always fails
- 🔴 **Database State**: CORRUPTED - old constraints still active
- 🔴 **Migration Status**: 4 FAILED attempts to fix
- 🟡 **Single-Set Workouts**: Still work (creates PR, then fails on next)

### 🚨 Emergency Action Required
**MANUAL DATABASE INTERVENTION NEEDED** - Migration tools insufficient

This comprehensive documentation suite exists but **THE CORE SYSTEM IS BROKEN** and requires immediate database constraint cleanup.