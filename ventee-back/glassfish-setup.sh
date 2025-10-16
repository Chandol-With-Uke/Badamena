#!/bin/bash
set -e

echo "Starting GlassFish configuration script..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready at ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}"; do
  echo >&2 "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo >&2 "PostgreSQL is up - continuing configuration."

# Start GlassFish domain temporarily for configuration
echo "Starting GlassFish domain for configuration..."
asadmin start-domain domain1 || echo "GlassFish domain already running."

# Wait for GlassFish to be ready for asadmin commands
# A simple sleep is often sufficient for a fresh start,
# but a loop checking `asadmin list-domains` or a known resource would be more robust.
sleep 10

# Configuration for the JDBC Connection Pool
# The `|| true` is used to prevent the script from exiting if the resource already exists,
# which can happen if the container is restarted but the volume persists.
echo "Configuring JDBC Connection Pool 'VenteeConnectionPool'..."
asadmin create-jdbc-connection-pool \
  --datasourceclassname org.postgresql.ds.PGSimpleDataSource \
  --restype javax.sql.DataSource \
  --property User="${DB_USER}":Password="${DB_PASSWORD}":DatabaseName="${DB_NAME}":ServerName="${DB_HOST}":PortNumber="${DB_PORT}":URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  VenteeConnectionPool || true # Allow command to fail if pool exists

# Configuration for the JDBC Resource
echo "Configuring JDBC Resource 'jdbc/venteeDS'..."
asadmin create-jdbc-resource \
  --connectionpoolid VenteeConnectionPool \
  jdbc/venteeDS || true # Allow command to fail if resource exists

# Setting a GlassFish system property for Redis URI
# This allows the application to retrieve the Redis URI via JNDI lookup or System.getProperty() if designed this way.
echo "Setting GlassFish system property for Redis URI..."
asadmin create-system-properties REDIS_URI="${REDIS_URI}" || true # Allow command to fail if property exists

echo "GlassFish configuration finished. Stopping domain to be restarted by main CMD."
asadmin stop-domain domain1 || echo "Domain already stopped or not running."

echo "GlassFish setup script completed."
