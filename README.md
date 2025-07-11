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
- **Backend API**: http://localhost:3002 (npm run dev) - *Puerto cambiado para evitar conflictos*
- **Frontend App**: http://localhost:3000 (npm run dev)
- **Smart Contract**: Desplegado en Solana Devnet

## 📁 Structure
```
pfmrust/
├── voting-system/     # Solana smart contracts (Anchor) ✅ DESPLEGADO
├── backend/           # API + Event listeners + Database ✅ FUNCIONANDO  
├── frontend/          # React web application ✅ INTEGRADO CON BLOCKCHAIN
├── scripts/           # Automation and utilities
└── docs/              # Documentation
```

## 🎯 Features
- ✅ **Smart Contract Desplegado**: Programa Anchor funcionando en Solana
- ✅ **Creación de Comunidades**: Integración frontend-blockchain completa
- ✅ **Sistema de Votaciones**: Creación y gestión de votaciones descentralizadas
- ✅ **Multi-role governance**: Admin, Moderator, User roles
- ✅ **Quorum configurable**: Validación de participación mínima
- ✅ **Gamificación**: Sistema de reputación y niveles
- ✅ **Categorías**: Organización por temas
- ✅ **Arquitectura híbrida**: Blockchain + database
- ✅ **Serialización manual**: Solución a problemas de compatibilidad Anchor

## 📊 Progress
**Current Phase**: 2.3 - Integración Frontend-Blockchain ✅  
**Status**: Smart contract desplegado y funcional  
**Program ID**: `98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z`  
**Next**: Optimización y testing avanzado

## 🔧 Problemas Técnicos Resueltos

### Integración Frontend-Blockchain
- ✅ **Error `InstructionFallbackNotFound`**: Corregidos discriminadores de instrucciones
- ✅ **Incompatibilidad Anchor**: Implementada serialización manual de datos
- ✅ **Deserialización de parámetros**: Alineados tipos entre frontend y smart contract
- ✅ **Validación de quorum**: Implementadas validaciones de rango (1-100)
- ✅ **Gestión de PDAs**: Correcta derivación de Program Derived Addresses
- ✅ **Conflictos de puertos**: Backend movido al puerto 3002

### Arquitectura de Datos
- ✅ **IDL sincronizado**: Verificado contra smart contract desplegado
- ✅ **Tipos TypeScript**: Interfaces alineadas con estructuras Rust
- ✅ **Manejo de errores**: Implementado logging detallado para debugging

## 🔗 Links
- [Business Plan](./business.md)
- [Roadmap](./roadmap.md) 
- [Architecture](./database-architecture.md)
- [Project Structure](./project-structure.md)

## 📞 Contact
**Proyecto Final de Máster** - CodeCrypto Academy  
**Developer**: Sergi Mías Martínez
