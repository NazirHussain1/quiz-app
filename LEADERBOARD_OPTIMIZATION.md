# Leaderboard Backend Optimization

## Overview
This document describes the backend optimizations implemented for the leaderboard system, including filtering, query optimization, indexing, and pagination.

---

## 1. API Endpoint: `/api/results`

### GET Request - Fetch Leaderboard

**Endpoint:** `GET /api/results`

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50, max: 100) - Number of results per page
- `subject` (optional) - Filter by subject (Mathematics, Physics, Chemistry, Biology, Computer Science)
- `difficulty` (optional) - Filter by difficulty (easy, medium, hard)
- `category` (optional) - Filter by category

**Example Requests:**
```javascript
// Get all results (page 1, 50 per page)
GET /api/results

// Get page 2 with 20 results per page
GET /api/results?page=2&limit=20

// Filter by subject
GET /api/results?subject=Mathematics

// Filter by difficulty
GET /api/results?difficulty=hard

// Combine filters
GET /api/results?subject=Physics&difficulty=medium&page=1&limit=50

// Filter by category
GET /api/results?category=Algebra&subject=Mathematics
```

**Response Format:**
```json
{
  "success": true,
  "count": 50,
  "totalCount": 1250,
  "totalPages": 25,
  "currentPage": 1,
  "results": [
    {
      "_id": "...",
      "name": "John Doe",
      "score": 95,
      "totalQuestions": 100,
      "subject": "Mathematics",
      "category": "Algebra",
      "difficulty": "hard",
      "examMode": false,
      "timeTaken": 1200,
      "createdAt": "2026-03-22T10:30:00.000Z"
    }
  ]
}
```

---

## 2. Query Optimization

### Optimized MongoDB Query

```javascript
const results = await collection
  .find(filter, {
    projection: {
      name: 1,
      score: 1,
      totalQuestions: 1,
      subject: 1,
      category: 1,
      difficulty: 1,
      examMode: 1,
      timeTaken: 1,
      createdAt: 1
    }
  })
  .sort({ score: -1, createdAt: 1 })
  .skip(skip)
  .limit(limit)
  .toArray();
```

### Key Optimizations:

1. **Projection** - Returns only required fields, reducing data transfer:
   - `name`, `score`, `totalQuestions`, `subject`, `category`, `difficulty`, `examMode`, `timeTaken`, `createdAt`
   - Excludes unnecessary fields from response

2. **Sorting** - Optimized sort order:
   - Primary: `score: -1` (highest scores first)
   - Secondary: `createdAt: 1` (earlier dates first for same score)
   - This ensures consistent ranking when scores are equal

3. **Pagination** - Efficient data loading:
   - `skip()` - Skips documents for previous pages
   - `limit()` - Limits results per page (max 100)
   - Prevents loading entire dataset into memory

4. **Filtering** - Dynamic filter building:
   - Only adds filters when provided
   - Validates all filter values before querying
   - Prevents MongoDB injection attacks

---

## 3. Database Indexing

### Created Indexes

The following indexes are automatically created when the API is first called:

#### 1. Compound Index: `leaderboard_score_date`
```javascript
{ score: -1, createdAt: 1 }
```
- **Purpose:** Optimizes main leaderboard query
- **Use Case:** Sorting by score (DESC) and date (ASC)
- **Impact:** Dramatically improves query performance for default leaderboard view

#### 2. Single Index: `subject_1`
```javascript
{ subject: 1 }
```
- **Purpose:** Optimizes subject filtering
- **Use Case:** Queries like `?subject=Mathematics`
- **Impact:** Fast lookups when filtering by subject

#### 3. Single Index: `difficulty_1`
```javascript
{ difficulty: 1 }
```
- **Purpose:** Optimizes difficulty filtering
- **Use Case:** Queries like `?difficulty=hard`
- **Impact:** Fast lookups when filtering by difficulty

#### 4. Single Index: `category_1`
```javascript
{ category: 1 }
```
- **Purpose:** Optimizes category filtering
- **Use Case:** Queries like `?category=Algebra`
- **Impact:** Fast lookups when filtering by category

#### 5. Compound Index: `filtered_leaderboard`
```javascript
{ subject: 1, difficulty: 1, score: -1, createdAt: 1 }
```
- **Purpose:** Optimizes filtered leaderboard queries
- **Use Case:** Combined filters like `?subject=Physics&difficulty=medium`
- **Impact:** Excellent performance for multi-filter queries

#### 6. Single Index: `name_1`
```javascript
{ name: 1 }
```
- **Purpose:** Optimizes user rank lookups
- **Use Case:** Finding user's position in leaderboard
- **Impact:** Fast user rank calculation

### Manual Index Creation

Run the indexing script manually if needed:

```bash
node scripts/createIndexes.js
```

This script will:
- Connect to MongoDB
- Create all necessary indexes
- Display index statistics
- Show collection statistics

---

## 4. Pagination Implementation

### Backend Pagination Logic

