# Build script for TeazyTech production deployment

Write-Host "Building frontend..." -ForegroundColor Green
cd frontend
npm run build
cd ..

Write-Host "Build complete! Frontend updated in frontend/dist." -ForegroundColor Green
Write-Host "Server is configured to serve directly from frontend/dist." -ForegroundColor Yellow