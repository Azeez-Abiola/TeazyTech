# Build script for TeazyTech production deployment

Write-Host "Building frontend..." -ForegroundColor Green
cd frontend
npm run build

Write-Host "Copying build files to root dist..." -ForegroundColor Green
cd ..
Remove-Item -Recurse -Force dist\* -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force frontend\dist\* dist\

Write-Host "Build complete! Ready for deployment." -ForegroundColor Green
Write-Host "Files copied to dist folder for server serving." -ForegroundColor Yellow