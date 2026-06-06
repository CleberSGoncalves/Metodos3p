import re

# Read index.html
with open("e:/desenvolvimento/Reformasemerro/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Replace tab-planejar block
print("Replacing Planejar...")
planejar_start = "<!-- =============== TAB 1: PLANEJAR (FASE 1) =============== -->"
prevenir_start = "<!-- =============== TAB 2: PREVENIR (FASE 2) =============== -->"

idx1 = html.find(planejar_start)
idx2 = html.find(prevenir_start)

if idx1 != -1 and idx2 != -1:
    new_planejar_block = """<!-- =============== TAB 1: PLANEJAR (FASE 1) =============== -->
            <div id="tab-planejar" class="tab-view">
              <div class="pillar-header-banner" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; margin-bottom: 16px; background: transparent; padding-top: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div style="text-align: left;">
                    <span style="font-size: 8px; font-weight: 700; color: #32d74b; text-transform: uppercase; letter-spacing: 0.8px;">Fase 1</span>
                    <h2 style="font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin: 2px 0 0 0;">FASE 1 • PLANEJAR</h2>
                    <p style="font-size: 11px; color: #8c96ab; margin: 4px 0 0 0;">Defina os limites e prioridades antes de iniciar sua reforma.</p>
                  </div>
                </div>
              </div>

              <!-- REGISTRO DE AÇÕES -->
              <div style="text-align: left; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 4px; height: 14px; background: #32d74b; border-radius: 2px;"></div>
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Registro de Ações</h3>
                </div>
                <p style="font-size: 10px; color: #8c96ab; margin: 0 0 12px 0;">Defina os principais pilares e limites da sua reforma.</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;" class="planejar-actions-grid">
                  <!-- Card 1: Definir Orçamento -->
                  <div class="glass-card btn-bounce" onclick="window.app.openWizardDrawer(); window.app.navigateToWizardStep(1);" style="padding: 14px 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: rgba(15,18,26,0.45); border: 1.5px solid rgba(50,215,75,0.25); border-radius: 14px; cursor: pointer; min-height: 110px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(50,215,75,0.1); border: 1px solid rgba(50,215,75,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="font-size: 16px;">💰</span>
                      </div>
                      <h4 style="font-size: 11px; font-weight: 700; color: #fff; margin: 0; line-height: 1.2;">Definir Orçamento<br>da Reforma</h4>
                    </div>
                    <p style="font-size: 9px; color: #8c96ab; margin: 0; line-height: 1.2; flex: 1;">Informe o valor total que você irá investir.</p>
                    <div style="align-self: flex-end; width: 22px; height: 22px; border-radius: 50%; background: #32d74b; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 10px; flex-shrink: 0;">➔</div>
                  </div>

                  <!-- Card 2: Registrar Pagamento -->
                  <div class="glass-card btn-bounce" onclick="window.app.openExpenseDrawer();" style="padding: 14px 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: rgba(15,18,26,0.45); border: 1.5px solid rgba(255,159,10,0.25); border-radius: 14px; cursor: pointer; min-height: 110px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,159,10,0.1); border: 1px solid rgba(255,159,10,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="font-size: 16px;">💸</span>
                      </div>
                      <h4 style="font-size: 11px; font-weight: 700; color: #fff; margin: 0; line-height: 1.2;">Registrar Pagamento<br>da Reforma</h4>
                    </div>
                    <p style="font-size: 9px; color: #8c96ab; margin: 0; line-height: 1.2; flex: 1;">Registre um pagamento realizado na reforma.</p>
                    <div style="align-self: flex-end; width: 22px; height: 22px; border-radius: 50%; background: #ff9f0a; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 10px; flex-shrink: 0;">➔</div>
                  </div>
                </div>
              </div>

              <!-- LIMITE DA REFORMA -->
              <div class="glass-card" style="padding: 16px; margin-bottom: 20px; text-align: left; background: rgba(15, 18, 26, 0.45); border: 1.5px solid rgba(50,215,75,0.15); border-radius: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 4px; height: 14px; background: #32d74b; border-radius: 2px;"></div>
                    <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Limite da Reforma</h3>
                    <span style="font-size: 12px; color: #32d74b;">🛡️</span>
                  </div>
                  <span style="font-size: 10px; color: #8c96ab; font-weight: 500;">Defina seu limite e mantenha o controle.</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; position: relative;">
                  <!-- Left: Orçamento Total -->
                  <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">💰</div>
                    <div>
                      <span style="font-size: 9px; color: #32d74b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Orçamento Total</span>
                      <strong id="planejar-total-verba" style="font-size: 18px; color: #ffffff; font-family: 'Sora', sans-serif;">R$ 0,00</strong>
                      <span style="font-size: 9px; color: #8c96ab; display: block; margin-top: 2px;">Valor total disponível para a reforma</span>
                    </div>
                  </div>
                  <!-- Right: Margem de Segurança -->
                  <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; position: relative;">
                      🛡️
                    </div>
                    <div>
                      <span style="font-size: 9px; color: #32d74b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                        Margem de Segurança <span style="font-size: 9px; color: #8c96ab; cursor: help;" title="Reservados para imprevistos">ⓘ</span>
                      </span>
                      <strong id="planejar-margem-pct" style="font-size: 18px; color: #ffffff; font-family: 'Sora', sans-serif;">10%</strong>
                      <span style="font-size: 9px; color: #8c96ab; display: block; margin-top: 2px;" id="planejar-margem-verba">R$ 0,00 reservados para imprevistos</span>
                    </div>
                  </div>
                </div>
                
                <!-- Progress bar -->
                <div style="margin-bottom: 12px;">
                  <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin-bottom: 6px;">
                    <div id="planejar-progress-bar" style="width: 0%; height: 100%; background: #32d74b; border-radius: 3px; transition: width 0.3s ease;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #8c96ab;">
                     <span id="planejar-utilizado-lbl">R$ 0,00 utilizado</span>
                     <span id="planejar-disponivel-lbl">R$ 0,00 disponível (10%)</span>
                  </div>
                </div>
                
                <!-- Note banner -->
                <div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(50,215,75,0.04); border: 1.5px solid rgba(50,215,75,0.12); border-radius: 10px; font-size: 10px; color: #8c96ab; text-align: left;">
                  <span style="color: #32d74b; font-size: 12px;">ⓘ</span>
                  <span>Manter uma reserva é essencial para lidar com imprevistos sem comprometer sua obra.</span>
                </div>
              </div>

              <!-- PILARES PRIORITÁRIOS -->
              <div id="pilares-prioritarios-section" class="glass-card" style="padding: 16px; margin-bottom: 20px; text-align: left; background: rgba(15, 18, 26, 0.45); border: 1.5px solid rgba(50,215,75,0.15); border-radius: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 4px; height: 14px; background: #32d74b; border-radius: 2px;"></div>
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Pilares Prioritários</h3>
                </div>
                <p style="font-size: 10px; color: #8c96ab; margin: 0 0 12px 0;">Defina o nível de prioridade de cada pilar da sua reforma.</p>
                
                <div class="pilares-table-wrapper" style="overflow-x: auto; width: 100%;">
                  <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                    <thead>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                        <th style="font-size: 9px; font-weight: 700; color: #8c96ab; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Pilar</th>
                        <th style="font-size: 9px; font-weight: 700; color: #8c96ab; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                        <th style="font-size: 9px; font-weight: 700; color: #8c96ab; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; width: 50%;">Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Row 1: Elétrica -->
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 10px 0; font-size: 11px; font-weight: 700; color: #ffffff;">⚡ ELÉTRICA</td>
                        <td style="padding: 10px 0;">
                          <select id="pilar-status-eletrica" onchange="window.app.financeiroController.savePilarPriority('eletrica')" style="font-size: 10px; padding: 4px 8px; border-radius: 6px; background: rgba(15,18,26,0.6); border: 1px solid var(--border-glass); color: #fff; outline: none; cursor: pointer;">
                            <option value="opcional">⚪ OPCIONAL</option>
                            <option value="atencao">🟠 ATENÇÃO</option>
                            <option value="importante">🟡 IMPORTANTE</option>
                            <option value="prioritario" selected>🔴 PRIORITÁRIO</option>
                          </select>
                        </td>
                        <td style="padding: 10px 0; display: flex; align-items: center; gap: 8px; width: 100%;">
                          <input type="text" id="pilar-obs-eletrica" onchange="window.app.financeiroController.savePilarPriority('eletrica')" placeholder="Digite uma observação..." style="flex: 1; font-size: 10px; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); color: #fff; width: 100%;">
                        </td>
                      </tr>
                      <!-- Row 2: Hidráulica -->
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 10px 0; font-size: 11px; font-weight: 700; color: #ffffff;">💧 HIDRÁULICA</td>
                        <td style="padding: 10px 0;">
                          <select id="pilar-status-hidraulica" onchange="window.app.financeiroController.savePilarPriority('hidraulica')" style="font-size: 10px; padding: 4px 8px; border-radius: 6px; background: rgba(15,18,26,0.6); border: 1px solid var(--border-glass); color: #fff; outline: none; cursor: pointer;">
                            <option value="opcional">⚪ OPCIONAL</option>
                            <option value="atencao">🟠 ATENÇÃO</option>
                            <option value="importante" selected>🟡 IMPORTANTE</option>
                            <option value="prioritario">🔴 PRIORITÁRIO</option>
                          </select>
                        </td>
                        <td style="padding: 10px 0; display: flex; align-items: center; gap: 8px; width: 100%;">
                          <input type="text" id="pilar-obs-hidraulica" onchange="window.app.financeiroController.savePilarPriority('hidraulica')" placeholder="Digite uma observação..." style="flex: 1; font-size: 10px; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); color: #fff; width: 100%;">
                        </td>
                      </tr>
                      <!-- Row 3: Estrutural -->
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 10px 0; font-size: 11px; font-weight: 700; color: #ffffff;">🏗️ ESTRUTURAL</td>
                        <td style="padding: 10px 0;">
                          <select id="pilar-status-estrutural" onchange="window.app.financeiroController.savePilarPriority('estrutural')" style="font-size: 10px; padding: 4px 8px; border-radius: 6px; background: rgba(15,18,26,0.6); border: 1px solid var(--border-glass); color: #fff; outline: none; cursor: pointer;">
                            <option value="opcional">⚪ OPCIONAL</option>
                            <option value="atencao" selected>🟠 ATENÇÃO</option>
                            <option value="importante">🟡 IMPORTANTE</option>
                            <option value="prioritario">🔴 PRIORITÁRIO</option>
                          </select>
                        </td>
                        <td style="padding: 10px 0; display: flex; align-items: center; gap: 8px; width: 100%;">
                          <input type="text" id="pilar-obs-estrutural" onchange="window.app.financeiroController.savePilarPriority('estrutural')" placeholder="Digite uma observação..." style="flex: 1; font-size: 10px; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); color: #fff; width: 100%;">
                        </td>
                      </tr>
                      <!-- Row 4: Acabamento -->
                      <tr style="border-bottom: none;">
                        <td style="padding: 10px 0; font-size: 11px; font-weight: 700; color: #ffffff;">🧱 ACABAMENTO</td>
                        <td style="padding: 10px 0;">
                          <select id="pilar-status-acabamento" onchange="window.app.financeiroController.savePilarPriority('acabamento')" style="font-size: 10px; padding: 4px 8px; border-radius: 6px; background: rgba(15,18,26,0.6); border: 1px solid var(--border-glass); color: #fff; outline: none; cursor: pointer;">
                            <option value="opcional" selected>⚪ OPCIONAL</option>
                            <option value="atencao">🟠 ATENÇÃO</option>
                            <option value="importante">🟡 IMPORTANTE</option>
                            <option value="prioritario">🔴 PRIORITÁRIO</option>
                          </select>
                        </td>
                        <td style="padding: 10px 0; display: flex; align-items: center; gap: 8px; width: 100%;">
                          <input type="text" id="pilar-obs-acabamento" onchange="window.app.financeiroController.savePilarPriority('acabamento')" placeholder="Digite uma observação..." style="flex: 1; font-size: 10px; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); color: #fff; width: 100%;">
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Redirect to Decidir Footer -->
              <div class="glass-card redirect-decidir-footer" onclick="window.app.switchTab('decidir'); window.app.decisoesController.switchDecidirSubTab('dilemas');" style="padding: 16px; margin: 16px 0 80px 0; background: rgba(255, 106, 0, 0.03); border: 1.5px solid rgba(255, 106, 0, 0.25); border-radius: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; text-align: left; transition: all 0.2s ease-in-out;" onmouseover="this.style.background='rgba(255, 106, 0, 0.06)';" onmouseout="this.style.background='rgba(255, 106, 0, 0.03)';">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 106, 0, 0.1); border: 1px solid rgba(255, 106, 0, 0.2); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">💡</div>
                  <div>
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #fff; margin: 0 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px;">Precisa de ajuda para decidir?</h4>
                    <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.3;">Consulte os materiais completos, protocolos e guias na aba: <span style="color: var(--primary-orange); font-weight: 700;">Central de Apoio (Decidir)</span>.</p>
                  </div>
                </div>
                <div class="btn btn-secondary btn-mini" style="display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: rgba(255,106,0,0.05); border-color: rgba(255,106,0,0.3); color: #ff9500; font-family: inherit; font-size: 11px; font-weight: 700; width: auto; flex-shrink: 0; border-radius: 10px;">
                  📖 Ir para Central de Apoio ➔
                </div>
              </div>
            </div>
            
            """
    html = html[:idx1] + new_planejar_block + html[idx2:]
else:
    print("Error: Planejar markers not found!")

# 2. Replace tab-prevenir block
print("Replacing Prevenir...")
prevenir_start = "<!-- =============== TAB 2: PREVENIR (FASE 2) =============== -->"
proteger_start = "<!-- =============== TAB 3: PROTEGER (FASE 3) =============== -->"

idx1 = html.find(prevenir_start)
idx2 = html.find(proteger_start)

if idx1 != -1 and idx2 != -1:
    new_prevenir_block = """<!-- =============== TAB 2: PREVENIR (FASE 2) =============== -->
            <div id="tab-prevenir" class="tab-view">
              <!-- Header Banner Fase 2 -->
              <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(50,215,75,0.12); border: 1.5px solid rgba(50,215,75,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                      <span style="font-size: 11px; font-weight: 700; color: #32d74b; text-transform: uppercase; letter-spacing: 0.8px;">FASE 2 •</span>
                      <h2 style="font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #32d74b; margin: 0;">PREVENIR</h2>
                    </div>
                    <p style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">É aqui que você evita prejuízos.</p>
                    <p style="font-size: 11px; color: #8c96ab; margin: 0; line-height: 1.5;">Antes de contratar, comprar ou aprovar qualquer gasto, o Método 3P mostra os riscos e te ajuda a tomar decisões que <span style="color: #32d74b; font-weight: 600;">protegem seu dinheiro.</span></p>
                  </div>
                </div>
              </div>

              <!-- AÇÕES PARA EVITAR PREJUÍZOS -->
              <div style="text-align: left; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                  <div style="width: 4px; height: 16px; background: #32d74b; border-radius: 2px;"></div>
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">AÇÕES PARA EVITAR PREJUÍZOS</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                  <!-- Card 1: Compare Antes de Comprar -->
                  <div class="glass-card btn-bounce" onclick="window.app.financeiroController.switchPrevenirStep(1, true)" style="padding: 16px 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; background: rgba(15,18,26,0.5); border: 1.5px solid rgba(50,215,75,0.25); border-radius: 14px; cursor: pointer; min-height: 160px; text-align: left; transition: all 0.2s ease;" onmouseover="this.style.borderColor='rgba(50,215,75,0.5)'" onmouseout="this.style.borderColor='rgba(50,215,75,0.25)'">
                    <div>
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(50,215,75,0.1); border: 1.5px solid rgba(50,215,75,0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></svg>
                      </div>
                      <div style="width: 20px; height: 2px; background: #32d74b; border-radius: 1px; margin-bottom: 10px;"></div>
                      <h4 style="font-size: 12px; font-weight: 800; color: #fff; margin: 0 0 8px 0; text-transform: uppercase; line-height: 1.2;">COMPARE ANTES<br>DE COMPRAR</h4>
                      <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.4;">Compare preços, prazos and condições e escolha melhor.</p>
                    </div>
                    <div style="align-self: flex-end; width: 28px; height: 28px; border-radius: 50%; background: #32d74b; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>

                  <!-- Card 2: Controle Suas Compras -->
                  <div class="glass-card btn-bounce" onclick="window.app.financeiroController.switchPrevenirStep(3, true)" style="padding: 16px 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; background: rgba(15,18,26,0.5); border: 1.5px solid rgba(255,159,10,0.25); border-radius: 14px; cursor: pointer; min-height: 160px; text-align: left; transition: all 0.2s ease;" onmouseover="this.style.borderColor='rgba(255,159,10,0.5)'" onmouseout="this.style.borderColor='rgba(255,159,10,0.25)'">
                    <div>
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,159,10,0.1); border: 1.5px solid rgba(255,159,10,0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      </div>
                      <div style="width: 20px; height: 2px; background: #ff9f0a; border-radius: 1px; margin-bottom: 10px;"></div>
                      <h4 style="font-size: 12px; font-weight: 800; color: #fff; margin: 0 0 8px 0; text-transform: uppercase; line-height: 1.2;">CONTROLE SUAS<br>COMPRAS</h4>
                      <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.4;">Registre compras e identifique gastos fora do planejado.</p>
                    </div>
                    <div style="align-self: flex-end; width: 28px; height: 28px; border-radius: 50%; background: #ff9f0a; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>

                  <!-- Card 3: Contrate com Segurança -->
                  <div class="glass-card btn-bounce" onclick="window.app.financeiroController.switchPrevenirStep(2, true)" style="padding: 16px 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; background: rgba(15,18,26,0.5); border: 1.5px solid rgba(0,136,255,0.25); border-radius: 14px; cursor: pointer; min-height: 160px; text-align: left; transition: all 0.2s ease;" onmouseover="this.style.borderColor='rgba(0,136,255,0.5)'" onmouseout="this.style.borderColor='rgba(0,136,255,0.25)'">
                    <div>
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0,136,255,0.1); border: 1.5px solid rgba(0,136,255,0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0088ff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 17 13 19 11"/></svg>
                      </div>
                      <div style="width: 20px; height: 2px; background: #0088ff; border-radius: 1px; margin-bottom: 10px;"></div>
                      <h4 style="font-size: 12px; font-weight: 800; color: #fff; margin: 0 0 8px 0; text-transform: uppercase; line-height: 1.2;">CONTRATE COM<br>SEGURANÇA</h4>
                      <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.4;">Use critérios objetivos para evitar erros e retrabalho.</p>
                    </div>
                    <div style="align-self: flex-end; width: 28px; height: 28px; border-radius: 50%; background: #0088ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- RESUMO FINANCEIRO DA FASE -->
              <div class="glass-card" style="padding: 16px; margin-bottom: 20px; text-align: left; background: rgba(15, 18, 26, 0.45); border: 1.5px solid rgba(50,215,75,0.15); border-radius: 16px;">
                <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #32d74b; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Resumo Financeiro da Fase 2</h3>
                <p style="font-size: 10px; color: #8c96ab; margin: 0 0 16px 0;">Acompanhe seu resultado.</p>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 12px;">
                  <div>
                    <span style="font-size: 9px; color: #8c96ab; display: block; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Previsto</span>
                    <strong id="prevenir-previsto" style="font-size: 16px; color: #ffffff; font-family: 'Sora', sans-serif; white-space: nowrap;">R$ 0,00</strong>
                    <span style="font-size: 9px; color: #8c96ab; display: block; margin-top: 2px;">Valor total estimado para esta fase.</span>
                  </div>
                  <div>
                    <span style="font-size: 9px; color: #8c96ab; display: block; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Economia Potencial</span>
                    <strong id="prevenir-economia" style="font-size: 16px; color: #32d74b; font-family: 'Sora', sans-serif; white-space: nowrap;">R$ 0,00</strong>
                    <span style="font-size: 9px; color: #8c96ab; display: block; margin-top: 2px;">Dinheiro que você pode deixar no seu bolso.</span>
                  </div>
                  <div>
                    <span style="font-size: 9px; color: #8c96ab; display: block; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Saldo a Pagar</span>
                    <strong id="prevenir-saldo" style="font-size: 16px; color: #ff9f0a; font-family: 'Sora', sans-serif; white-space: nowrap;">R$ 0,00</strong>
                    <span style="font-size: 9px; color: #8c96ab; display: block; margin-top: 2px;">O que ainda precisa ser pago para não ter surpresa.</span>
                  </div>
                </div>
                
                <!-- Compatibility spans hidden -->
                <div style="display: none;">
                  <strong id="prevenir-disponivel"></strong>
                  <strong id="prevenir-pago"></strong>
                  <span id="prevenir-previsto-pct"></span>
                  <span id="prevenir-pago-pct"></span>
                  <span id="prevenir-saldo-pct"></span>
                </div>
              </div>

              <!-- ETAPAS DA FASE PREVENIR (Timeline of steps) -->
              <div class="glass-card" style="padding: 16px; margin-bottom: 16px; text-align: left; background: rgba(15, 18, 26, 0.4); border: 1px solid var(--border-glass);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #ffffff; margin: 0;">🔧 ETAPAS DA FASE PREVENIR</h3>
                  <span id="prevenir-timeline-progress-text" style="font-size: 11px; font-weight: 700; color: #0088ff;">0% concluído</span>
                </div>
                
                <div class="steps-timeline-container" style="position: relative; margin-bottom: 24px; padding: 10px 0;">
                  <div class="steps-timeline-line-bg" style="position: absolute; top: 22px; left: 10%; right: 10%; height: 4px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
                  <div id="prevenir-timeline-line-fill" class="steps-timeline-line-filled" style="position: absolute; top: 22px; left: 10%; width: 0%; height: 4px; background: #0088ff; z-index: 2; transition: width 0.4s ease;"></div>
                  
                  <div style="display: flex; justify-content: space-between; position: relative; z-index: 3; padding: 0 8%;">
                    <!-- Step Node 1 -->
                    <div class="timeline-step-node" id="prevenir-node-1" onclick="window.app.financeiroController.switchPrevenirStep(1, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">1</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;" id="prevenir-node-1-pct">0%</span>
                    </div>
                    <!-- Step Node 2 -->
                    <div class="timeline-step-node" id="prevenir-node-2" onclick="window.app.financeiroController.switchPrevenirStep(2, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">2</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;" id="prevenir-node-2-pct">0%</span>
                    </div>
                    <!-- Step Node 3 -->
                    <div class="timeline-step-node" id="prevenir-node-3" onclick="window.app.financeiroController.switchPrevenirStep(3, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">3</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;" id="prevenir-node-3-pct">0%</span>
                    </div>
                  </div>
                </div>

                <!-- Timeline STEP 1: Compare Antes de Comprar -->
                <div id="prevenir-step-content-1" class="prevenir-step-content glass-card" style="padding: 16px; margin-bottom: 16px; text-align: left; display: block; background: rgba(15, 18, 26, 0.4); border: 1px solid var(--border-glass);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #32d74b; display: flex; align-items: center; gap: 6px;">📋 1. Compare Antes de Comprar</h4>
                    <button class="btn btn-secondary btn-mini" onclick="window.app.financeiroController.openAddPlanDrawer()" style="width: auto; padding: 4px 8px; font-size: 10px; border-color: rgba(50,215,75,0.3); color: #32d74b; background: rgba(50,215,75,0.05);">➕ Nova Cotação</button>
                  </div>
                  
                  <div style="overflow-x: auto; width: 100%; margin-bottom: 12px;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Item</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Ambiente</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Teto Est.</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Menor Cot.</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Economia</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase; width: 60px;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="prevenir-orcamento-table-body">
                        <!-- Loaded dynamically -->
                      </tbody>
                    </table>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #8c96ab; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
                    <span>Total previsto: <strong id="prevenir-orcamento-total" style="color: #fff;">R$ 0,00</strong></span>
                    <span style="color: #32d74b;">Economia potencial: <strong id="prevenir-orcamento-economia">R$ 0,00</strong></span>
                  </div>
                </div>

                <!-- Timeline STEP 2: Contrate com Segurança -->
                <div id="prevenir-step-content-2" class="prevenir-step-content glass-card" style="padding: 16px; margin-bottom: 16px; text-align: left; display: none; background: rgba(15, 18, 26, 0.4); border: 1px solid var(--border-glass);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #0088ff; display: flex; align-items: center; gap: 6px;">🤝 2. Contrate com Segurança</h4>
                    <button class="btn btn-secondary btn-mini" onclick="window.app.financeiroController.openCompareSuppliersDrawer()" style="width: auto; padding: 4px 8px; font-size: 10px; border-color: rgba(0,136,255,0.3); color: #0088ff; background: rgba(0,136,255,0.05);">➕ Nova Cotação Fornecedor</button>
                  </div>
                  
                  <div style="overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Serviço</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Fornecedor</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Preço</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Nota 3P</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Recomendação</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase; width: 60px;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="prevenir-contratacao-table-body">
                        <!-- Loaded dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Timeline STEP 3: Controle suas Compras -->
                <div id="prevenir-step-content-3" class="prevenir-step-content glass-card" style="padding: 16px; margin-bottom: 16px; text-align: left; display: none; background: rgba(15, 18, 26, 0.4); border: 1px solid var(--border-glass);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #ff9f0a; display: flex; align-items: center; gap: 6px;">🛒 3. Controle Suas Compras</h4>
                    <button class="btn btn-secondary btn-mini" onclick="window.app.openExpenseDrawer()" style="width: auto; padding: 4px 8px; font-size: 10px; border-color: rgba(255,159,10,0.3); color: #ff9f0a; background: rgba(255,159,10,0.05);">➕ Registrar Gasto</button>
                  </div>
                  
                  <div style="overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Item</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Fornecedor</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Data Compra</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Valor (R$)</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Pago</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Entrega</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase; width: 60px;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="prevenir-compras-table-body">
                        <!-- Loaded dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- EM DÚVIDA? Footer -->
              <div class="glass-card redirect-decidir-footer" onclick="window.app.switchTab('decidir'); window.app.decisoesController.switchDecidirSubTab('biblioteca');" style="padding: 16px; margin: 16px 0 80px 0; background: rgba(0, 136, 255, 0.03); border: 1.5px solid rgba(0, 136, 255, 0.25); border-radius: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; text-align: left; transition: all 0.2s ease-in-out;" onmouseover="this.style.background='rgba(0,136,255,0.06)'" onmouseout="this.style.background='rgba(0,136,255,0.03)'">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 136, 255, 0.1); border: 1px solid rgba(0, 136, 255, 0.25); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">💡</div>
                  <div>
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #fff; margin: 0 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px;">EM DÚVIDA?</h4>
                    <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.3;">Consulte os protocolos e guias da <span style="color: #0088ff; font-weight: 700;">Central de Apoio</span> e tome decisões com mais segurança.</p>
                  </div>
                </div>
                <div class="btn btn-secondary btn-mini" style="display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: rgba(0,136,255,0.05); border-color: rgba(0,136,255,0.3); color: #0088ff; font-family: inherit; font-size: 11px; font-weight: 700; width: auto; flex-shrink: 0; border-radius: 10px;">
                  📖 Ir para Central de Apoio ➔
                </div>
              </div>
            </div>
            
            """
    html = html[:idx1] + new_prevenir_block + html[idx2:]
else:
    print("Error: Prevenir markers not found!")

# 3. Replace tab-proteger block
print("Replacing Proteger...")
proteger_start = "<!-- =============== TAB 3: PROTEGER (FASE 3) =============== -->"
decidir_start = "<!-- =============== TAB 4: DECIDIR (PROTOCOLOS) =============== -->"

idx1 = html.find(proteger_start)
idx2 = html.find(decidir_start)

if idx1 != -1 and idx2 != -1:
    new_proteger_block = """<!-- =============== TAB 3: PROTEGER (FASE 3) =============== -->
            <div id="tab-proteger" class="tab-view">
              <!-- Header Banner Fase 3 -->
              <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(191,90,242,0.12); border: 1.5px solid rgba(191,90,242,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bf5af2" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                      <span style="font-size: 11px; font-weight: 700; color: #bf5af2; text-transform: uppercase; letter-spacing: 0.8px;">FASE 3 •</span>
                      <h2 style="font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #bf5af2; margin: 0;">PROTEGER</h2>
                    </div>
                    <p style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">Garanta que nenhum erro fique sem responsável.</p>
                    <p style="font-size: 11px; color: #8c96ab; margin: 0; line-height: 1.5;">A maioria dos problemas aparece depois que a obra termina. O Método 3P ajuda você a registrar, validar e documentar tudo antes da entrega final.</p>
                  </div>
                </div>
              </div>

              <!-- AÇÕES PARA PROTEGER SEU INVESTIMENTO -->
              <div style="text-align: left; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                  <div style="width: 4px; height: 16px; background: #bf5af2; border-radius: 2px;"></div>
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">AÇÕES PARA PROTEGER SEU INVESTIMENTO</h3>
                </div>
                <p style="font-size: 10px; color: #8c96ab; margin: 0 0 12px 0;">Registre, valide e documente tudo para garantir seus direitos.</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                  <!-- Card 1: Não Perca Suas Garantias -->
                  <div class="glass-card btn-bounce" onclick="window.app.conteudosController.switchProtegerStep(1, true)" style="padding: 14px 12px; display: flex; align-items: center; gap: 12px; background: rgba(15,18,26,0.45); border: 1.5px solid rgba(191,90,242,0.2); border-radius: 14px; cursor: pointer; min-height: 80px; text-align: left;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(191,90,242,0.08); border: 1px solid rgba(191,90,242,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">🛡️</div>
                    <div>
                      <h4 style="font-size: 11px; font-weight: 700; color: #fff; margin: 0 0 2px 0;">NÃO PERCA SUAS GARANTIAS</h4>
                      <p style="font-size: 9px; color: #8c96ab; margin: 0; line-height: 1.3;">Organize notas, garantias e contatos em um único lugar.</p>
                    </div>
                  </div>

                  <!-- Card 2: Tenha Tudo Documentado -->
                  <div class="glass-card btn-bounce" onclick="window.app.conteudosController.switchProtegerStep(2, true)" style="padding: 14px 12px; display: flex; align-items: center; gap: 12px; background: rgba(15,18,26,0.45); border: 1.5px solid rgba(191,90,242,0.2); border-radius: 14px; cursor: pointer; min-height: 80px; text-align: left;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(191,90,242,0.08); border: 1px solid rgba(191,90,242,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">📁</div>
                    <div>
                      <h4 style="font-size: 11px; font-weight: 700; color: #fff; margin: 0 0 2px 0;">TENHA TUDO DOCUMENTADO</h4>
                      <p style="font-size: 9px; color: #8c96ab; margin: 0; line-height: 1.3;">Mantenha contratos e comprovantes acessíveis caso precise cobrar.</p>
                    </div>
                  </div>

                  <!-- Card 3: Evite Pendências Escondidas -->
                  <div class="glass-card btn-bounce" onclick="window.app.conteudosController.switchProtegerStep(3, true)" style="padding: 14px 12px; display: flex; align-items: center; gap: 12px; background: rgba(15,18,26,0.45); border: 1.5px solid rgba(191,90,242,0.2); border-radius: 14px; cursor: pointer; min-height: 80px; text-align: left;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(191,90,242,0.08); border: 1px solid rgba(191,90,242,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">🔍</div>
                    <div>
                      <h4 style="font-size: 11px; font-weight: 700; color: #fff; margin: 0 0 2px 0;">EVITE PENDÊNCIAS ESCONDIDAS</h4>
                      <p style="font-size: 9px; color: #8c96ab; margin: 0; line-height: 1.3;">Registre os ajustes e correções pendentes da sua obra.</p>
                    </div>
                  </div>

                  <!-- Card 4: Confira Antes de Aprovar -->
                  <div class="glass-card btn-bounce" onclick="window.app.conteudosController.switchProtegerStep(4, true)" style="padding: 14px 12px; display: flex; align-items: center; gap: 12px; background: rgba(15,18,26,0.45); border: 1.5px solid rgba(191,90,242,0.2); border-radius: 14px; cursor: pointer; min-height: 80px; text-align: left;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(191,90,242,0.08); border: 1px solid rgba(191,90,242,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">📋</div>
                    <div>
                      <h4 style="font-size: 11px; font-weight: 700; color: #fff; margin: 0 0 2px 0;">CONFIRA ANTES DE APROVAR</h4>
                      <p style="font-size: 9px; color: #8c96ab; margin: 0; line-height: 1.3;">Use o checklist final para evitar problemas descobertos depois.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- NÍVEL DE PROTEÇÃO DA SUA OBRA -->
              <div class="glass-card" style="padding: 16px; margin-bottom: 20px; text-align: left; background: rgba(15, 18, 26, 0.45); border: 1.5px solid rgba(191,90,242,0.15); border-radius: 16px;">
                <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #bf5af2; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">NÍVEL DE PROTEÇÃO DA SUA OBRA</h3>
                <p style="font-size: 10px; color: #8c96ab; margin: 0 0 16px 0;">Sua proteção está avançando!</p>
                
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <!-- Row 1: Garantias protegidas -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 10px;">
                    <div style="flex: 1;">
                      <strong style="font-size: 12px; color: #ffffff; display: block; margin-bottom: 2px;">Garantias protegidas</strong>
                      <span style="font-size: 10px; color: #8c96ab;">Tudo registrado e organizado.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; width: 140px; justify-content: flex-end;">
                      <div style="width: 80px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div id="proteger-garantias-bar" style="width: 0%; height: 100%; background: #bf5af2; border-radius: 3px; transition: width 0.3s ease;"></div>
                      </div>
                      <span style="font-size: 10px; color: #bf5af2; font-weight: 700; width: 40px; text-align: right;" id="proteger-garantias-pct">0%</span>
                    </div>
                  </div>

                  <!-- Row 2: Contratos documentados -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 10px;">
                    <div style="flex: 1;">
                      <strong style="font-size: 12px; color: #ffffff; display: block; margin-bottom: 2px;">Contratos documentados</strong>
                      <span style="font-size: 10px; color: #8c96ab;">Acordos e contratos salvos.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; width: 140px; justify-content: flex-end;">
                      <div style="width: 80px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div id="proteger-contratos-bar" style="width: 0%; height: 100%; background: #bf5af2; border-radius: 3px; transition: width 0.3s ease;"></div>
                      </div>
                      <span style="font-size: 10px; color: #bf5af2; font-weight: 700; width: 40px; text-align: right;" id="proteger-contratos-pct">0%</span>
                    </div>
                  </div>

                  <!-- Row 3: Pendências registradas -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 10px;">
                    <div style="flex: 1;">
                      <strong style="font-size: 12px; color: #ffffff; display: block; margin-bottom: 2px;">Pendências registradas</strong>
                      <span style="font-size: 10px; color: #8c96ab;">Ajustes e correções acompanhados.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; width: 140px; justify-content: flex-end;">
                      <div style="width: 80px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div id="proteger-pendencias-bar" style="width: 0%; height: 100%; background: #bf5af2; border-radius: 3px; transition: width 0.3s ease;"></div>
                      </div>
                      <span style="font-size: 10px; color: #bf5af2; font-weight: 700; width: 40px; text-align: right;" id="proteger-pendencias-pct">0%</span>
                    </div>
                  </div>

                  <!-- Row 4: Verificação final pendente -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 6px;">
                    <div style="flex: 1;">
                      <strong style="font-size: 12px; color: #ffffff; display: block; margin-bottom: 2px;">Verificação final pendente</strong>
                      <span style="font-size: 10px; color: #8c96ab;">Checklist final para aprovar a entrega.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; width: 140px; justify-content: flex-end;">
                      <div style="width: 80px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div id="proteger-final-bar" style="width: 0%; height: 100%; background: #bf5af2; border-radius: 3px; transition: width 0.3s ease;"></div>
                      </div>
                      <span style="font-size: 10px; color: #bf5af2; font-weight: 700; width: 40px; text-align: right;" id="proteger-final-pct">0%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ETAPAS DA FASE PROTEGER (Timeline inside Proteger tab) -->
              <div class="glass-card" style="padding: 16px; margin-bottom: 16px; text-align: left; background: rgba(15, 18, 26, 0.4); border: 1px solid var(--border-glass);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #ffffff; margin: 0;">🔧 ETAPAS DA FASE PROTEGER</h3>
                  <span id="proteger-timeline-progress-text" style="font-size: 11px; font-weight: 700; color: #bf5af2;">0% concluído</span>
                </div>
                
                <div class="steps-timeline-container" style="position: relative; margin-bottom: 24px; padding: 10px 0;">
                  <div class="steps-timeline-line-bg" style="position: absolute; top: 22px; left: 10%; right: 10%; height: 4px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
                  <div id="proteger-timeline-line-fill" class="steps-timeline-line-filled" style="position: absolute; top: 22px; left: 10%; width: 0%; height: 4px; background: #bf5af2; z-index: 2; transition: width 0.4s ease;"></div>
                  
                  <div style="display: flex; justify-content: space-between; position: relative; z-index: 3; padding: 0 5%;">
                    <!-- Node 1 -->
                    <div class="timeline-step-node" id="proteger-node-1" onclick="window.app.conteudosController.switchProtegerStep(1, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">1</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;">Garantias</span>
                    </div>
                    <!-- Node 2 -->
                    <div class="timeline-step-node" id="proteger-node-2" onclick="window.app.conteudosController.switchProtegerStep(2, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">2</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;">Contratos</span>
                    </div>
                    <!-- Node 3 -->
                    <div class="timeline-step-node" id="proteger-node-3" onclick="window.app.conteudosController.switchProtegerStep(3, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">3</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;">Pendências</span>
                    </div>
                    <!-- Node 4 -->
                    <div class="timeline-step-node" id="proteger-node-4" onclick="window.app.conteudosController.switchProtegerStep(4, true)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                      <div class="step-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #1a1f2e; border: 2.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #8c96ab; transition: all 0.3s;">4</div>
                      <span class="timeline-step-label" style="font-size: 8px; opacity: 0.7; margin-top: 4px;">Checklist</span>
                    </div>
                  </div>
                </div>

                <!-- Step 1 Content: Garantias -->
                <div id="proteger-step-content-1" class="proteger-step-content" style="display: block;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size: 11px; color: #fff; font-weight: 700;">📂 Pasta de Garantias & Contatos</h4>
                    <button class="btn btn-secondary btn-mini" onclick="window.app.conteudosController.openAddGarantiaModal()" style="width: auto; padding: 4px 8px; font-size: 10px; border-color: rgba(191,90,242,0.3); color: #bf5af2; background: rgba(191,90,242,0.05);">➕ Nova Garantia</button>
                  </div>
                  <div style="overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Fornecedor/Produto</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Validade</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Contato</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase; width: 60px;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="proteger-garantias-tbody">
                        <!-- Loaded dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Step 2 Content: Contratos -->
                <div id="proteger-step-content-2" class="proteger-step-content" style="display: none;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size: 11px; color: #fff; font-weight: 700;">📂 Contratos de Empreiteiro & Fornecedores</h4>
                    <button class="btn btn-secondary btn-mini" onclick="window.app.conteudosController.openAddContratoModal()" style="width: auto; padding: 4px 8px; font-size: 10px; border-color: rgba(191,90,242,0.3); color: #bf5af2; background: rgba(191,90,242,0.05);">➕ Novo Contrato</button>
                  </div>
                  <div style="overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Serviço/Objeto</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Empresa/Profissional</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Valor total</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase; width: 60px;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="proteger-contratos-tbody">
                        <!-- Loaded dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Step 3 Content: Pendências -->
                <div id="proteger-step-content-3" class="proteger-step-content" style="display: none;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size: 11px; color: #fff; font-weight: 700;">📂 Histórico de Pendências Encontradas</h4>
                    <button class="btn btn-secondary btn-mini" onclick="window.app.conteudosController.openAddPendenciaModal()" style="width: auto; padding: 4px 8px; font-size: 10px; border-color: rgba(191,90,242,0.3); color: #bf5af2; background: rgba(191,90,242,0.05);">➕ Nova Pendência</button>
                  </div>
                  <div style="overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 320px;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Pendência/Detalhe</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Ambiente</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase;">Status</th>
                          <th style="font-size: 8px; color: #8c96ab; padding-bottom: 6px; text-transform: uppercase; width: 60px;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="proteger-pendencias-tbody">
                        <!-- Loaded dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Step 4 Content: Checklist final -->
                <div id="proteger-step-content-4" class="proteger-step-content" style="display: none;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size: 11px; color: #fff; font-weight: 700;">📋 Vistoria de Entrega Final da Obra</h4>
                    <span style="font-size: 9px; color: #8c96ab;">Complete a vistoria antes de pagar o saldo retido.</span>
                  </div>
                  
                  <div style="display: flex; flex-direction: column; gap: 8px;" id="proteger-checklist-container">
                    <!-- Loaded dynamically -->
                  </div>
                </div>
              </div>

              <!-- EM DÚVIDA? Footer -->
              <div class="glass-card redirect-decidir-footer" onclick="window.app.switchTab('decidir'); window.app.decisoesController.switchDecidirSubTab('biblioteca');" style="padding: 16px; margin: 16px 0 80px 0; background: rgba(191, 90, 242, 0.03); border: 1.5px solid rgba(191, 90, 242, 0.25); border-radius: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; text-align: left; transition: all 0.2s ease-in-out;" onmouseover="this.style.background='rgba(191, 90, 242, 0.06)'" onmouseout="this.style.background='rgba(191, 90, 242, 0.03)'">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(191, 90, 242, 0.1); border: 1px solid rgba(191, 90, 242, 0.25); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">💡</div>
                  <div>
                    <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #fff; margin: 0 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px;">EM DÚVIDA?</h4>
                    <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.3;">Consulte os materiais, protocolos e guias na aba <span style="color: #bf5af2; font-weight: 700;">Central de Apoio</span> e proteja sua reforma com segurança.</p>
                  </div>
                </div>
                <div class="btn btn-secondary btn-mini" style="display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: rgba(191,90,242,0.05); border-color: rgba(191,90,242,0.3); color: #bf5af2; font-family: inherit; font-size: 11px; font-weight: 700; width: auto; flex-shrink: 0; border-radius: 10px;">
                  📖 Ir para Central de Apoio ➔
                </div>
              </div>
            </div>
            
            """
    html = html[:idx1] + new_proteger_block + html[idx2:]
else:
    print("Error: Proteger markers not found!")

# 4. Replace tab-decidir block
print("Replacing Decidir...")
decidir_start = "<!-- =============== TAB 4: DECIDIR (PROTOCOLOS) =============== -->"
nav_start = "<!-- FLOATING NAVIGATION TAB BAR -->"

idx1 = html.find(decidir_start)
idx2 = html.find(nav_start)

if idx1 != -1 and idx2 != -1:
    new_decidir_block = """<!-- =============== TAB 4: DECIDIR (PROTOCOLOS) =============== -->
            <div id="tab-decidir" class="tab-view">
              <!-- Segmented Control for Decidir Sub-Views -->
              <div class="tool-segmented-control" style="margin-bottom: 16px; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 12px; display: flex; gap: 4px; border: 1px solid var(--border-glass);">
                <button class="segment-btn active" id="decidir-tab-dilemas" onclick="window.app.decisoesController.switchDecidirSubTab('dilemas')" style="flex: 1; padding: 10px; font-size: 11px; border-radius: 8px; border: none; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s;">🧠 Dilemas (Protocolos)</button>
                <button class="segment-btn" id="decidir-tab-biblioteca" onclick="window.app.decisoesController.switchDecidirSubTab('biblioteca')" style="flex: 1; padding: 10px; font-size: 11px; border-radius: 8px; border: none; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s;">📚 Biblioteca (Guias)</button>
              </div>

              <!-- ==================== SUB-VIEW: DILEMAS & PROTOCOLOS ==================== -->
              <div id="decidir-dilemas-view" class="decidir-sub-view">
                <!-- Header Banner -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; margin-bottom: 20px; text-align: left;">
                  <span style="font-size: 8px; font-weight: 700; color: #ff9f0a; text-transform: uppercase; letter-spacing: 0.8px;">Central Estratégica</span>
                  <h2 style="font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin: 2px 0 0 0;">Protocolos de Decisão</h2>
                  <p style="font-size: 11px; color: #8c96ab; margin: 4px 0 0 0;">Não sabe o que escolher? O Método 3P mostra exatamente o que analisar antes de tomar qualquer decisão na sua obra e evitar prejuízos.</p>
                </div>

                <!-- ANTES DE APROVAR QUALQUER GASTO -->
                <div class="glass-card" style="padding: 16px; margin-bottom: 20px; text-align: left; background: rgba(255, 106, 0, 0.04); border: 1.5px solid rgba(255, 106, 0, 0.25); border-radius: 16px;">
                  <div style="display: flex; gap: 12px; align-items: center;">
                    <span style="font-size: 24px;">⚠️</span>
                    <div>
                      <strong style="font-size: 11px; color: #ff9f0a; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">ANTES DE APROVAR QUALQUER GASTO</strong>
                      <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.3;">Consulte o protocolo correspondente. 5 minutos aqui podem evitar milhares de reais em retrabalho depois.</p>
                    </div>
                  </div>
                </div>

                <!-- DECISÕES QUE EVITAM PREJUÍZO -->
                <div style="text-align: left; margin-bottom: 20px;">
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">DECISÕES QUE EVITAM PREJUÍZO</h3>
                  
                  <!-- Search box for quick filters -->
                  <div class="search-input-container" style="position: relative; display: flex; align-items: center; margin-bottom: 16px;">
                    <input type="text" id="decidir-search-input" class="form-control search-input" placeholder="Buscar protocolos por ambiente, acabamento..." oninput="window.app.decisoesController.filterDecidirCards()" style="padding: 10px 14px; font-size: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff; width: 100%; outline: none;">
                  </div>
                  
                  <!-- Environments grid -->
                  <div class="environments-progress-grid" id="decidir-environments-grid" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 80px;">
                    <!-- Cozinha -->
                    <div class="environment-progress-card glass-card" data-env-name="cozinha" style="padding: 16px; display: flex; align-items: center; gap: 16px; background: rgba(15,18,26,0.45); border: 1px solid var(--border-glass); border-radius: 16px;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🍳</div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin: 0;">COZINHA</h4>
                          <span style="font-size: 11px; font-weight: 700; color: #ff9f0a;" id="decidir-env-pct-cozinha">0%</span>
                        </div>
                        <p style="font-size: 10px; color: #8c96ab; margin: 0 0 10px 0; line-height: 1.4;">Saiba exatamente o que avaliar antes de aprovar móveis, acabamentos e equipamentos.</p>
                        <button class="btn btn-secondary btn-mini" onclick="window.app.decisoesController.openEnvironmentProtocol('cozinha')" style="width: auto; padding: 6px 12px; font-size: 10px; border-color: rgba(255,159,10,0.3); color: #ff9f0a; background: transparent;">Ver Protocolos ➔</button>
                      </div>
                    </div>

                    <!-- Banheiro -->
                    <div class="environment-progress-card glass-card" data-env-name="banheiro" style="padding: 16px; display: flex; align-items: center; gap: 16px; background: rgba(15,18,26,0.45); border: 1px solid var(--border-glass); border-radius: 16px;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🛁</div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin: 0;">BANHEIRO</h4>
                          <span style="font-size: 11px; font-weight: 700; color: #ff9f0a;" id="decidir-env-pct-banheiro">0%</span>
                        </div>
                        <p style="font-size: 10px; color: #8c96ab; margin: 0 0 10px 0; line-height: 1.4;">Evite escolhas que geram retrabalho, manutenção precoce e gastos desnecessários.</p>
                        <button class="btn btn-secondary btn-mini" onclick="window.app.decisoesController.openEnvironmentProtocol('banheiro')" style="width: auto; padding: 6px 12px; font-size: 10px; border-color: rgba(255,159,10,0.3); color: #ff9f0a; background: transparent;">Ver Protocolos ➔</button>
                      </div>
                    </div>

                    <!-- Quarto -->
                    <div class="environment-progress-card glass-card" data-env-name="quarto" style="padding: 16px; display: flex; align-items: center; gap: 16px; background: rgba(15,18,26,0.45); border: 1px solid var(--border-glass); border-radius: 16px;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🛏️</div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin: 0;">QUARTO</h4>
                          <span style="font-size: 11px; font-weight: 700; color: #ff9f0a;" id="decidir-env-pct-quarto">0%</span>
                        </div>
                        <p style="font-size: 10px; color: #8c96ab; margin: 0 0 10px 0; line-height: 1.4;">Tome decisões com clareza antes de gastar dinheiro em itens difíceis de corrigir depois.</p>
                        <button class="btn btn-secondary btn-mini" onclick="window.app.decisoesController.openEnvironmentProtocol('quarto')" style="width: auto; padding: 6px 12px; font-size: 10px; border-color: rgba(255,159,10,0.3); color: #ff9f0a; background: transparent;">Ver Protocolos ➔</button>
                      </div>
                    </div>

                    <!-- Sala -->
                    <div class="environment-progress-card glass-card" data-env-name="sala" style="padding: 16px; display: flex; align-items: center; gap: 16px; background: rgba(15,18,26,0.45); border: 1px solid var(--border-glass); border-radius: 16px;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">📺</div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin: 0;">SALA DE ESTAR</h4>
                          <span style="font-size: 11px; font-weight: 700; color: #ff9f0a;" id="decidir-env-pct-sala">0%</span>
                        </div>
                        <p style="font-size: 10px; color: #8c96ab; margin: 0 0 10px 0; line-height: 1.4;">Crie ambientes funcionais e acolhedores sem extrapolar o orçamento.</p>
                        <button class="btn btn-secondary btn-mini" onclick="window.app.decisoesController.openEnvironmentProtocol('sala')" style="width: auto; padding: 6px 12px; font-size: 10px; border-color: rgba(255,159,10,0.3); color: #ff9f0a; background: transparent;">Ver Protocolos ➔</button>
                      </div>
                    </div>

                    <!-- Área Externa -->
                    <div class="environment-progress-card glass-card" data-env-name="area_externa" style="padding: 16px; display: flex; align-items: center; gap: 16px; background: rgba(15,18,26,0.45); border: 1px solid var(--border-glass); border-radius: 16px;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🪴</div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin: 0;">ÁREA EXTERNA</h4>
                          <span style="font-size: 11px; font-weight: 700; color: #ff9f0a;" id="decidir-env-pct-area_externa">0%</span>
                        </div>
                        <p style="font-size: 10px; color: #8c96ab; margin: 0 0 10px 0; line-height: 1.4;">Decisões certas para áreas externas seguras, duráveis e que valorizam sua obra.</p>
                        <button class="btn btn-secondary btn-mini" onclick="window.app.decisoesController.openEnvironmentProtocol('area_externa')" style="width: auto; padding: 6px 12px; font-size: 10px; border-color: rgba(255,159,10,0.3); color: #ff9f0a; background: transparent;">Ver Protocolos ➔</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ==================== SUB-VIEW: BIBLIOTECA & PDFS ==================== -->
              <div id="decidir-biblioteca-view" class="decidir-sub-view" style="display: none;">
                <!-- Header Banner -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; margin-bottom: 20px; text-align: left;">
                  <span style="font-size: 8px; font-weight: 700; color: #ff9f0a; text-transform: uppercase; letter-spacing: 0.8px;">Central de Apoio</span>
                  <h2 style="font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin: 2px 0 0 0;">Biblioteca de Apoio</h2>
                  <p style="font-size: 11px; color: #8c96ab; margin: 4px 0 0 0;">Materiais, protocolos e estratégias para tomar as melhores decisões na sua reforma.</p>
                </div>

                <!-- Search Bar -->
                <div class="library-search-wrapper" style="margin-bottom: 16px; text-align: left;">
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #fff; margin: 0 0 10px 0;">Buscar na Biblioteca</h3>
                  <div class="search-input-container" style="position: relative; display: flex; align-items: center;">
                    <input type="text" id="library-search-input" class="form-control search-input" placeholder="Buscar guias por palavra-chave (ex: porcelanato, cimento...)" oninput="window.app.conteudosController.searchLibrary()" style="padding: 10px 14px; font-size: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff; width: 100%; outline: none;">
                  </div>
                </div>
                
                <!-- Filter Tags -->
                <div class="library-tags-scroll" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; border: none; width: 100%;">
                  <span class="tag-filter active" onclick="window.app.conteudosController.filterLibrary('all', this)" style="padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: var(--transition-smooth); color: #fff;">Todos</span>
                  <span class="tag-filter" onclick="window.app.conteudosController.filterLibrary('planejamento', this)" style="padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: var(--transition-smooth); color: #fff;">Fase 1 (Planejar)</span>
                  <span class="tag-filter" onclick="window.app.conteudosController.filterLibrary('financeiro', this)" style="padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: var(--transition-smooth); color: #fff;">Fase 2 (Prevenir)</span>
                  <span class="tag-filter" onclick="window.app.conteudosController.filterLibrary('contratos', this)" style="padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: var(--transition-smooth); color: #fff;">Fase 3 (Proteger)</span>
                </div>

                <!-- Environment cards / PDF grid list (loaded dynamically) -->
                <div style="text-align: left; margin-bottom: 20px;">
                  <h3 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Guias por Ambiente</h3>
                  
                  <div class="library-pdf-grid" id="library-grid-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                    <!-- Loaded dynamically -->
                  </div>
                </div>
                
                <!-- Bottom card banner: Aprofunde suas decisões -->
                <div class="glass-card" style="padding: 16px; margin: 16px 0 80px 0; background: rgba(255, 106, 0, 0.03); border: 1.5px solid rgba(255, 106, 0, 0.25); border-radius: 16px; display: flex; align-items: center; gap: 12px; text-align: left;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,106,0,0.08); border: 1.5px solid rgba(255,106,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">📚</div>
                  <div>
                    <strong style="font-size: 11px; color: #ff9f0a; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">APROFUNDE SUAS DECISÕES</strong>
                    <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.3;">Acesse guias, modelos, contratos e estratégias para fazer escolhas inteligentes e proteger seu investimento até o final da obra.</p>
                  </div>
                </div>
              </div>
            </div>

            """
    html = html[:idx1] + new_decidir_block + html[idx2:]
else:
    print("Error: Decidir markers not found!")

# Write output back to index.html
with open("e:/desenvolvimento/Reformasemerro/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Saved index.html successfully! Final length:", len(html))
