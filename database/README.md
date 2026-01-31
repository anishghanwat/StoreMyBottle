# Database Migrations

## Setup

1. Ensure PostgreSQL is installed and running
2. Create database:
   ```sql
   CREATE DATABASE storemybottle;
   ```

3. Update `backend/.env` with your database URL:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/storemybottle
   ```

## Running Migrations

### Option 1: Manual (for MVP)
Run each migration file directly in psql or your PostgreSQL client:
```bash
psql -d storemybottle -f database/migrations/001_create_users.sql
```

### Option 2: Migration Script (to be created)
A migration runner script will be created in later iterations.

## Migration Files

- `001_create_users.sql` - Creates users table with basic fields

## Notes

- Migrations are idempotent (use IF NOT EXISTS)
- Each migration should be reversible (rollback scripts to be added later)
- Run migrations in order (001, 002, 003, etc.)
