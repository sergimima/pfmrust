# Estructura del Proyecto - Sistema de Gestión de Comunidades Solana

## Estructura de Directorios Propuesta

```
pfmrust/
├── README.md
├── business.md                    # Business plan completo
├── roadmap.md                     # Roadmap de desarrollo
├── database-architecture.md       # Arquitectura híbrida detallada
├── project-structure.md           # Este archivo
├── docs/                          # Documentación del proyecto
│   ├── architecture.md            # Documentación de arquitectura
│   ├── api-reference.md           # Referencia de APIs
│   ├── deployment.md              # Guía de despliegue
│   └── user-guides/               # Guías de usuario
│       ├── admin-guide.md
│       └── user-guide.md
├── voting-system/                 # Smart contracts (Anchor) - YA CREADO
│   ├── Anchor.toml                # Configuración de Anchor
│   ├── Cargo.toml                 # Dependencias de Rust
│   ├── programs/
│   │   └── voting-system/
│   │       ├── Cargo.toml
│   │       └── src/
│   │           ├── lib.rs         # Entry point del programa
│   │           ├── instructions/  # Instrucciones del programa
│   │           │   ├── mod.rs
│   │           │   ├── create_community.rs
│   │           │   ├── join_community.rs
│   │           │   ├── create_voting.rs
│   │           │   ├── cast_vote.rs
│   │           │   ├── manage_roles.rs
│   │           │   ├── reputation.rs
│   │           │   └── rewards.rs
│   │           ├── state/         # Definición de accounts
│   │           │   ├── mod.rs
│   │           │   ├── community.rs
│   │           │   ├── voting.rs
│   │           │   ├── user.rs
│   │           │   ├── reputation.rs
│   │           │   └── leaderboard.rs
│   │           ├── errors.rs      # Custom errors
│   │           └── utils.rs       # Utilidades comunes
│   ├── tests/                     # Tests de integración
│   │   ├── community-tests.ts
│   │   ├── voting-tests.ts
│   │   ├── reputation-tests.ts
│   │   └── integration-tests.ts
│   └── migrations/                # Scripts de deploy
│       └── deploy.ts
├── docker-compose.yml              # Servicios Docker (Solana, PostgreSQL, Redis)
├── backend/                       # API y servicios backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/                    # Esquema y migraciones de BD
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/                # Configuración (DB, Solana, Redis)
│   │   │   ├── database.ts
│   │   │   ├── solana.ts
│   │   │   └── redis.ts
│   │   ├── listeners/             # Event listeners de Solana
│   │   │   ├── index.ts
│   │   │   ├── community-listener.ts
│   │   │   ├── voting-listener.ts
│   │   │   └── reputation-listener.ts
│   │   ├── models/                # Modelos de PostgreSQL
│   │   │   ├── Community.ts
│   │   │   ├── Voting.ts
│   │   │   ├── User.ts
│   │   │   └── Analytics.ts
│   │   ├── services/              # Lógica de negocio
│   │   │   ├── SolanaService.ts
│   │   │   ├── AnalyticsService.ts
│   │   │   ├── NotificationService.ts
│   │   │   └── CacheService.ts
│   │   ├── api/                   # REST API
│   │   │   ├── routes/
│   │   │   │   ├── communities.ts
│   │   │   │   ├── votings.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── search.ts
│   │   │   ├── controllers/
│   │   │   └── middleware/
│   │   ├── jobs/                  # Tareas programadas
│   │   │   ├── sync-blockchain.ts
│   │   │   ├── calculate-rewards.ts
│   │   │   └── update-rankings.ts
│   │   └── utils/
│   ├── tests/                     # Tests del backend
│   └── docker-compose.yml         # PostgreSQL + Redis local
├── frontend/                      # Aplicación web
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   │   ├── common/            # Componentes comunes
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── WalletConnect.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── admin/             # Componentes para admins
│   │   │   │   ├── CommunityManager.tsx
│   │   │   │   ├── ModerationPanel.tsx
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   └── UserManagement.tsx
│   │   │   ├── user/              # Componentes para usuarios
│   │   │   │   ├── VotingList.tsx
│   │   │   │   ├── CreateVoting.tsx
│   │   │   │   ├── VotingCard.tsx
│   │   │   │   ├── UserProfile.tsx
│   │   │   │   └── Leaderboard.tsx
│   │   │   └── voting/            # Componentes de votación
│   │   │       ├── VotingForm.tsx
│   │   │       ├── VotingResults.tsx
│   │   │       ├── CategoryFilter.tsx
│   │   │       └── QuorumConfig.tsx
│   │   ├── pages/                 # Páginas Next.js
│   │   │   ├── _app.tsx
│   │   │   ├── _document.tsx
│   │   │   ├── index.tsx          # Landing page
│   │   │   ├── admin/             # Páginas de admin
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── communities.tsx
│   │   │   │   └── moderation.tsx
│   │   │   ├── user/              # Páginas de usuario
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── profile.tsx
│   │   │   │   └── leaderboard.tsx
│   │   │   └── voting/            # Páginas de votación
│   │   │       ├── [id].tsx       # Página individual de votación
│   │   │       ├── create.tsx     # Crear votación
│   │   │       └── category/
│   │   │           └── [slug].tsx # Votaciones por categoría
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useWallet.ts
│   │   │   ├── useProgram.ts
│   │   │   ├── useCommunity.ts
│   │   │   ├── useVoting.ts
│   │   │   ├── useReputation.ts
│   │   │   └── useLeaderboard.ts
│   │   ├── contexts/              # React contexts
│   │   │   ├── WalletContext.tsx
│   │   │   ├── ProgramContext.tsx
│   │   │   └── UserContext.tsx
│   │   ├── lib/                   # Utilidades y configuración
│   │   │   ├── solana.ts          # Configuración de Solana
│   │   │   ├── anchor-client.ts   # Cliente de Anchor
│   │   │   ├── constants.ts       # Constantes del proyecto
│   │   │   └── utils.ts           # Utilidades generales
│   │   ├── types/                 # Definiciones de tipos TypeScript
│   │   │   ├── program.ts         # Tipos del programa
│   │   │   ├── community.ts
│   │   │   ├── voting.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   └── styles/                # Estilos CSS
│   │       ├── globals.css
│   │       └── components.css
│   ├── public/                    # Assets públicos
│   │   ├── icons/
│   │   ├── images/
│   │   └── favicon.ico
│   └── tests/                     # Tests del frontend
│       ├── components/
│       ├── pages/
│       └── integration/
├── scripts/                       # Scripts de utilidad
│   ├── setup-devnet.sh           # Setup inicial de devnet
│   ├── deploy-program.sh          # Deploy del programa
│   ├── seed-data.ts               # Script para datos de prueba
│   └── monitor-performance.ts     # Monitoreo de performance
├── .env.example                   # Variables de entorno ejemplo
├── .gitignore                     # Git ignore
└── .env                           # Variables de entorno
```

