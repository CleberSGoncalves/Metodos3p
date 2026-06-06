import re

# Read clean index.html
with open("e:/desenvolvimento/Reformasemerro/index.html", "r", encoding="utf-8") as f:
    html = f.read()

print("Original index.html length:", len(html))

# 1. Add Desktop Side Panel right after <body>
body_open = "<body>"
desktop_panel = """<body>

  <!-- Painel lateral visível apenas no desktop -->
  <div id="desktop-side-panel" style="display: none; flex-direction: column; gap: 24px; width: 300px;">
    <!-- Logo principal -->
    <div class="desktop-logo-block">
      <img src="logo.jpeg" alt="Método 3P" style="width: 100%; max-width: 260px; height: auto; border-radius: 8px;">
    </div>

    <!-- Slogan -->
    <div class="desktop-info-card">
      <h4>🏗️ Sistema de Gestão</h4>
      <p>Controle total da sua reforma: planejamento financeiro, prevenção de erros e proteção do seu investimento.</p>
    </div>

    <!-- Fases -->
    <div class="desktop-info-card">
      <h4>📋 As 3 Fases do Método</h4>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #32d74b; flex-shrink: 0;"></div>
          <span style="font-size: 13px; color: rgba(255,255,255,0.8);"><strong style="color: #32d74b;">Planejar</strong> — Defina o orçamento e prioridades</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #0088ff; flex-shrink: 0;"></div>
          <span style="font-size: 13px; color: rgba(255,255,255,0.8);"><strong style="color: #0088ff;">Prevenir</strong> — Compare, contrate e controle</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #bf5af2; flex-shrink: 0;"></div>
          <span style="font-size: 13px; color: rgba(255,255,255,0.8);"><strong style="color: #bf5af2;">Proteger</strong> — Garanta e documente tudo</span>
        </div>
      </div>
    </div>

    <!-- Botão instalar app -->
    <div class="desktop-info-card" style="border-color: rgba(255,106,0,0.2); background: rgba(255,106,0,0.04);">
      <h4>📱 Instalar no Celular</h4>
      <p style="margin-bottom: 12px;">Tenha o app sempre disponível, mesmo sem internet.</p>
      <button onclick="window.app.installPwa()" style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #ff6a00, #ff9f0a); color: #fff; border: none; border-radius: 10px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
        📲 Baixar App Grátis
      </button>
    </div>
  </div>"""

html = html.replace(body_open, desktop_panel, 1)

# 2. Splash screen logo replacement
old_splash_logo = """    <!-- Conteúdo da Splash -->
    <div class="splash-content" id="splash-main-content">
      <div class="splash-logo-wrapper">
        <img id="splash-logo" src="icon-512.png" alt="Logo Método 3P" class="splash-logo">
        <div class="splash-logo-glow"></div>
        <div class="splash-lens-flare"></div>
      </div>
      <h1 class="splash-title" style="letter-spacing: 0.5px;">MÉTODO <span class="highlight-orange">3P</span></h1>
      <p class="splash-subtitle">Sua reforma. Seu sonho. Nosso método.</p>"""

new_splash_logo = """    <!-- Conteúdo da Splash -->
    <div class="splash-content" id="splash-main-content">
      <div class="splash-logo-wrapper">
        <img id="splash-logo" src="logo.jpeg" alt="Logo Método 3P" class="splash-logo" style="border-radius: 8px;">
        <div class="splash-logo-glow"></div>
        <div class="splash-lens-flare"></div>
      </div>
      <p class="splash-subtitle">Sua reforma. Seu sonho. Nosso método.</p>"""

html = html.replace(old_splash_logo, new_splash_logo, 1)

# 3. Header logo replacement
old_header_logo = """            <!-- Orange Hexagon Logo Icon -->
            <div class="logo-hexagon-icon" style="width: 32px; height: 32px; background: linear-gradient(135deg, #ff6a00, #ff9f0a); clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(255, 106, 0, 0.3); flex-shrink: 0;">
              <div style="width: 26px; height: 26px; background: #0c0e14; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display: flex; align-items: center; justify-content: center;">
                <span style="font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 800; color: #ff9f0a;">3P</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; text-align: left;">
              <h1 style="font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: 0.5px; line-height: 1.2;">
                MÉTODO <span style="color: var(--primary-orange);">3P</span>
              </h1>
              <span style="font-size: 7px; color: var(--text-muted); font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; line-height: 1;">Planejar • Prevenir • Proteger</span>
              <span style="font-size: 6px; color: #8c96ab; font-weight: 500; margin-top: 1px; display: inline-block;">Sua reforma. Seu sonho. Nosso método.</span>
            </div>"""

new_header_logo = """            <!-- Logo real Método 3P -->
            <img src="logo.jpeg" alt="Método 3P" style="height: 40px; width: auto; object-fit: contain; border-radius: 4px; flex-shrink: 0;">"""

html = html.replace(old_header_logo, new_header_logo, 1)

# 4. PWA Install banner in dashboard before Centro de Controle 3P
old_cc_title = """              <!-- CENTRO DE CONTROLE 3P (Title only) -->"""
new_cc_title = """              <!-- BLOCK 5: PWA INSTALLATION BANNER -->
              <div class="glass-card" id="dash-pwa-install-banner" style="padding: 14px; text-align: left; background: linear-gradient(135deg, rgba(255, 106, 0, 0.08) 0%, rgba(9, 10, 15, 0) 80%); border-color: rgba(255, 106, 0, 0.2); margin-bottom: 16px; border-radius: 16px;">
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <span style="font-size: 24px;">📲</span>
                  <div style="flex: 1;">
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0;">Instale o App no seu Celular!</h4>
                    <p style="font-size: 10px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">Acesse os checklists e guias 100% offline direto no canteiro, sem precisar de internet.</p>
                    
                    <div style="font-size: 9px; color: var(--primary-orange); background: rgba(255,106,0,0.06); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,106,0,0.1); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 14px;">🔗</span>
                      <div>
                        <div style="font-weight: 700; margin-bottom: 2px;">Acesse do celular:</div>
                        <div style="color: #ffffff;">metodo3p.kinomuse.com.br</div>
                      </div>
                    </div>

                    <div style="font-size: 9px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5;">
                      <div style="margin-bottom: 3px;">🤖 <b style="color: #fff;">Android:</b> Chrome → menu ⋮ → "Instalar"</div>
                      <div>🍎 <b style="color: #fff;">iPhone:</b> Safari → compartilhar 📤 → "Tela de Início"</div>
                    </div>
                    
                    <button class="btn btn-primary btn-mini" id="dash-btn-install-pwa" onclick="window.app.installPwa()" style="display: none; width: 100%; padding: 8px; font-size: 11px; font-weight: 700;">
                      ⬇️ Instalar Aplicativo Agora
                    </button>
                  </div>
                </div>
              </div>

              <!-- CENTRO DE CONTROLE 3P (Title only) -->"""

html = html.replace(old_cc_title, new_cc_title, 1)

# Write output to test
with open("e:/desenvolvimento/Reformasemerro/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Saved temporary index.html, current length:", len(html))
