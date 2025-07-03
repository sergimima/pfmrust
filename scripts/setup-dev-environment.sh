#!/bin/bash

echo "🚀 Setting up Solana Voting System Development Environment"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "1. Checking prerequisites..."

# Check Rust
if command_exists rustc; then
    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    print_status "Rust $RUST_VERSION found"
else
    print_error "Rust not found. Please install from https://rustup.rs/"
    exit 1
fi

# Check Solana CLI
if command_exists solana; then
    SOLANA_VERSION=$(solana --version | cut -d' ' -f2)
    print_status "Solana CLI $SOLANA_VERSION found"
else
    print_error "Solana CLI not found. Please install from https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Check Anchor
if command_exists anchor; then
    ANCHOR_VERSION=$(anchor --version | cut -d' ' -f3)
    print_status "Anchor $ANCHOR_VERSION found"
else
    print_error "Anchor not found. Please install with: npm install -g @project-serum/anchor-cli"
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION found"
else
    print_error "Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

# Check Docker
if command_exists docker; then
    print_status "Docker found"
else
    print_warning "Docker not found. You'll need to setup PostgreSQL and Redis manually"
fi

echo ""
echo "2. Configuring Solana environment..."

# Set Solana to devnet
solana config set --url devnet
print_status "Solana set to devnet"

# Generate keypair if it doesn't exist
if [ ! -f ~/.config/solana/id.json ]; then
    solana-keygen new --no-bip39-passphrase
    print_status "Generated new Solana keypair"
else
    print_status "Solana keypair already exists"
fi

# Request airdrop
echo "Requesting SOL airdrop for development..."
solana airdrop 2
print_status "Airdrop completed"

echo ""
echo "3. Setting up project structure..."

# Initialize Anchor project if not exists
if [ ! -f "program/Anchor.toml" ]; then
    cd program
    anchor init voting-system --no-git
    cd ..
    print_status "Anchor project initialized"
else
    print_status "Anchor project already exists"
fi

# Setup backend dependencies
if [ ! -f "backend/package.json" ]; then
    cd backend
    npm init -y
    npm install express @prisma/client prisma redis cors helmet dotenv
    npm install --save-dev typescript @types/node @types/express nodemon ts-node
    cd ..
    print_status "Backend dependencies installed"
else
    print_status "Backend already setup"
fi

# Copy environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_status "Environment file created"
else
    print_status "Environment file already exists"
fi

echo ""
echo "4. Docker setup (PostgreSQL + Redis)..."

if command_exists docker; then
    # Create docker-compose.yml for backend
    cat > backend/docker-compose.yml << 'EOL'
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: voting_system
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOL

    print_status "Docker Compose file created"
    print_warning "Run 'cd backend && docker-compose up -d' to start database services"
else
    print_warning "Skipping Docker setup - not installed"
fi

echo ""
echo "=========================================================="
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. cd backend && docker-compose up -d    # Start database services"  
echo "2. cd program && anchor build            # Build smart contracts"
echo "3. cd frontend && npm install            # Setup frontend"
echo "4. Follow the roadmap for development    # See roadmap.md"
echo ""
echo "Happy coding! 🚀"