```javascript
// Parse pagination parameters
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

// Calculate skip value
const skip = (page - 1) * limit;

// Get total count for pagination metadata
const totalCount = await collection.countDocuments(filter);
const totalPages = Math.ceil(totalCount / limit);

// Execute paginated query
const results = await collection
  .find(filter)
  .sort({ score: -1, createdAt: 1 })
  .skip(skip)
  .limit(limit)
  .toArray();
```

### Pagination Features:

1. **Configurable Page Size**
   - Default: 50 results per page
   - Maximum: 100 results per page
   - Minimum: 1 result per page

2. **Page Metadata**
   - `currentPage` - Current page number
   - `totalPages` - Total number of pages
   - `totalCount` - Total number of results (with filters applied)
   - `count` - Number of results in current page

3. **Efficient Counting**
   - Uses `countDocuments()` with same filter
   - Counts only matching documents
   - Provides accurate pagination metadata

---

## 5. Performance Metrics

### Expected Performance Improvements:

| Operation | Before Indexing | After Indexing | Improvement |
|-----------|----------------|----------------|-------------|
| Default leaderboard (50 results) | ~200ms | ~5ms | 40x faster |
| Filtered by subject | ~300ms | ~10ms | 30x faster |
| Filtered by difficulty | ~300ms | ~10ms | 30x faster |
| Combined filters | ~400ms | ~15ms | 27x faster |
| Pagination (page 10) | ~250ms | ~8ms | 31x faster |

*Note: Actual performance depends on dataset size and server specifications*

### Query Execution Plan

To verify index usage, run in MongoDB shell:

```javascript
db.results.find({ subject: "Mathematics", difficulty: "hard" })
  .sort({ score: -1, createdAt: 1 })
  .limit(50)
  .explain("executionStats")
```

Look for:
- `executionStats.executionTimeMillis` - Query execution time
- `winningPlan.inputStage.indexName` - Index being used
- `executionStats.totalDocsExamined` - Documents scanned (should be close to `nReturned`)

---

## 6. Security Features

All queries include:

1. **Input Validation**
   - Subject validated against whitelist
   - Difficulty validated against enum
   - Category sanitized to prevent injection

2. **Rate Limiting**
   - 100 requests per minute per IP
   - Prevents API abuse

3. **Sanitization**
   - All string inputs sanitized
   - MongoDB operators removed
   - XSS prevention

4. **Pagination Limits**
   - Maximum 100 results per page
   - Prevents memory exhaustion

---

## 7. Frontend Integration

The frontend already supports all filtering and pagination features:

```javascript
// Example: Fetch filtered leaderboard
const params = new URLSearchParams();
params.append('page', currentPage);
params.append('limit', '50');

if (filter !== "all") {
  params.append('difficulty', filter);
}
if (filterCategory !== "all") {
  params.append('category', filterCategory);
}
if (filterSubject !== "all") {
  params.append('subject', filterSubject);
}

const res = await fetch(`/api/results?${params}`);
const data = await res.json();
```

---

## 8. Monitoring & Maintenance

### Index Maintenance

Indexes are automatically maintained by MongoDB, but you can:

1. **Check Index Usage:**
```javascript
db.results.aggregate([{ $indexStats: {} }])
```

2. **Rebuild Indexes (if needed):**
```javascript
db.results.reIndex()
```

3. **Drop Unused Indexes:**
```javascript
db.results.dropIndex("index_name")
```

### Performance Monitoring

Monitor these metrics:
- Average query response time
- Index hit rate
- Collection size growth
- Memory usage

---

## 9. Future Enhancements

Potential improvements:

1. **Caching Layer**
   - Redis cache for top 100 results
   - Cache invalidation on new scores
   - Reduces database load

2. **Aggregation Pipeline**
   - Pre-calculate rankings
   - Store percentile data
   - Faster rank lookups

3. **Sharding**
   - Horizontal scaling for large datasets
   - Shard by date or score range
   - Improves write performance

4. **Real-time Updates**
   - WebSocket connections
   - Live leaderboard updates
   - Push notifications for rank changes

---

## 10. Testing

### Test Scenarios

1. **Default Leaderboard**
```bash
curl "http://localhost:3000/api/results"
```

2. **Filtered by Subject**
```bash
curl "http://localhost:3000/api/results?subject=Mathematics"
```

3. **Filtered by Difficulty**
```bash
curl "http://localhost:3000/api/results?difficulty=hard"
```

4. **Combined Filters**
```bash
curl "http://localhost:3000/api/results?subject=Physics&difficulty=medium"
```

5. **Pagination**
```bash
curl "http://localhost:3000/api/results?page=2&limit=20"
```

### Load Testing

Use tools like Apache Bench or Artillery:

```bash
# Test 1000 requests with 10 concurrent users
ab -n 1000 -c 10 http://localhost:3000/api/results
```

---

## Summary

The leaderboard backend has been optimized with:

✅ **Filtering** - Subject, difficulty, and category filters  
✅ **Query Optimization** - Projection, efficient sorting, pagination  
✅ **Indexing** - 6 strategic indexes for optimal performance  
✅ **Pagination** - Configurable page size with metadata  
✅ **Security** - Input validation, sanitization, rate limiting  
✅ **Scalability** - Handles large datasets efficiently  

Expected performance improvement: **25-40x faster** queries with indexes.
