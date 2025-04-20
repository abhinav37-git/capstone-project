#!/bin/bash

# ========================================================
# Database Management Utilities for PostgreSQL in Docker
# ========================================================

# Exit on error
set -e

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Color formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Docker compose file
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
# Database service name in docker-compose
DB_SERVICE="db"
# Backup directory
BACKUP_DIR="$SCRIPT_DIR/db_backups"
# Container name prefix (we'll use docker ps to get the actual container name)
CONTAINER_PREFIX="capstone-project-db"

# Load environment variables if .env file exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
fi

# ========================================================
# Helper functions
# ========================================================

print_header() {
    echo -e "\n${BOLD}${GREEN}==== $1 ====${NC}\n"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

get_db_container() {
    # Get the actual container name for the database
    DB_CONTAINER=$(docker ps --filter "name=${CONTAINER_PREFIX}" --format "{{.Names}}" | head -n 1)
    
    if [ -z "$DB_CONTAINER" ]; then
        print_error "Database container not found. Is it running?"
        exit 1
    fi
    
    echo $DB_CONTAINER
}

# ========================================================
# Database Health Check Functions
# ========================================================

check_db_health() {
    print_header "Database Health Check"
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Running health check on database container: $DB_CONTAINER"
    
    # Check if container is running
    CONTAINER_STATUS=$(docker inspect --format="{{.State.Status}}" $DB_CONTAINER)
    echo "Container status: $CONTAINER_STATUS"
    
    if [ "$CONTAINER_STATUS" != "running" ]; then
        print_error "Database container is not running"
        return 1
    fi
    
    # Check PostgreSQL service using pg_isready
    echo "Checking PostgreSQL service..."
    if docker exec $DB_CONTAINER pg_isready -U postgres; then
        print_success "PostgreSQL service is running and accepting connections"
    else
        print_error "PostgreSQL service is not responding"
        return 1
    fi
    
    # Get basic database stats
    echo -e "\nDatabase statistics:"
    docker exec $DB_CONTAINER psql -U postgres -c "SELECT count(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';"
    
    return 0
}

check_db_connection() {
    print_header "Database Connection Verification"
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Verifying connection to PostgreSQL..."
    if docker exec $DB_CONTAINER psql -U postgres -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Successfully connected to PostgreSQL"
        echo "PostgreSQL version:"
        docker exec $DB_CONTAINER psql -U postgres -c "SELECT version();"
    else
        print_error "Failed to connect to PostgreSQL"
        return 1
    fi
    
    return 0
}

view_db_logs() {
    print_header "Database Logs"
    
    # Use docker-compose to view logs
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=100 $DB_SERVICE
    else
        DB_CONTAINER=$(get_db_container)
        docker logs --tail=100 $DB_CONTAINER
    fi
}

# ========================================================
# Backup and Restore Functions
# ========================================================

backup_database() {
    print_header "Database Backup"
    
    # Create backup directory if it doesn't exist
    mkdir -p $BACKUP_DIR
    
    # Format date for filename
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Creating backup of PostgreSQL database..."
    echo "Backup will be stored at: $BACKUP_FILE"
    
    # Perform the backup
    docker exec $DB_CONTAINER pg_dump -U postgres postgres > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        # Compress the backup
        gzip $BACKUP_FILE
        print_success "Database backup completed: ${BACKUP_FILE}.gz"
        
        # List recent backups
        echo -e "\nRecent backups:"
        ls -lht $BACKUP_DIR | head -n 5
    else
        print_error "Database backup failed"
        return 1
    fi
    
    return 0
}

restore_database() {
    print_header "Database Restore"
    
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Backup directory does not exist: $BACKUP_DIR"
        return 1
    fi
    
    # List available backups
    echo "Available backups:"
    ls -lht $BACKUP_DIR
    
    # Prompt for backup file
    read -p "Enter the backup filename to restore (or press ENTER to cancel): " BACKUP_FILE
    
    if [ -z "$BACKUP_FILE" ]; then
        echo "Restore cancelled."
        return 0
    fi
    
    FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
    
    if [ ! -f "$FULL_BACKUP_PATH" ]; then
        print_error "Backup file not found: $FULL_BACKUP_PATH"
        return 1
    fi
    
    # Ask for confirmation
    read -p "WARNING: This will overwrite the current database. Are you sure? (y/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        echo "Restore cancelled."
        return 0
    fi
    
    DB_CONTAINER=$(get_db_container)
    
    # Check if file is gzipped
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        echo "Restoring from compressed backup..."
        gunzip -c "$FULL_BACKUP_PATH" | docker exec -i $DB_CONTAINER psql -U postgres postgres
    else
        echo "Restoring from backup..."
        cat "$FULL_BACKUP_PATH" | docker exec -i $DB_CONTAINER psql -U postgres postgres
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Database restore completed successfully"
    else
        print_error "Database restore failed"
        return 1
    fi
    
    return 0
}

# ========================================================
# Database Management Functions
# ========================================================

list_tables() {
    print_header "Database Tables"
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Listing tables in the database..."
    docker exec $DB_CONTAINER psql -U postgres -c "\dt"
}

run_query() {
    print_header "Run SQL Query"
    
    # Prompt for SQL query
    read -p "Enter SQL query (or press ENTER to cancel): " SQL_QUERY
    
    if [ -z "$SQL_QUERY" ]; then
        echo "Query cancelled."
        return 0
    fi
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Executing query..."
    docker exec -i $DB_CONTAINER psql -U postgres -c "$SQL_QUERY"
    
    return $?
}

execute_psql() {
    print_header "PostgreSQL Interactive Session"
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Starting interactive PostgreSQL session..."
    echo "Type '\q' to exit when done."
    
    docker exec -it $DB_CONTAINER psql -U postgres
}

# ========================================================
# Database Maintenance Functions
# ========================================================

analyze_vacuum() {
    print_header "Database Maintenance: VACUUM ANALYZE"
    
    DB_CONTAINER=$(get_db_container)
    
    echo "Running VACUUM ANALYZE to optimize database..."
    docker exec $DB_CONTAINER psql -U postgres -c "VACUUM ANALYZE;"
    
    if [ $? -eq 0 ]; then
        print_success "Database maintenance completed successfully"
    else
        print_error "Database maintenance failed"
        return 1
    fi
    
    return 0
}

schedule_backup() {
    print_header "Schedule Regular Backups"
    
    echo "This will add a cron job to schedule regular database backups."
    echo "Available schedules:"
    echo "1) Daily at midnight"
    echo "2) Weekly on Sunday at midnight"
    echo "3) Custom schedule"
    
    read -p "Select a schedule (1-3): " SCHEDULE_OPTION
    
    CRON_SCHEDULE=""
    case $SCHEDULE_OPTION in
        1)
            CRON_SCHEDULE="0 0 * * *"
            SCHEDULE_DESC="daily at midnight"
            ;;
        2)
            CRON_SCHEDULE="0 0 * * 0"
            SCHEDULE_DESC="weekly on Sunday at midnight"
            ;;
        3)
            read -p "Enter custom cron schedule (e.g., '0 0 * * *'): " CRON_SCHEDULE
            SCHEDULE_DESC="custom schedule: $CRON_SCHEDULE"
            ;;
        *)
            print_error "Invalid option"
            return 1
            ;;
    esac
    
    if [ -z "$CRON_SCHEDULE" ]; then
        print_error "No schedule selected"
        return 1
    fi
    
    # Create the backup script
    BACKUP_SCRIPT="$SCRIPT_DIR/auto_backup.sh"
    cat > $BACKUP_SCRIPT << EOL
