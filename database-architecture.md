# Arquitectura de Base de Datos Híbrida

## Decisión: Enfoque Híbrido Blockchain + PostgreSQL + Docker

### Justificación
- **Mejor UX**: Búsquedas rápidas, analytics ricos, navegación fluida
- **Escalabilidad**: Queries complejas sin sobrecargar Solana RPC
- **Costs optimizados**: Solo datos críticos on-chain
- **Flexibility**: Futuras features sin cambiar smart contracts
- **Desarrollo**: Docker para reproducibilidad, WSL2 para Anchor CLI

---

## Distribución de Datos

### 🔗 ON-CHAIN (Solana) - Source of Truth
```rust
// Datos inmutables y críticos para consenso
pub struct Community {
    pub id: u64,
    pub name: String,           // Máx 64 chars
    pub admin: Pubkey,
    pub moderators: Vec<Pubkey>,
    pub member_count: u64,
    pub voting_fee: u64,
    pub total_fees_collected: u64,
    pub created_at: i64,
}

pub struct Voting {
    pub id: u64,
    pub community_id: u64,
    pub title: String,          // Máx 128 chars
    pub options: [VotingOption; 4],
    pub creator: Pubkey,
    pub deadline: i64,
    pub quorum_config: QuorumConfig,
    pub vote_counts: [u64; 4],
    pub total_votes: u64,
    pub status: VotingStatus,
    pub voting_type: VotingType,
    pub created_at: i64,
}

pub struct Vote {
    pub voting_id: u64,
    pub user: Pubkey,
    pub option_index: u8,
    pub timestamp: i64,
    pub signature: [u8; 64],    // Para verificación
}

pub struct UserReputation {
    pub user: Pubkey,
    pub total_score: u64,
    pub voting_weight: u8,
    pub last_updated: i64,
}
```

### 💾 OFF-CHAIN (PostgreSQL) - Performance & Analytics

```sql
-- Metadatos extensos
CREATE TABLE communities_metadata (
    id BIGSERIAL PRIMARY KEY,
    solana_id BIGINT UNIQUE NOT NULL,
    description TEXT,
    rules TEXT,
    avatar_url VARCHAR(255),
    banner_url VARCHAR(255),
    website VARCHAR(255),
    social_links JSONB,
    tags VARCHAR(50)[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE votings_metadata (
    id BIGSERIAL PRIMARY KEY,
    solana_id BIGINT UNIQUE NOT NULL,
    community_solana_id BIGINT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    tags VARCHAR(50)[],
    creator_notes TEXT,
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cache de datos de Solana para performance
CREATE TABLE communities_cache (
    solana_id BIGINT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    admin_pubkey VARCHAR(44) NOT NULL,
    member_count INTEGER NOT NULL,
    voting_fee BIGINT NOT NULL,
    total_fees_collected BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced TIMESTAMP DEFAULT NOW()
);

CREATE TABLE votings_cache (
    solana_id BIGINT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    title VARCHAR(128) NOT NULL,
    creator_pubkey VARCHAR(44) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    total_votes INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    voting_type VARCHAR(20) NOT NULL,
    quorum_enabled BOOLEAN NOT NULL,
    quorum_threshold INTEGER,
    last_synced TIMESTAMP DEFAULT NOW()
);

-- Analytics y métricas
CREATE TABLE daily_stats (
    date DATE PRIMARY KEY,
    total_communities INTEGER,
    total_votings INTEGER,
    total_votes INTEGER,
    total_users INTEGER,
    fees_collected BIGINT,
    active_users INTEGER
);

CREATE TABLE community_analytics (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL,
    date DATE NOT NULL,
    daily_votes INTEGER DEFAULT 0,
    daily_new_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    trending_categories JSONB,
    engagement_score DECIMAL(5,2),
    UNIQUE(community_id, date)
);

CREATE TABLE user_reputation_history (
    id BIGSERIAL PRIMARY KEY,
    user_pubkey VARCHAR(44) NOT NULL,
    date DATE NOT NULL,
    participation_points INTEGER DEFAULT 0,
    creation_points INTEGER DEFAULT 0,
    accuracy_points INTEGER DEFAULT 0,
    trust_points INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    rank_global INTEGER,
    rank_communities JSONB, -- {community_id: rank}
    UNIQUE(user_pubkey, date)
);

-- Búsquedas y filtros
CREATE TABLE voting_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color
    icon VARCHAR(50),
    parent_category_id INTEGER REFERENCES voting_categories(id)
);

-- Notificaciones
CREATE TABLE user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_pubkey VARCHAR(44) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'new_voting', 'voting_ended', 'reward_earned'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB, -- Datos específicos del tipo
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_votings_community ON votings_cache(community_id);
CREATE INDEX idx_votings_deadline ON votings_cache(deadline);
CREATE INDEX idx_votings_status ON votings_cache(status);
CREATE INDEX idx_votings_metadata_category ON votings_metadata(category);
CREATE INDEX idx_votings_metadata_tags ON votings_metadata USING GIN(tags);
CREATE INDEX idx_user_reputation_date ON user_reputation_history(date);
CREATE INDEX idx_user_notifications_user ON user_notifications(user_pubkey);
```

