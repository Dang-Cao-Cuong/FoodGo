# Script tự động tổ chức lại cấu trúc FoodGo
# Chạy script này từ thư mục gốc FoodGo

Write-Host "================================" -ForegroundColor Cyan
Write-Host "FoodGo - Setup Structure Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra thư mục hiện tại
$currentPath = Get-Location
Write-Host "Current directory: $currentPath" -ForegroundColor Yellow

# Kiểm tra xem thư mục FOODGO có tồn tại không
if (!(Test-Path "FOODGO")) {
    Write-Host "ERROR: FOODGO directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the FoodGo root directory." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Creating Frontend directory structure..." -ForegroundColor Green

# Tạo thư mục frontend
New-Item -ItemType Directory -Path "frontend" -Force | Out-Null

# Di chuyển tất cả files từ FOODGO vào frontend
Write-Host "Moving files from FOODGO to frontend..." -ForegroundColor Yellow
Get-ChildItem -Path "FOODGO" -Force | ForEach-Object {
    if ($_.Name -ne ".git") {
        Move-Item -Path $_.FullName -Destination "frontend\" -Force
    }
}

# Xóa thư mục FOODGO cũ nếu trống
if ((Get-ChildItem -Path "FOODGO" -Force | Measure-Object).Count -eq 0) {
    Remove-Item -Path "FOODGO" -Force
    Write-Host "Removed empty FOODGO directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Creating Frontend src structure..." -ForegroundColor Green

# Tạo cấu trúc thư mục frontend/src
$frontendFolders = @(
    "frontend\src",
    "frontend\src\components\common",
    "frontend\src\components\restaurant",
    "frontend\src\components\cart",
    "frontend\src\components\order",
    "frontend\src\screens\auth",
    "frontend\src\screens\home",
    "frontend\src\screens\cart",
    "frontend\src\screens\orders",
    "frontend\src\screens\favorites",
    "frontend\src\navigation",
    "frontend\src\services",
    "frontend\src\contexts",
    "frontend\src\hooks",
    "frontend\src\database",
    "frontend\src\utils",
    "frontend\src\constants",
    "frontend\src\models",
    "frontend\src\assets\images",
    "frontend\src\assets\fonts"
)

foreach ($folder in $frontendFolders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "  Created: $folder" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 3: Creating Backend structure..." -ForegroundColor Green

# Tạo thư mục backend
New-Item -ItemType Directory -Path "backend" -Force | Out-Null

# Tạo cấu trúc thư mục backend
$backendFolders = @(
    "backend\src",
    "backend\src\controllers",
    "backend\src\models",
    "backend\src\routes",
    "backend\src\middleware",
    "backend\src\config",
    "backend\src\utils",
    "backend\src\validators",
    "backend\src\database\migrations"
)

foreach ($folder in $backendFolders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "  Created: $folder" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 4: Creating Backend files..." -ForegroundColor Green

# Tạo server.js
$serverContent = @"
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'FoodGo API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Import routes
// TODO: Add route imports here
// const authRoutes = require('./src/routes/auth');
// app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FoodGo API Server running on http://localhost:`+PORT);
  console.log(`📝 Environment: `+process.env.NODE_ENV || 'development');
});

module.exports = app;
"@
Set-Content -Path "backend\server.js" -Value $serverContent
Write-Host "  Created: backend\server.js" -ForegroundColor Gray

# Tạo .env
$envContent = @"
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodgo

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Other Configuration
API_URL=http://localhost:3000
UPLOAD_PATH=./uploads
"@
Set-Content -Path "backend\.env" -Value $envContent
Write-Host "  Created: backend\.env" -ForegroundColor Gray

# Tạo package.json cho backend
$backendPackageJson = @"
{
  "name": "foodgo-backend",
  "version": "1.0.0",
  "description": "FoodGo API Server - Node.js + Express + MySQL",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "foodgo",
    "food-delivery",
    "api",
    "express"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
"@
Set-Content -Path "backend\package.json" -Value $backendPackageJson
Write-Host "  Created: backend\package.json" -ForegroundColor Gray

# Tạo .gitignore cho backend
$backendGitignore = @"
node_modules/
.env
uploads/
logs/
*.log
.DS_Store
"@
Set-Content -Path "backend\.gitignore" -Value $backendGitignore
Write-Host "  Created: backend\.gitignore" -ForegroundColor Gray

Write-Host ""
Write-Host "Step 5: Creating Documentation structure..." -ForegroundColor Green

# Tạo thư mục docs
New-Item -ItemType Directory -Path "docs" -Force | Out-Null

# Tạo các file documentation trống
New-Item -ItemType File -Path "docs\API.md" -Force | Out-Null
New-Item -ItemType File -Path "docs\DATABASE_SCHEMA.md" -Force | Out-Null
New-Item -ItemType File -Path "docs\DEPLOYMENT.md" -Force | Out-Null

Write-Host "  Created: docs\API.md" -ForegroundColor Gray
Write-Host "  Created: docs\DATABASE_SCHEMA.md" -ForegroundColor Gray
Write-Host "  Created: docs\DEPLOYMENT.md" -ForegroundColor Gray

Write-Host ""
Write-Host "Step 6: Updating root .gitignore..." -ForegroundColor Green

# Cập nhật .gitignore ở root
$rootGitignore = @"
# Frontend
frontend/node_modules/
frontend/.expo/
frontend/.bundle/
frontend/android/app/build/
frontend/ios/Pods/
frontend/ios/build/
frontend/.vscode/

# Backend
backend/node_modules/
backend/.env
backend/uploads/
backend/logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
*.log

# Misc
*.bak
*.tmp
"@

if (Test-Path ".gitignore") {
    Add-Content -Path ".gitignore" -Value "`n# FoodGo Specific`n$rootGitignore"
} else {
    Set-Content -Path ".gitignore" -Value $rootGitignore
}

Write-Host "  Updated: .gitignore" -ForegroundColor Gray

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project Structure:" -ForegroundColor Yellow
Write-Host "  ├── frontend/          (React Native App)" -ForegroundColor White
Write-Host "  ├── backend/           (Node.js API)" -ForegroundColor White
Write-Host "  ├── docs/              (Documentation)" -ForegroundColor White
Write-Host "  ├── PROJECT_PLAN.md" -ForegroundColor White
Write-Host "  └── FOLDER_STRUCTURE.md" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Install Backend Dependencies:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure Database:" -ForegroundColor Cyan
Write-Host "   - Edit backend\.env with your MySQL credentials" -ForegroundColor White
Write-Host "   - Create MySQL database: CREATE DATABASE foodgo;" -ForegroundColor White
Write-Host ""
Write-Host "3. Start Backend Server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. Start Frontend (in new terminal):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "Read FOLDER_STRUCTURE.md for detailed information" -ForegroundColor Yellow
Write-Host ""
