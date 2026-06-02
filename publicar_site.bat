@echo off
title Publicar Site - Reformas Sem Erro (Metodo 3P)
cls

echo ====================================================================
echo   PUBLICANDO SEU APLICATIVO NA NETLIFY (ACESSO PELO CELULAR)
echo ====================================================================
echo.
echo [1/3] Fazendo login no Netlify...
echo Um navegador abrira automaticamente para voce autorizar a conexao.
echo Se voce ja estiver logado, este passo sera ignorado.
echo.
call npx netlify login
echo.
echo ====================================================================
echo [2/3] Inicializando e publicando o site...
echo.
echo ATENCAO NA ESCOLHA DAS OPCOES DO PROCESSO INTERATIVO:
echo 1. Selecione "Create & configure a new site" (Criar novo site)
echo 2. Escolha sua conta do Netlify
echo 3. Deixe o nome do site em branco ou digite um nome exclusivo (ex: reformas-3p-cleber)
echo 4. Na pasta a publicar, digite "." (apenas um ponto, sem aspas)
echo.
call npx netlify deploy --dir=. --prod
echo.
echo ====================================================================
echo   Parabens! Seu aplicativo agora esta online!
echo   Voce vera o link final (ex: https://nome-do-site.netlify.app)
echo   no bloco acima. Basta abrir esse link no seu celular!
echo ====================================================================
echo.
pause