---

## Arquitectura del Backend

### Configuración Docker (YA IMPLEMENTADO)
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: voting_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
  
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  
  solana-dev:
    image: solanalabs/solana:stable
    ports: ["8899:8899"]
    command: solana-test-validator
  
  backend:
    build: ./backend
    ports: ["3001:3001"]
    depends_on: [postgres, redis, solana-dev]
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/voting_system
      REDIS_URL: redis://redis:6379
      SOLANA_RPC_URL: http://solana-dev:8899
```

### Estructura de Carpetas
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Configuración PostgreSQL
│   │   ├── solana.ts          # Configuración Solana RPC
│   │   └── redis.ts           # Cache configuration
│   ├── listeners/             # Event listeners de Solana
│   │   ├── index.ts
│   │   ├── community-listener.ts
│   │   ├── voting-listener.ts
│   │   └── reputation-listener.ts
│   ├── models/                # Modelos de PostgreSQL
│   │   ├── Community.ts
│   │   ├── Voting.ts
│   │   ├── User.ts
│   │   └── Analytics.ts
│   ├── services/              # Lógica de negocio
│   │   ├── SolanaService.ts   # Interacción con program
│   │   ├── AnalyticsService.ts
│   │   ├── NotificationService.ts
│   │   └── CacheService.ts
│   ├── api/                   # REST API
│   │   ├── routes/
│   │   │   ├── communities.ts
│   │   │   ├── votings.ts
│   │   │   ├── users.ts
│   │   │   ├── analytics.ts
│   │   │   └── search.ts
│   │   ├── controllers/
│   │   └── middleware/
│   ├── jobs/                  # Tareas programadas
│   │   ├── sync-blockchain.ts
│   │   ├── calculate-rewards.ts
│   │   └── update-rankings.ts
│   └── utils/
├── migrations/                # Migraciones de BD
├── seeds/                     # Datos iniciales
├── tests/
├── docker-compose.yml
├── package.json
└── README.md
```

### Configuración de Conexiones
```typescript
// src/config/database.ts
export const dbConfig = {
  host: process.env.NODE_ENV === 'production' ? 'prod-host' : 'localhost',
  port: 5432,
  database: 'voting_system',
  user: 'postgres',
  password: 'password'
};

// src/config/solana.ts  
export const solanaConfig = {
  rpcUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.mainnet-beta.solana.com'
    : 'http://localhost:8899',  // Docker service
  programId: 'GvTNG1qFxcJV5aJTsJQYBqKvzqwrNrKz8BF9MF8vCcaB'
};

// src/config/redis.ts
export const redisConfig = {
  host: 'localhost',
  port: 6379,
  db: 0
};
```
### Stack Tecnológico del Backend
```json
{
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "@project-serum/anchor": "^0.29.0",
    "express": "^4.18.2",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "redis": "^4.6.10",
    "bull": "^4.12.0", // Job queues
    "node-cron": "^3.0.3", // Cron jobs
    "ws": "^8.14.2", // WebSockets para real-time
    "zod": "^3.22.4", // Validaciones
    "helmet": "^7.1.0", // Seguridad
    "cors": "^2.8.5"
  }
}
```

