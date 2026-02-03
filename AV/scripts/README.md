# AURUM VAULT Scripts

This directory contains utility scripts for managing the AURUM VAULT environment, including deployment, local development, and database management.

## 🚀 Core Scripts

### Startup & Shutdown

- **`start-all.sh`**: The master startup script. Starts all Docker services and ngrok tunnels.
- **`stop-all.sh`**: Stops all running AURUM VAULT related containers and ngrok processes.
- **`dev-all.sh`**: Starts services in development mode without Docker (runs `npm run dev` in each directory).

### ngrok Management

- **`start-ngrok.sh`**: Starts 3 ngrok tunnels (Backend, Admin, Portal) processing the configuration in `ngrok.yml`.
- **`stop-ngrok.sh`**: Kills all ngrok processes.
- **`get-ngrok-urls.sh`**: Queries the local ngrok API to display the currently active public URLs.

## 💾 Database Management

- **`backup-database.sh`**: Creates a compressed dump of the PostgreSQL database.
- **`restore-database.sh`**: Restores the database from a given backup file.
- **`backup.sh`**: Generic backup utility.

## 🛠️ Maintenance & Refactoring

- **`detach-frontend.sh`**: (Validation) Used during the frontend detachment phase.
- **`refactor_from_archive.sh`**: (Reference) Used during code restoration.
- **`deploy-production.sh`**: Deployment helper script.

## 📋 Usage Examples

```bash
# Start everything locally
./scripts/start-all.sh

# Get public URLs for testing
./scripts/get-ngrok-urls.sh

# Stop everything
./scripts/stop-all.sh

# Backup database
./scripts/backup-database.sh
```
