# PostgreSQL Database Management Guide

This guide provides instructions for managing the PostgreSQL database for your capstone project deployed on AWS EC2. The database runs in a Docker container and is managed using the provided `db-utils.sh` script.

## Getting Started

After deploying your application to AWS using the `deploy.sh` script, the PostgreSQL database will be running in a Docker container. The `db-utils.sh` script provides an easy way to manage the database without needing to know complex PostgreSQL commands.

### Making the Script Executable

First, make the script executable:

```bash
chmod +x db-utils.sh
```

### Running the Script

You can run the script in two ways:

1. **Interactive Menu Mode**: Simply run the script without arguments
   ```bash
   ./db-utils.sh
   ```
   This will display a menu with all available options.

2. **Command Line Mode**: Run specific commands directly
   ```bash
   ./db-utils.sh --health    # Check database health
   ./db-utils.sh --backup    # Create a database backup
   ```

## Common Database Management Tasks

### Checking Database Health

To verify that your database is running correctly:

```bash
./db-utils.sh --health
```

This will check if:
- The database container is running
- PostgreSQL service is accepting connections
- Basic database statistics

### Verifying Database Connection

To test database connectivity:

```bash
./db-utils.sh --verify
```

This will connect to the database and display the PostgreSQL version.

### Viewing Database Logs

To check database logs for troubleshooting:

```bash
./db-utils.sh --logs
```

This displays the most recent logs from the PostgreSQL container.

### Listing Database Tables

To see all tables in your database:

```bash
./db-utils.sh --tables
```

### Running SQL Queries

To execute custom SQL queries:

```bash
./db-utils.sh --query
```

You'll be prompted to enter your SQL query. For example:
```sql
SELECT * FROM "User" LIMIT 5;
```

### Interactive PostgreSQL Session

To open an interactive PostgreSQL session:

```bash
./db-utils.sh --psql
```

This gives you direct access to the PostgreSQL command line. Use `\q` to exit when done.

## Backup and Restore Procedures

### Creating Database Backups

To create a backup of your entire database:

```bash
./db-utils.sh --backup
```

This will:
1. Create a timestamped SQL dump file
2. Compress it with gzip
3. Store it in the `db_backups` directory
4. Display the path to the created backup file

Backups are named in the format: `postgres_backup_YYYYMMDD_HHMMSS.sql.gz`

### Restoring from a Backup

To restore your database from a previous backup:

```bash
./db-utils.sh --restore
```

This will:
1. Show available backups
2. Prompt you to select a backup file
3. Ask for confirmation (as this will overwrite the current database)
4. Restore the database from the selected backup

**WARNING**: Restoring a backup will overwrite the current database. Make sure to back up any current data you want to keep.

### Scheduling Regular Backups

To set up automated backups:

```bash
./db-utils.sh --schedule
```

You can choose:
1. Daily backups at midnight
2. Weekly backups on Sunday at midnight
3. Custom schedule using cron syntax

The system will automatically delete backups older than 30 days to manage disk space.

## Database Monitoring and Maintenance

### Performance Optimization

To optimize database performance with VACUUM ANALYZE:

```bash
./db-utils.sh --vacuum
```

This cleans up deleted records and updates statistics used by the query planner. It's recommended to run this:
- After large database operations
- When you notice performance degradation
- On a weekly basis for maintenance

### Monitoring Database Size

To check the database size and table sizes:

```bash
./db-utils.sh --query
```

Then enter:
```sql
SELECT pg_size_pretty(pg_database_size('postgres')) AS database_size;
```

To see the size of individual tables:
```sql
SELECT table_name, pg_size_pretty(pg_total_relation_size('"' || table_name || '"')) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY pg_total_relation_size('"' || table_name || '"') DESC;
```

## Troubleshooting Common Issues

### Database Container Not Starting

If the database container isn't starting:

1. Check Docker logs:
   ```bash
   docker logs capstone-project-db-1
   ```

2. Verify the environment variables in `.env`:
   ```bash
   cat .env | grep DB_PASSWORD
   ```

3. Check disk space:
   ```bash
   df -h
   ```

### Connection Refused Errors

If your application can't connect to the database:

1. Verify the database container is running:
   ```bash
   docker ps | grep db
   ```

2. Check the DATABASE_URL in your application's environment:
   ```bash
   cat .env | grep DATABASE_URL
   ```

3. Make sure the database URL is correctly pointing to the Docker service name:
   ```
   postgresql://postgres:postgres_password@db:5432/postgres
   ```

### Schema Migration Issues

If you're having problems with Prisma migrations:

1. Check Prisma migration logs:
   ```bash
   docker-compose -f docker-compose.prod.yml exec webapp npx prisma migrate status
   ```

2. Reset the database (warning: this deletes all data):
   ```bash
   docker-compose -f docker-compose.prod.yml exec webapp npx prisma migrate reset --force
   ```

## Advanced Usage

### Importing External Data

To import data from an external SQL file:

1. Copy the SQL file to the EC2 instance:
   ```bash
   scp -i your-key.pem data.sql ubuntu@your-ec2-ip:~/capstone-project/
   ```

2. Import the data:
   ```bash
   cat data.sql | docker exec -i $(docker ps -q --filter name=capstone-project-db) psql -U postgres
   ```

### Moving Database to Another Server

To move your database to a new server:

1. Create a backup on the current server:
   ```bash
   ./db-utils.sh --backup
   ```

2. Copy the backup file to the new server:
   ```bash
   scp -i your-key.pem db_backups/postgres_backup_*.gz ubuntu@new-server-ip:~/capstone-project/db_backups/
   ```

3. On the new server, restore from the backup:
   ```bash
   ./db-utils.sh --restore
   ```

## Security Best Practices

1. Use strong, unique passwords for your database
2. Regularly update your database password
3. Back up your database frequently
4. Limit direct access to your database (use the application APIs instead)
5. Monitor unusual access patterns or query performance issues

---

For more information on PostgreSQL, visit the [official PostgreSQL documentation](https://www.postgresql.org/docs/).

