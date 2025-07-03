# PowerShell Setup Script for Solana Voting System
# Run with: .\setup-dev-environment.ps1

Write-Host "🚀 Setting up Solana Voting System Development Environment" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to print colored output
function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

Write-Host "`n1. Checking prerequisites..." -ForegroundColor Cyan

# Check Rust
if (Test-Command "rustc") {
    $rustVersion = (rustc --version).Split(' ')[1]
    Write-Success "Rust $rustVersion found"
} else {
    Write-Error "Rust not found. Please install from https://rustup.rs/"
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Solana CLI
if (Test-Command "solana") {
    $solanaVersion = (solana --version).Split(' ')[1]
    Write-Success "Solana CLI $solanaVersion found"
} else {
    Write-Error "Solana CLI not found. Please install from https://docs.solana.com/cli/install-solana-cli-tools"
    Write-Host "For Windows, run: cmd /c 'curl https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs'"
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Anchor
if (Test-Command "anchor") {
    $anchorVersion = (anchor --version).Split(' ')[2]
    Write-Success "Anchor $anchorVersion found"
} else {
    Write-Error "Anchor not found. Please install with: npm install -g @project-serum/anchor-cli"
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion found"
} else {
    Write-Error "Node.js not found. Please install from https://nodejs.org/"
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Docker
if (Test-Command "docker") {
    Write-Success "Docker found"
    $dockerAvailable = $true
} else {
    Write-Warning "Docker not found. You'll need to setup PostgreSQL and Redis manually"
    $dockerAvailable = $false
}

Write-Host "`n2. Configuring Solana environment..." -ForegroundColor Cyan

# Set Solana to devnet
try {
    solana config set --url devnet
    Write-Success "Solana set to devnet"
} catch {
    Write-Error "Failed to configure Solana devnet"
}

# Check if keypair exists
$keypairPath = "$env:USERPROFILE\.config\solana\id.json"
if (-not (Test-Path $keypairPath)) {
    try {
        solana-keygen new --no-bip39-passphrase
        Write-Success "Generated new Solana keypair"
    } catch {
        Write-Error "Failed to generate keypair"
    }
} else {
    Write-Success "Solana keypair already exists"
}

# Request airdrop
Write-Host "Requesting SOL airdrop for development..."
try {
    solana airdrop 2
    Write-Success "Airdrop completed"
} catch {
    Write-Warning "Airdrop failed - you may need to try again later"
}

Write-Host "`n3. Setting up project structure..." -ForegroundColor Cyan

# Initialize Anchor project if not exists
if (-not (Test-Path "program\Anchor.toml")) {
    try {
        Set-Location program
        anchor init voting-system --no-git
        Set-Location ..
        Write-Success "Anchor project initialized"
    } catch {
        Write-Error "Failed to initialize Anchor project"
        Set-Location ..
    }
} else {
    Write-Success "Anchor project already exists"
}

# Setup backend dependencies
if (-not (Test-Path "backend\package.json")) {
    try {
        Set-Location backend
        npm init -y
        npm install express @prisma/client prisma redis cors helmet dotenv @solana/web3.js @project-serum/anchor
        npm install --save-dev typescript @types/node @types/express nodemon ts-node
        Set-Location ..
        Write-Success "Backend dependencies installed"
    } catch {
        Write-Error "Failed to install backend dependencies"
        Set-Location ..
    }
} else {
    Write-Success "Backend already setup"
}

# Copy environment file
if (-not (Test-Path ".env")) {
    try {
        Copy-Item ".env.example" ".env"
        Write-Success "Environment file created"
    } catch {
        Write-Error "Failed to create environment file"
    }
} else {
    Write-Success "Environment file already exists"
}

Write-Host "`n4. Docker setup (PostgreSQL + Redis)..." -ForegroundColor Cyan

if ($dockerAvailable) {
    # Create docker-compose.yml for backend
    $dockerComposeContent = @"
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
"@

    try {
        $dockerComposeContent | Out-File -FilePath "backend\docker-compose.yml" -Encoding UTF8
        Write-Success "Docker Compose file created"
        Write-Warning "Run 'cd backend; docker-compose up -d' to start database services"
    } catch {
        Write-Error "Failed to create Docker Compose file"
    }
} else {
    Write-Warning "Skipping Docker setup - not installed"
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd backend; docker-compose up -d    # Start database services" -ForegroundColor White  
Write-Host "2. cd program; anchor build            # Build smart contracts" -ForegroundColor White
Write-Host "3. cd frontend; npm install            # Setup frontend" -ForegroundColor White
Write-Host "4. Follow the roadmap for development   # See roadmap.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
