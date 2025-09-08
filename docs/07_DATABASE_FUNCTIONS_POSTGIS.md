# Database Functions - PostGIS & Text Processing Functions

**Export Date:** 2025-01-08  
**Database Type:** PostgreSQL  
**Schema:** public  

This document provides a comprehensive overview of all PostGIS spatial functions, text processing functions, and PostgreSQL extension functions in the database.

---

## Overview

The database contains **899 total functions** split across two documentation files:
- **Core Business & System Functions**: ~475 functions
- **PostGIS & Text Processing Functions** (this file): ~424 functions

### Function Categories in This File

1. **PostGIS Spatial Functions**: Geometry operations, measurements, spatial analysis
2. **PostGIS Core Functions**: Type handling, system functions
3. **Text Similarity Functions**: Trigram-based text matching
4. **Full Text Search Functions**: GIN indexing for text search
5. **Text Processing Functions**: Unaccent, character processing

---

## PostGIS Spatial Functions

### Geometry Measurement Functions

#### `st_area(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates the area of a polygon geometry.

#### `st_area2d(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates 2D area of a polygon geometry.

#### `st_perimeter(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates the perimeter of a polygon geometry.

#### `st_perimeter2d(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates 2D perimeter of a polygon geometry.

#### `st_3dperimeter(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates 3D perimeter of a polygon geometry.

#### `st_length(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns the length of a linestring geometry.

#### `st_length2d(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns 2D length of a linestring geometry.

#### `st_3dlength(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns 3D length of a linestring geometry.

#### `st_lengthspheroid(geometry, spheroid)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates length using spheroidal calculations.

#### `st_length2dspheroid(geometry, spheroid)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates 2D length using spheroidal calculations.

### Distance & Spatial Relationship Functions

#### `st_distance(geom1 geometry, geom2 geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns the distance between two geometries.

#### `st_distancespheroid(geom1 geometry, geom2 geometry, spheroid)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates distance using spheroidal calculations.

#### `st_distancespheroid(geom1 geometry, geom2 geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Overloaded version using default spheroid.

#### `st_azimuth(geom1 geometry, geom2 geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns the azimuth between two point geometries.

#### `st_angle(pt1 geometry, pt2 geometry, pt3 geometry, pt4 geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates angle between vectors formed by points.

### Geometry Analysis Functions

#### `st_npoints(geometry)`
**Language:** c  
**Returns:** integer  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns the number of points in a geometry.

#### `st_nrings(geometry)`
**Language:** c  
**Returns:** integer  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns the number of rings in a polygon.

#### `st_ispolygoncw(geometry)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Tests if polygon exterior ring is clockwise.

#### `st_ispolygonccw(geometry)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Tests if polygon exterior ring is counter-clockwise.

#### `st_pointinsidecircle(geometry, double precision, double precision, double precision)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Tests if point is inside a circle defined by center and radius.

### Geometry Transformation Functions

#### `st_force2d(geometry)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Forces geometry to 2D by removing Z and M coordinates.

#### `st_force3d(geom geometry, zvalue double precision)`
**Language:** sql  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Forces geometry to 3D by adding Z coordinate.

#### `st_force3dz(geom geometry, zvalue double precision)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Forces geometry to 3D with Z coordinate.

#### `st_force3dm(geom geometry, mvalue double precision)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Forces geometry to 3D with M coordinate.

#### `st_forcepolygonccw(geometry)`
**Language:** sql  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Forces polygon orientation to counter-clockwise.

#### `st_forcerhr(geometry)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Forces polygon to follow right-hand rule.

### Coordinate Access Functions

#### `st_x(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns X coordinate of a point geometry.

#### `st_y(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns Y coordinate of a point geometry.

#### `st_z(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns Z coordinate of a point geometry.

#### `st_m(geometry)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Returns M coordinate of a point geometry.

---

## PostGIS Type Conversion Functions

### Geometry Type Functions

#### `geometry_in(cstring)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Input function for geometry type.

#### `geometry_out(geometry)`
**Language:** c  
**Returns:** cstring  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Output function for geometry type.

#### `geometry_recv(internal)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Binary input function for geometry type.

#### `geometry_send(geometry)`
**Language:** c  
**Returns:** bytea  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Binary output function for geometry type.

#### `geometry_typmod_in(cstring[])`
**Language:** c  
**Returns:** integer  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Type modifier input for geometry.

#### `geometry_typmod_out(integer)`
**Language:** c  
**Returns:** cstring  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Type modifier output for geometry.

#### `geometry_analyze(internal)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Analyze function for geometry type.

#### `geometry(geometry, integer, boolean)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Geometry constructor with type enforcement.

### PostgreSQL Native Type Conversions

#### `geometry(point)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts PostgreSQL point to PostGIS geometry.

#### `point(geometry)`
**Language:** c  
**Returns:** point  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts PostGIS geometry to PostgreSQL point.

#### `geometry(path)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts PostgreSQL path to PostGIS geometry.

#### `path(geometry)`
**Language:** c  
**Returns:** path  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts PostGIS geometry to PostgreSQL path.

