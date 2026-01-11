# Docker Setup untuk Investment Plant

Panduan untuk menjalankan aplikasi menggunakan Docker dengan nama `investmentplant`.

## Prerequisites

- Docker Desktop atau Docker Engine terinstall
- Docker Compose terinstall (biasanya sudah included dengan Docker Desktop)

## Quick Start

1. **Build dan jalankan dengan Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

2. **Akses aplikasi:**
   - Next.js App: http://localhost:3000
   - PocketBase Admin: http://localhost:8090/_/

3. **Setup PocketBase:**
   - Buka http://localhost:8090/_/
   - Buat admin account pertama kali
   - Buat collection `investments` dengan fields:
     - `date` (Text, Required)
     - `btcAmount` (Number, Required, Min: 0)
     - `btcPrice` (Number, Required, Min: 0)
     - `btcQuantity` (Number, Required, Min: 0)
   - Kosongkan semua API Rules untuk development

4. **Stop aplikasi:**
   ```bash
   docker-compose down
   ```

## Docker Commands

### Build image:
```bash
docker-compose build
```

### Start containers:
```bash
docker-compose up -d
```

### View logs:
```bash
# Semua services
docker-compose logs -f

# Hanya Next.js app
docker-compose logs -f investmentplant

# Hanya PocketBase
docker-compose logs -f pocketbase
```

### Stop containers:
```bash
docker-compose stop
```

### Stop dan hapus containers:
```bash
docker-compose down
```

### Stop, hapus containers dan volumes:
```bash
docker-compose down -v
```

### Rebuild setelah perubahan:
```bash
docker-compose up -d --build
```

## Environment Variables

Buat file `.env` di root project (opsional, untuk custom configuration):

```env
# PocketBase Encryption Key (generate random string)
PB_ENCRYPTION_KEY=your-secure-encryption-key-here

# Custom ports (optional)
# NEXT_PORT=3000
# POCKETBASE_PORT=8090
```

## Data Persistence

- **PocketBase data:** Tersimpan di Docker volume `pocketbase_data`
- **PocketBase migrations:** Tersimpan di Docker volume `pocketbase_migrations`

Data akan tetap ada meskipun container dihapus, kecuali jika menggunakan `docker-compose down -v`.

## Backup Data

### Backup PocketBase data:
```bash
docker run --rm -v investmentplan_pocketbase_data:/data -v $(pwd):/backup alpine tar czf /backup/pocketbase-backup.tar.gz -C /data .
```

### Restore PocketBase data:
```bash
docker run --rm -v investmentplan_pocketbase_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/pocketbase-backup.tar.gz"
```

## Troubleshooting

### Port sudah digunakan:
Jika port 3000 atau 8090 sudah digunakan, edit `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Gunakan port 3001 untuk Next.js
  - "8091:8090"  # Gunakan port 8091 untuk PocketBase
```

### Container tidak bisa connect ke PocketBase:
- Pastikan network `investmentplan-network` sudah dibuat
- Cek logs: `docker-compose logs pocketbase`
- Pastikan PocketBase sudah running: `docker-compose ps`

### Build error:
```bash
# Clear Docker cache dan rebuild
docker-compose build --no-cache
```

### Next.js build error:
- Pastikan semua dependencies terinstall dengan benar
- Cek `package.json` dan `pnpm-lock.yaml`

## Production Deployment

Untuk production, pertimbangkan:

1. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Gunakan secure `PB_ENCRYPTION_KEY`
   - Set proper `NEXT_PUBLIC_POCKETBASE_URL`

2. **Security:**
   - Jangan expose PocketBase port ke public
   - Gunakan reverse proxy (nginx/traefik)
   - Enable PocketBase authentication rules

3. **Monitoring:**
   - Setup health checks
   - Monitor container logs
   - Setup backup schedule

4. **Scaling:**
   - Gunakan Docker Swarm atau Kubernetes untuk scaling
   - Setup load balancer untuk Next.js app

## Docker Image Registry

Untuk push ke Docker Hub atau registry lain:

```bash
# Build image
docker build -t investmentplant:latest .

# Tag untuk registry
docker tag investmentplant:latest yourusername/investmentplant:latest

# Login ke Docker Hub
docker login

# Push image
docker push yourusername/investmentplant:latest
```

## Cleanup

### Hapus semua (containers, volumes, images):
```bash
docker-compose down -v --rmi all
```

### Hapus hanya containers:
```bash
docker-compose down
```

### Hapus unused resources:
```bash
docker system prune -a
```