---

## Comandos de Desarrollo

### Iniciar Entorno (Docker)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f postgres
docker-compose logs -f backend
```

### Smart Contracts (WSL2)
```bash
# Cambiar a WSL2
wsl

# Navegar al proyecto
cd /mnt/c/Users/seku_/Documents/BLOCKCHAIN_BOOTCAMP/pfmrust/voting-system

# Deploy program
anchor build
anchor deploy --provider.cluster localnet
```

### Backend Development
```bash
# En Windows
cd backend
npm run dev  # Conecta automáticamente a Docker services

# Migraciones
npx prisma migrate dev
npx prisma generate
```

---

## Flujo de Datos Detallado

### 1. Escritura (Usuario → Blockchain)
```
1. Usuario: "Crear votación"
2. Frontend → Solana Program (create_voting)
3. Blockchain emite evento
4. Listener detecta evento
5. Backend actualiza PostgreSQL
6. WebSocket notifica a usuarios conectados
```

### 2. Lectura (Performance optimizada)
```
1. Usuario: "Ver votaciones de Gaming"
2. Frontend → Backend API
3. PostgreSQL query con JOIN y filtros
4. Respuesta inmediata (<100ms)
5. Cache en Redis para siguientes requests
```

### 3. Analytics (Tiempo real)
```
1. Job cada 5 minutos: sincronizar datos críticos
2. Job cada hora: calcular métricas
3. Job diario: generar reportes y rankings
4. Job semanal: distribuir recompensas
```

---

## Sincronización Blockchain ↔ Database

### Event Listeners
```typescript
// Ejemplo de listener
class VotingListener {
  async handleVotingCreated(event: VotingCreatedEvent) {
    // 1. Guardar en cache
    await this.cacheService.updateVoting(event.voting);
    
    // 2. Guardar metadatos si no existen
    await this.votingService.createMetadata(event.voting.id);
    
    // 3. Actualizar analytics
    await this.analyticsService.incrementVotingCount(event.voting.community_id);
    
    // 4. Notificar usuarios suscritos
    await this.notificationService.notifyNewVoting(event.voting);
  }
}
```

### Estrategia de Reconciliación
- **Sync incremental**: Solo cambios desde último sync
- **Health checks**: Verificar consistencia periódicamente  
- **Rollback**: Revertir si hay inconsistencias
- **Monitoring**: Alertas si sync falla

---

## APIs que Expondremos

### Búsquedas y Filtros
```
GET /api/votings?category=gaming&status=active&community=123
GET /api/search?q=bitcoin&type=votings
GET /api/trending?period=24h
```

### Analytics
```
GET /api/analytics/community/123
GET /api/leaderboard/global?period=week
GET /api/user/reputation/history
```

### Real-time
```
WebSocket: /ws/voting/123 (resultados en vivo)
WebSocket: /ws/notifications (notificaciones)
```

---

## Beneficios de esta Arquitectura

### Para Usuarios
✅ **Navegación instantánea** entre votaciones  
✅ **Búsquedas potentes** con filtros complejos  
✅ **Analytics ricos** con gráficos interactivos  
✅ **Notificaciones** en tiempo real  
✅ **Historial completo** de actividad  

### Para Desarrolladores
✅ **Escalabilidad** sin límites de Solana RPC  
✅ **Flexibilidad** para nuevas features  
✅ **Debugging** más fácil con logs centralizados  
✅ **Testing** simplificado con datos locales  

### Para el Negocio
✅ **Analytics profundos** para tomar decisiones  
✅ **Menor costo** en Solana transactions  
✅ **Better SEO** con server-side rendering  
✅ **Escalabilidad** para miles de usuarios  

¿Te parece bien esta arquitectura híbrida? ¿Alguna parte que quieras modificar o profundizar?