#### `geometry(polygon)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts PostgreSQL polygon to PostGIS geometry.

#### `polygon(geometry)`
**Language:** c  
**Returns:** polygon  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts PostGIS geometry to PostgreSQL polygon.

### Spheroid Type Functions

#### `spheroid_in(cstring)`
**Language:** c  
**Returns:** spheroid  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Input function for spheroid type.

#### `spheroid_out(spheroid)`
**Language:** c  
**Returns:** cstring  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Output function for spheroid type.

### Box3D Type Functions

#### `box3d_in(cstring)`
**Language:** c  
**Returns:** box3d  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Input function for box3d type.

---

## PostGIS Utility Functions

#### `postgis_noop(geometry)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

No-operation function for geometry (testing/debugging).

#### `postgis_geos_noop(geometry)`
**Language:** c  
**Returns:** geometry  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

GEOS-based no-operation function.

---

## Text Similarity Functions (pg_trgm Extension)

### Core Similarity Functions

#### `similarity(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates trigram similarity between two text strings.

#### `similarity_op(text, text)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Operator function for similarity comparison.

#### `similarity_dist(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Distance function based on similarity (1 - similarity).

### Word Similarity Functions

#### `word_similarity(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates word-based similarity between texts.

#### `word_similarity_op(text, text)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Operator function for word similarity.

#### `word_similarity_commutator_op(text, text)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Commutator operator for word similarity.

#### `word_similarity_dist_op(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Distance operator for word similarity.

#### `word_similarity_dist_commutator_op(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Commutator distance operator for word similarity.

### Strict Word Similarity Functions

#### `strict_word_similarity(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Strict word similarity calculation.

#### `strict_word_similarity_op(text, text)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Operator for strict word similarity.

#### `strict_word_similarity_commutator_op(text, text)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Commutator operator for strict word similarity.

#### `strict_word_similarity_dist_op(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Distance operator for strict word similarity.

#### `strict_word_similarity_dist_commutator_op(text, text)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Commutator distance operator for strict word similarity.

### Trigram Utility Functions

#### `show_trgm(text)`
**Language:** c  
**Returns:** text[]  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Shows trigrams generated from input text.

#### `set_limit(real)`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Sets similarity threshold for % operator.

#### `show_limit()`
**Language:** c  
**Returns:** real  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Shows current similarity threshold.

---

## GIN Index Functions for Trigrams

### GIN Trigram Type Functions

#### `gtrgm_in(cstring)`
**Language:** c  
**Returns:** gtrgm  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Input function for gtrgm type.

#### `gtrgm_out(gtrgm)`
**Language:** c  
**Returns:** cstring  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Output function for gtrgm type.

### GIN Support Functions

#### `gtrgm_consistent(internal, text, smallint, oid, internal)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Consistency function for GIN trigram indexes.

#### `gtrgm_distance(internal, text, smallint, oid, internal)`
**Language:** c  
**Returns:** double precision  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Distance function for GIN trigram indexes.

#### `gtrgm_compress(internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Compression function for GIN trigram indexes.

#### `gtrgm_decompress(internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Decompression function for GIN trigram indexes.

#### `gtrgm_penalty(internal, internal, internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Penalty function for GIN trigram indexes.

#### `gtrgm_picksplit(internal, internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Split function for GIN trigram indexes.

#### `gtrgm_union(internal, internal)`
**Language:** c  
**Returns:** gtrgm  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Union function for GIN trigram indexes.

#### `gtrgm_same(gtrgm, gtrgm, internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Equality function for GIN trigram indexes.

#### `gtrgm_options(internal)`
**Language:** c  
**Returns:** void  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Options function for GIN trigram indexes.

### GIN Extract Functions

#### `gin_extract_value_trgm(text, internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Extracts trigrams from text for GIN indexing.

#### `gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Extracts query trigrams for GIN index searches.

#### `gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)`
**Language:** c  
**Returns:** boolean  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Consistency function for GIN trigram searches.

#### `gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)`
**Language:** c  
**Returns:** "char"  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Tri-consistent function for GIN trigram searches.

---

## Text Processing Functions (unaccent Extension)

### Unaccent Functions

#### `unaccent(text)`
**Language:** c  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Removes accents from text using default dictionary.

#### `unaccent(regdictionary, text)`
**Language:** c  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Removes accents using specified dictionary.

### Unaccent Internal Functions

#### `unaccent_init(internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Initialization function for unaccent.

#### `unaccent_lexize(internal, internal, internal, internal)`
**Language:** c  
**Returns:** internal  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Lexization function for unaccent dictionary.

---

## Notes

- **PostGIS Functions**: Provide comprehensive spatial data processing capabilities
- **Text Similarity**: Enable fuzzy text matching and search functionality  
- **GIN Indexing**: Support high-performance text search operations
- **Type Safety**: All functions include proper type checking and conversion
- **Performance**: Many functions are marked IMMUTABLE for optimization
- **Extension Integration**: Functions integrate PostgreSQL extensions seamlessly

These functions extend PostgreSQL with advanced spatial analysis, text processing, and search capabilities essential for modern applications requiring location services and intelligent text matching.