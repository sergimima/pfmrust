# Sistema de Gestión de Comunidades en Solana

## 📋 Descripción
Sistema descentralizado de gestión de comunidades con votaciones, gamificación y arquitectura híbrida blockchain + database.

## 🏗️ Arquitectura
- **Smart Contracts**: Solana + Rust + Anchor
- **Backend**: Node.js + Express + PostgreSQL + Redis  
- **Frontend**: React + Next.js + TypeScript

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** (Windows/Mac/Linux)
- **Git** for version control
- **VS Code** (recomendado) con extensión Docker

### Setup
```powershell
# Windows - Solo necesitas Docker Desktop para servicios
cd pfmrust

# 1. Levantar servicios de infraestructura
docker-compose up -d

# 2. Instalar dependencias del backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# 3. En otra terminal - Frontend
cd frontend
npm install
npm run dev

# 4. En otra terminal - Smart contracts (cuando empecemos)
cd program
anchor build
anchor test
```

### Services Running
Una vez ejecutado `docker-compose up -d`:
- **Solana Test Validator**: http://localhost:8899
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Adminer (DB Admin)**: http://localhost:8080

### Development Servers (Local)
- **Backend API**: http://localhost:3001 (npm run dev)
- **Frontend App**: http://localhost:3000 (npm run dev)

## 📁 Structure
```
pfmrust/
├── program/           # Solana smart contracts (Anchor)
├── backend/           # API + Event listeners + Database  
├── frontend/          # React web application
├── scripts/           # Automation and utilities
└── docs/              # Documentation
```

## 🎯 Features
- ✅ Multi-role governance (Admin, Moderator, User)
- ✅ Configurable quorum voting
- ✅ Gamification with reputation system
- ✅ Categories and advanced search
- ✅ Real-time analytics dashboard
- ✅ Hybrid blockchain + database architecture

## 📊 Progress
**Current Phase**: 1.1 - Setup del Entorno de Desarrollo  
**Next**: Smart contracts architecture

## 🔗 Links
- [Business Plan](./business.md)
- [Roadmap](./roadmap.md) 
- [Architecture](./database-architecture.md)
- [Project Structure](./project-structure.md)

## 📞 Contact
**Proyecto Final de Máster** - CodeCrypto Academy  
**Developer**: Sergi Mías Martínez