## Configuración de Archivos Principales

### voting-system/Anchor.toml
```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
voting_system = "GvTNG1qFxcJV5aJTsJQYBqKvzqwrNrKz8BF9MF8vCcaB"

[programs.devnet]
voting_system = "GvTNG1qFxcJV5aJTsJQYBqKvzqwrNrKz8BF9MF8vCcaB"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### backend/package.json (dependencias principales)
```json
{
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "@project-serum/anchor": "^0.29.0",
    "express": "^4.18.2",
    "@prisma/client": "^5.6.0",
    "prisma": "^5.6.0",
    "redis": "^4.6.10",
    "bull": "^4.12.0",
    "node-cron": "^3.0.3",
    "ws": "^8.14.2",
    "zod": "^3.22.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### voting-system/programs/voting-system/Cargo.toml
```toml
[package]
name = "voting-system"
version = "0.1.0"
description = "Sistema de Gestión de Comunidades en Solana"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "voting_system"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
solana-program = "~1.16.0"
```

### frontend/package.json (dependencias principales)
```json
{
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "@project-serum/anchor": "^0.29.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.26",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "tailwindcss": "^3.3.0",
    "recharts": "^2.8.0",
    "@heroicons/react": "^2.0.0"
  }
}
```

## Convenciones de Naming

### Smart Contracts (Rust)
- **Functions**: `snake_case` (ej: `create_community`, `cast_vote`)
- **Structs**: `PascalCase` (ej: `Community`, `UserReputation`)
- **Enums**: `PascalCase` (ej: `VotingStatus`, `UserRole`)
- **Constants**: `SCREAMING_SNAKE_CASE` (ej: `VOTING_FEE`, `MAX_OPTIONS`)

### Frontend (TypeScript/React)
- **Components**: `PascalCase` (ej: `VotingCard`, `UserProfile`)
- **Hooks**: `camelCase` con prefijo "use" (ej: `useWallet`, `useCommunity`)
- **Types/Interfaces**: `PascalCase` (ej: `Community`, `VotingData`)
- **Functions**: `camelCase` (ej: `fetchCommunity`, `submitVote`)

### Files y Carpetas
- **Folders**: `kebab-case` (ej: `user-guides`, `voting-tests`)
- **Files**: `kebab-case` para scripts, `PascalCase` para componentes
- **Test files**: `nombre.test.ts` o `nombre-tests.ts`

## Flujo de Desarrollo

### 1. Setup Inicial (YA COMPLETADO)
```bash
# Servicios Docker
docker-compose up -d

# Verificar servicios
docker-compose ps

# Proyecto Anchor ya creado en voting-system/
# Frontend pendiente de crear
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint
```

### 2. Desarrollo de Smart Contracts (WSL2)
```bash
# Cambiar a WSL2 para comandos Anchor
wsl

# Navegar al proyecto
cd /mnt/c/Users/seku_/Documents/BLOCKCHAIN_BOOTCAMP/pfmrust/voting-system

# Comandos Anchor
anchor build
anchor test --skip-local-validator
anchor deploy --provider.cluster localnet
```

### 3. Desarrollo de Frontend
```bash
cd frontend
npm run dev
npm run build
npm run test
```

### 4. Testing Integral
```bash
# Tests de programa (WSL2)
wsl
cd /mnt/c/Users/seku_/Documents/BLOCKCHAIN_BOOTCAMP/pfmrust/voting-system
anchor test --skip-local-validator

# Tests de frontend
cd frontend && npm test

# Tests de integración
./scripts/integration-tests.sh
```

## Git Workflow

### Branches
- `main`: Código de producción
- `develop`: Desarrollo activo
- `feature/nombre-feature`: Features específicas
- `hotfix/descripcion`: Fixes urgentes

### Commits
```
feat: añadir sistema de reputación
fix: resolver bug en votación
docs: actualizar documentación de API
test: añadir tests para comunidades
refactor: optimizar queries de leaderboard
```

¿Te parece bien esta estructura? ¿Quieres que modifiquemos alguna parte antes de empezar a crear los directorios?