#!/bin/bash
cd $SCRIPT_DIR
$SCRIPT_DIR/db-utils.sh --backup
find $BACKUP_DIR -name "postgres_backup_*.gz" -mtime +30 -delete
EOL
    
    chmod +x $BACKUP_SCRIPT
    
    # Add cron job
    (crontab -l 2>/dev/null || echo "") | grep -v "$BACKUP_SCRIPT" | { cat; echo "$CRON_SCHEDULE $BACKUP_SCRIPT"; } | crontab -
    
    if [ $? -eq 0 ]; then
        print_success "Backup scheduled $SCHEDULE_DESC"
        echo "Backups will be stored in: $BACKUP_DIR"
        echo "Backups older than 30 days will be automatically deleted"
    else
        print_error "Failed to schedule backup"
        return 1
    fi
    
    return 0
}

# ========================================================
# Main Menu
# ========================================================

show_menu() {
    print_header "PostgreSQL Database Management"
    
    echo "Available commands:"
    echo "1) Check database health"
    echo "2) Verify database connection"
    echo "3) View database logs"
    echo "4) Backup database"
    echo "5) Restore database from backup"
    echo "6) List database tables"
    echo "7) Run SQL query"
    echo "8) Open PostgreSQL interactive session"
    echo "9) Perform database maintenance (VACUUM ANALYZE)"
    echo "10) Schedule regular backups"
    echo "q) Quit"
    
    read -p "Enter choice: " MENU_OPTION
    
    case $MENU_OPTION in
        1)
            check_db_health
            ;;
        2)
            check_db_connection
            ;;
        3)
            view_db_logs
            ;;
        4)
            backup_database
            ;;
        5)
            restore_database
            ;;
        6)
            list_tables
            ;;
        7)
            run_query
            ;;
        8)
            execute_psql
            ;;
        9)
            analyze_vacuum
            ;;
        10)
            schedule_backup
            ;;
        q|Q)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    # Return to menu after each command
    echo
    read -p "Press Enter to return to menu..."
    show_menu
}

# ========================================================
# Command Line Arguments
# ========================================================

# Parse command line arguments
case "$1" in
    --health|--check)
        check_db_health
        ;;
    --verify)
        check_db_connection
        ;;
    --logs)
        view_db_logs
        ;;
    --backup)
        backup_database
        ;;
    --restore)
        restore_database
        ;;
    --tables)
        list_tables
        ;;
    --query)
        run_query
        ;;
    --psql)
        execute_psql
        ;;
    --vacuum)
        analyze_vacuum
        ;;
    --schedule)
        schedule_backup
        ;;
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo "Database management utilities for PostgreSQL in Docker."
        echo
        echo "Options:"
        echo "  --health, --check   Check database health"
        echo "  --verify            Verify database connection"
        echo "  --logs              View database logs"
        echo "  --backup            Backup database"
        echo "  --restore           Restore database from backup"
        echo "  --tables            List database tables"
        echo "  --query             Run SQL query"
        echo "  --psql              Open PostgreSQL interactive session"
        echo "  --vacuum            Perform database maintenance (VACUUM ANALYZE)"
        echo "  --schedule          Schedule regular backups"
        echo "  --help, -h          Show this help message"
        echo
        echo "Without options, an interactive menu will be displayed."
        exit 0
        ;;
    *)
        # If no arguments are provided, show interactive menu
        show_menu
        ;;
esac

exit 0

