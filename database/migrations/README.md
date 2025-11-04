# Database Migrations

This directory contains database migration files for the EOL Dashboard. Migrations are used to incrementally update the database schema as the application evolves.

## Migration Files

Migrations are numbered sequentially and should be run in order:

- `001_add_afas_columns.sql` - Adds AFAS ERP integration columns to existing products table

## How to Run Migrations

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query** to open a blank editor

### Step 2: Run the Migration

1. Open the migration file you want to run (e.g., `001_add_afas_columns.sql`)
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Step 3: Verify Success

After running the migration, you should see:
- Success messages in the Results panel
- Notice: "Migration 001_add_afas_columns completed successfully!"

To verify all columns were added correctly, run this query in the SQL Editor:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

This will show you all columns in the products table, including the newly added ones.

## Migration History

| Migration | Description | Date | Status |
|-----------|-------------|------|--------|
| 001 | Add AFAS integration columns | 2025-01-03 | ✅ Ready to run |

## Important Notes

### Safety Features

- All migrations use `ADD COLUMN IF NOT EXISTS` to prevent errors if columns already exist
- Each column is added separately for granular error handling
- Migrations are **idempotent** - safe to run multiple times
- No data loss - only adds new columns with sensible defaults

### What to Do If Migration Fails

1. **Check the error message** in the Supabase SQL Editor Results panel
2. **Common issues:**
   - Permission errors: Ensure you're using the service role or have proper permissions
   - Syntax errors: Make sure you copied the entire file contents
   - Constraint violations: Existing data may conflict with new constraints

3. **Rollback options:**
   - If a column was added but causes issues, you can remove it:
     ```sql
     ALTER TABLE products DROP COLUMN IF EXISTS column_name;
     ```
   - Always test on a staging/development database first if possible

### After Running Migrations

1. **Test the application**: Run `npm run dev` to ensure the frontend works with new columns
2. **Update your code**: If adding new migrations, update this README
3. **Commit changes**: Include migration files in your git commits

## Creating New Migrations

When creating new migration files:

1. **Use sequential numbering**: `002_description.sql`, `003_description.sql`, etc.
2. **Use descriptive names**: Clearly describe what the migration does
3. **Include comments**: Document what each section does
4. **Make it idempotent**: Use `IF NOT EXISTS` and `IF EXISTS` where appropriate
5. **Test thoroughly**: Always test on a copy of production data first
6. **Update this README**: Add entry to Migration History table

## Troubleshooting

### "Column already exists" errors

If you get errors about columns already existing, it means:
- The migration was already run successfully, OR
- Some columns were added manually

**Solution**: The migration uses `IF NOT EXISTS`, so re-running should work. If not, check which columns exist and manually remove those lines from the migration.

### Application still shows errors after migration

1. **Restart your dev server**: `Ctrl+C` then `npm run dev`
2. **Clear browser cache**: Hard refresh with `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
3. **Check Supabase connection**: Verify `.env` has correct Supabase URL and keys
4. **Verify columns exist**: Run the verification query above

## Need Help?

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the migration file for syntax errors
3. Ensure your Supabase project has the latest schema changes
4. Contact the development team with the specific error message
