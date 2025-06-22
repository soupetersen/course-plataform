# Script para iniciar o ngrok e expor a API na porta 3000
Write-Host "Iniciando ngrok para expor a API na porta 3000..." -ForegroundColor Green

# Verificar se a API está rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/webhook/config" -Method GET -TimeoutSec 5
    Write-Host "✅ API está rodando na porta 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ API não está acessível na porta 3000" -ForegroundColor Red
    Write-Host "Verifique se o Docker está rodando com: docker-compose ps" -ForegroundColor Yellow
    exit 1
}

# Iniciar ngrok
Write-Host "Iniciando ngrok..." -ForegroundColor Yellow
Write-Host "IMPORTANTE: Anote a URL pública que será exibida!" -ForegroundColor Cyan
Write-Host "Exemplo: https://abcd1234.ngrok.io" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para configurar o webhook do MercadoPago:" -ForegroundColor Green
Write-Host "1. Copie a URL pública do ngrok" -ForegroundColor White
Write-Host "2. Adicione /api/webhook/mercadopago no final" -ForegroundColor White
Write-Host "3. Configure no painel do MercadoPago" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o ngrok" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Executar ngrok
ngrok http 3000
