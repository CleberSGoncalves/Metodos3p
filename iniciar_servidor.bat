@echo off
title Iniciar Servidor - Reformas Sem Erro (Metodo 3P)
cls

echo ====================================================================
echo   INICIANDO APLICATIVO MOBILE-FIRST: REFORMAS SEM ERRO (METODO 3P)
echo ====================================================================
echo.
echo [1/3] Iniciando o servidor HTTP local na porta 3000...
start "Servidor Local - Reformas 3P" cmd /c "npx http-server -p 3000"
echo.
echo [2/3] Aguardando 2 segundos para o servidor inicializar...
timeout /t 2 /nobreak > nul
echo.
echo [3/3] Abrindo o navegador padrao em http://localhost:3000...
start http://localhost:3000
echo.
echo ====================================================================
echo   Servidor ativo com sucesso!
echo   Para encerrar a aplicacao, basta fechar a janela de logs do 
echo   "Servidor Local - Reformas 3P" que foi aberta.
echo ====================================================================
echo.
pause
