// ==========================================================================
// DECISIONS MODULE - PILAR 2: PROTOCOLOS DE DECISÃO (POR AMBIENTE E FASE)
// ==========================================================================

class DecisionsController {
  constructor(app) {
    this.app = app;
    this.activeEnvironment = null;
    this.activePhase = 'planejar';
  }

  init() {
    this.renderEnvironmentsGrid();
    this.loadSavedQuotes();
    
    // Select default active environment
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    const activeSaved = localStorage.getItem('reformas_3p_active_env');
    if (activeSaved && !this.app.paywallController.isEnvironmentLocked(activeSaved)) {
      this.activeEnvironment = activeSaved;
    } else {
      const unlocked = allEnvIds.find(id => !this.app.paywallController.isEnvironmentLocked(id));
      this.activeEnvironment = unlocked || 'cozinha';
    }

    // Register decisionPoints
    this.decisionPoints = {
      cozinha: [
        { id: 'coz-dp-1', category: 'Layout', topic: 'Layout da Bancada e Triângulo de Trabalho', docId: 'pdf-doc', statusKey: 'coz-pl-1' },
        { id: 'coz-dp-2', category: 'Materiais', topic: 'Escolha de Rejunte (Epóxi vs Acrílico)', docId: 'pdf-1', statusKey: 'coz-pt-1' },
        { id: 'coz-dp-3', category: 'Equipamentos', topic: 'Dimensionamento de Tomadas e Cargas (20A)', docId: 'pdf-7', statusKey: 'coz-pl-2' }
      ],
      banheiro: [
        { id: 'ban-dp-1', category: 'Layout', topic: 'Eixo do Vaso e Distâncias Laterais', docId: 'pdf-doc', statusKey: 'ban-pl-1' },
        { id: 'ban-dp-2', category: 'Materiais', topic: 'Impermeabilização Estrutural do Box', docId: 'pdf-1', statusKey: 'ban-pr-1' },
        { id: 'ban-dp-3', category: 'Equipamentos', topic: 'Ponto do Chuveiro e Disjuntor Dedicado', docId: 'pdf-7', statusKey: 'ban-pl-3' }
      ],
      sala: [
        { id: 'sal-dp-1', category: 'Layout', topic: 'Layout de Painel de TV e Tomadas de Sinal', docId: 'pdf-doc', statusKey: 'sal-pt-1' },
        { id: 'sal-dp-2', category: 'Materiais', topic: 'Tipo de Porcelanato (Retificado vs Polido)', docId: 'pdf-6', statusKey: 'sal-pr-1' },
        { id: 'sal-dp-3', category: 'Equipamentos', topic: 'Dispositivos de Proteção contra Surtos (DPS)', docId: 'pdf-7', statusKey: 'sal-pt-1' }
      ],
      quarto: [
        { id: 'qua-dp-1', category: 'Layout', topic: 'Layout de Guarda-Roupa e Paredes Hidráulicas', docId: 'pdf-doc', statusKey: 'qua-pl-1' },
        { id: 'qua-dp-2', category: 'Materiais', topic: 'Piso Vinílico vs Laminado (Conforto Acústico)', docId: 'pdf-6', statusKey: 'qua-pr-1' },
        { id: 'qua-dp-3', category: 'Equipamentos', topic: 'Pontos de Ar Condicionado e Drenos', docId: 'pdf-7', statusKey: 'qua-pl-3' }
      ],
      area_externa: [
        { id: 'ext-dp-1', category: 'Layout', topic: 'Caimento de Ralos e Escoamento de Chuvas', docId: 'pdf-doc', statusKey: 'ext-pl-1' },
        { id: 'ext-dp-2', category: 'Materiais', topic: 'Impermeabilização de Laje Externa (Manta)', docId: 'pdf-1', statusKey: 'ext-pr-1' },
        { id: 'ext-dp-3', category: 'Equipamentos', topic: 'Iluminação Externa Blindada contra Vapor (IP65)', docId: 'pdf-8', statusKey: 'ext-pl-2' }
      ]
    };
    
    this.renderDecidirEnvironmentsScroll();
    this.renderDecidirPontos();
    this.updateDecidirStats();
  }

  // Renders the list of environments in the "Protocolos" section
  renderEnvironmentsGrid() {
    const grid = document.getElementById('protocolos-environments-grid');
    if (!grid) return;
    
    // Mostra todos os ambientes válidos
    const envs = Object.keys(METODO_3P_DATABASE.checklists).filter(k => k !== 'areas');

    grid.innerHTML = envs.map(envId => {
      const envData = METODO_3P_DATABASE.checklists[envId];
      if (!envData) return '';
      
      const isLocked = this.app.paywallController.isEnvironmentLocked(envId);
      
      const bgImages = {
        'cozinha': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',
        'banheiro': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
        'quarto': 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=500&q=80',
        'sala': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=500&q=80',
        'area_externa': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=500&q=80'
      };
      const bgImg = bgImages[envId] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80';

      return `
        <div class="glass-card premium-protocol-card ${isLocked ? 'locked' : ''}" style="position: relative; overflow: hidden; padding: 16px; min-height: 140px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-glass); margin-bottom: 8px; border-radius: 16px;">
          <!-- Background Image with Overlay -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('${bgImg}') center/cover; opacity: 0.35; z-index: 1;"></div>
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(15,18,26,1) 0%, rgba(15,18,26,0.6) 100%); z-index: 2;"></div>

          <!-- Content (z-index 3) -->
          <div style="position: relative; z-index: 3;">
            <h3 style="font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800; color: #fff; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px; text-transform: uppercase;">
              <span>${envData.emoji || '📄'}</span> ${envData.name}
              ${isLocked ? '<span style="font-size: 9px; color: #ff453a; background: rgba(255,69,58,0.1); padding: 2px 6px; border-radius: 4px; margin-left: auto;">🔒 BLOQUEADO</span>' : ''}
            </h3>
            
            <ul style="list-style: none; padding: 0; margin: 0 0 16px 0; font-size: 10px; color: #8c96ab; display: flex; flex-direction: column; gap: 5px; text-align: left;">
              <li style="display: flex; align-items: center; gap: 6px;"><span style="color: var(--primary-orange); font-weight: bold;">✓</span> O que priorizar</li>
              <li style="display: flex; align-items: center; gap: 6px;"><span style="color: var(--primary-orange); font-weight: bold;">✓</span> O que evitar</li>
              <li style="display: flex; align-items: center; gap: 6px;"><span style="color: var(--primary-orange); font-weight: bold;">✓</span> Recomendações inteligentes</li>
              <li style="display: flex; align-items: center; gap: 6px;"><span style="color: var(--primary-orange); font-weight: bold;">✓</span> Proteção financeira</li>
            </ul>

            <div style="display: flex; gap: 8px;">
              <button onclick="window.app.decisoesController.openEnvironment('${envId}')" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #8c96ab; padding: 10px 4px; border-radius: 8px; font-size: 9px; font-weight: 700; cursor: pointer; transition: background 0.2s;">VER PROTOCOLO</button>
              <button onclick="window.app.decisoesController.openEnvironment('${envId}')" style="flex: 1; background: var(--primary-gradient); border: none; color: #fff; padding: 10px 4px; border-radius: 8px; font-size: 9px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;">INICIAR PLANEJAMENTO</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openEnvironment(envId) {
    if (this.app.paywallController.isEnvironmentLocked(envId)) {
      this.app.paywallController.triggerEnvironmentPurchase(envId);
      return;
    }
    
    this.activeEnvironment = envId;
    this.activePhase = 'planejar'; // always reset to planejar
    
    const envData = METODO_3P_DATABASE.checklists[envId];
    document.getElementById('protocolos-env-detail-title').innerHTML = `${envData.emoji || '📄'} Protocolos: ${envData.name}`;
    
    document.getElementById('protocolos-environments-grid').style.display = 'none';
    document.getElementById('protocolos-env-detail-area').style.display = 'flex';
    
    this.switchEnvironmentPhase(this.activePhase);
  }

  closeEnvironmentProtocols() {
    if (!this.activeEnvironment) return;
    this.activeEnvironment = null;
    document.getElementById('protocolos-environments-grid').style.display = '';
    document.getElementById('protocolos-env-detail-area').style.display = 'none';
  }

  switchEnvironmentPhase(phase) {
    this.activePhase = phase;
    
    // Update active button state
    ['planejar', 'prevenir', 'proteger'].forEach(p => {
      const btn = document.getElementById(`protocolos-phase-btn-${p}`);
      if (btn) btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`protocolos-phase-btn-${phase}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    this.renderPDFs();
  }

  renderPDFs() {
    const listContainer = document.getElementById('protocolos-pdfs-list');
    if (!listContainer) return;
    
    // Mapeamento dos links reais do Gamma conforme o usuário forneceu
    const GAMMA_LINKS = {
      cozinha: {
        planejar: [
          { title: 'Protocolo de Decisão — Cozinha', url: 'https://gamma.app/docs/PROTOCOLO-DE-DECISAO-COZINHA--yvyrdi7dit8yxd7' }
        ],
        prevenir: [],
        proteger: []
      },
      sala: {
        planejar: [
          { title: 'Protocolo de Decisão — Sala', url: 'https://gamma.app/docs/PROTOCOLO-DECISAO-SALA-0xaifmkls6novgn' }
        ],
        prevenir: [],
        proteger: []
      },
      quarto: {
        planejar: [
          { title: 'Protocolo de Decisão — Quarto', url: 'https://gamma.app/docs/PROTOCOLO-DE-DECISAO-QUARTO-ndlbc3vlcqroiy2' }
        ],
        prevenir: [],
        proteger: []
      },
      banheiro: {
        planejar: [
          { title: 'Protocolo de Decisão — Banheiro', url: 'https://gamma.app/docs/PROTOCOLO-DE-DECISAO-BANHEIRO-7ihshc0wsdnwjrl' }
        ],
        prevenir: [],
        proteger: []
      },
      area_externa: {
        planejar: [
          { title: 'Protocolo de Decisão — Área Externa', url: 'https://gamma.app/docs/PROTOCOLO-DECISAO-AREA-EXTERNA-jlggd1eqc2obftv' }
        ],
        prevenir: [],
        proteger: []
      }
    };

    const envLinks = GAMMA_LINKS[this.activeEnvironment] || { planejar: [], prevenir: [], proteger: [] };
    const phaseLinks = envLinks[this.activePhase] || [];

    if (phaseLinks.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #8c96ab;">
          <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;">📭</div>
          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; margin-bottom: 8px;">Nenhum protocolo disponível</h4>
          <p style="font-size: 12px;">Os guias para esta fase e ambiente estão sendo elaborados pela nossa equipe.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = phaseLinks.map(pdf => {
      const isLocked = pdf.url === '#';
      const clickAction = isLocked 
        ? `alert('Protocolo em elaboração. Estará disponível em breve!')` 
        : `window.open('${pdf.url}', '_blank')`;
        
      return `
      <div class="library-item-card" onclick="${clickAction}" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: transform 0.2s; margin-bottom: 8px;">
        <div class="library-item-icon" style="background: rgba(255,106,0,0.1); color: var(--primary-orange); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
          📄
        </div>
        <div style="flex: 1; text-align: left;">
          <h4 style="font-size: 13px; font-weight: 700; color: #fff; margin: 0 0 4px 0;">${pdf.title}</h4>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${isLocked 
              ? '<span style="font-size: 9px; font-weight: 600; color: #ff453a; background: rgba(255,69,58,0.1); padding: 2px 6px; border-radius: 4px;">Em Elaboração 🔒</span>'
              : '<span style="font-size: 9px; font-weight: 600; color: var(--primary-orange); background: rgba(255,106,0,0.1); padding: 2px 6px; border-radius: 4px;">Abrir no Gamma ➔</span>'
            }
          </div>
        </div>
      </div>
      `;
    }).join('');
  }

  compareQuotes(avoidScroll = false) {
    const s1Name = document.getElementById('quote-s1-name')?.value || "Fornecedor A";
    const s1Price = parseFloat(document.getElementById('quote-s1-price')?.value) || 0;
    const s1Risk = parseInt(document.getElementById('quote-s1-risk')?.value) || 0;

    const s2Name = document.getElementById('quote-s2-name')?.value || "Fornecedor B";
    const s2Price = parseFloat(document.getElementById('quote-s2-price')?.value) || 0;
    const s2Risk = parseInt(document.getElementById('quote-s2-risk')?.value) || 0;

    const s3Name = document.getElementById('quote-s3-name')?.value || "Fornecedor C";
    const s3Price = parseFloat(document.getElementById('quote-s3-price')?.value) || 0;
    const s3Risk = parseInt(document.getElementById('quote-s3-risk')?.value) || 0;

    const suppliers = [];
    if (s1Price > 0) suppliers.push({ name: s1Name, price: s1Price, risk: s1Risk, cardId: 's1' });
    if (s2Price > 0) suppliers.push({ name: s2Name, price: s2Price, risk: s2Risk, cardId: 's2' });
    if (s3Price > 0) suppliers.push({ name: s3Name, price: s3Price, risk: s3Risk, cardId: 's3' });

    if (suppliers.length === 0) {
      alert("Por favor, preencha o valor de pelo menos um fornecedor para comparar.");
      return;
    }

    // Calculate adjusted cost
    suppliers.forEach(s => {
      s.adjustedCost = s.price * (1 + s.risk / 100);
    });

    // Sort by adjusted cost (lowest is best)
    suppliers.sort((a, b) => a.adjustedCost - b.adjustedCost);

    // Render results
    const resultBox = document.getElementById('quotes-result-box');
    const cardsContainer = document.getElementById('quotes-cards-container');

    if (resultBox && cardsContainer) {
      cardsContainer.innerHTML = suppliers.map((s, idx) => {
        const isRecommended = idx === 0;
        const ribbon = isRecommended ? `<div class="recommended-ribbon">RECOMENDADO ⭐</div>` : '';
        const cardClass = isRecommended ? 'supplier-comparative-card recommended' : 'supplier-comparative-card';
        
        let riskClass = 'safe';
        let riskLabel = 'Seguro (0%)';
        if (s.risk === 15) {
          riskClass = 'alert';
          riskLabel = 'Atenção (15%)';
        } else if (s.risk === 40) {
          riskClass = 'danger';
          riskLabel = 'Perigo (40%)';
        }

        const riskConsequence = s.risk === 0 
          ? 'Fornecedor seguro. Baixo risco de atrasos ou retrabalho.'
          : (s.risk === 15 
            ? 'Risco moderado. Monitore as entregas de perto para evitar atrasos.' 
            : 'Risco alto! Perigo elevado de paralisação e prejuízos no canteiro.');

        return `
          <div class="${cardClass}">
            ${ribbon}
            <div class="sup-comp-name">${s.name}</div>
            
            <div class="sup-comp-stat">
              <span>Preço Nominal:</span>
              <span class="sup-comp-val">${this.app.financeiroController.formatCurrency(s.price)}</span>
            </div>
            <div class="sup-comp-stat">
              <span>Nível de Risco:</span>
              <span class="sup-comp-val ${riskClass}">${riskLabel}</span>
            </div>
            <div class="sup-comp-stat" style="border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 8px; margin-top: 4px;">
              <strong>Custo Ajustado:</strong>
              <strong class="sup-comp-val ${isRecommended ? 'safe' : ''}">${this.app.financeiroController.formatCurrency(s.adjustedCost)}</strong>
            </div>
            
            <div class="sup-comp-warning-text">
              ${riskConsequence}
            </div>
          </div>
        `;
      }).join('');

      resultBox.style.display = 'block';
      
      // Save state to localStorage to persist Step 5 done status
      localStorage.setItem('reformas_3p_quotes_completed', 'true');
      localStorage.setItem('reformas_3p_quotes_saved', JSON.stringify(suppliers));

      // Save raw input values so we can reload the input form exactly as the user typed
      const rawQuotesData = {
        itemName: document.getElementById('quote-item-name')?.value || "",
        s1: {
          name: document.getElementById('quote-s1-name')?.value || "",
          price: document.getElementById('quote-s1-price')?.value || "",
          risk: document.getElementById('quote-s1-risk')?.value || "0"
        },
        s2: {
          name: document.getElementById('quote-s2-name')?.value || "",
          price: document.getElementById('quote-s2-price')?.value || "",
          risk: document.getElementById('quote-s2-risk')?.value || "0"
        },
        s3: {
          name: document.getElementById('quote-s3-name')?.value || "",
          price: document.getElementById('quote-s3-price')?.value || "",
          risk: document.getElementById('quote-s3-risk')?.value || "0"
        }
      };
      localStorage.setItem('reformas_3p_raw_quotes_data', JSON.stringify(rawQuotesData));

      // Scroll to result box smoothly
      if (!avoidScroll) {
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Update dashboard to reflect quotation changes and metrics immediately
      if (this.app.financeiroController) {
        this.app.financeiroController.renderDashboardCentral();
      }
    }
  }

  loadSavedQuotes() {
    try {
      const rawDataStr = localStorage.getItem('reformas_3p_raw_quotes_data');
      if (rawDataStr) {
        const rawData = JSON.parse(rawDataStr);
        
        const itemInput = document.getElementById('quote-item-name');
        if (itemInput && rawData.itemName) itemInput.value = rawData.itemName;
        
        ['s1', 's2', 's3'].forEach(key => {
          const nameInput = document.getElementById(`quote-${key}-name`);
          const priceInput = document.getElementById(`quote-${key}-price`);
          const riskInput = document.getElementById(`quote-${key}-risk`);
          
          if (nameInput && rawData[key]?.name !== undefined) nameInput.value = rawData[key].name;
          if (priceInput && rawData[key]?.price !== undefined) priceInput.value = rawData[key].price;
          if (riskInput && rawData[key]?.risk !== undefined) riskInput.value = rawData[key].risk;
        });
      }
      
      const completed = localStorage.getItem('reformas_3p_quotes_completed');
      if (completed === 'true') {
        this.compareQuotes(true); // pass true to avoid scroll on auto-load
      }
    } catch (e) {
      console.warn("Error loading saved quotes:", e);
    }
  }

  // ==========================================
  // PHASE DECIDIR METHODS
  // ==========================================
  renderDecidirEnvironmentsScroll() {
    const container = document.getElementById('decidir-environments-scroll');
    if (!container) return;
    
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa', 'casa_completa'];
    
    const colorMap = {
      cozinha: '#bf5af2', // purple
      banheiro: '#30b0c7', // cyan
      sala: '#32d74b', // green
      quarto: '#0088ff', // blue
      area_externa: '#ff9f0a', // yellow
      casa_completa: '#ff6a00' // orange
    };
    
    container.innerHTML = allEnvIds.map(envId => {
      let emoji = '';
      let name = '';
      let isLocked = false;
      let solvedCount = 0;
      let totalCount = 0;
      
      if (envId === 'casa_completa') {
        emoji = '🏠';
        name = 'Casa Completa';
        isLocked = false;
        
        // Sum all solved decision points
        Object.keys(this.decisionPoints).forEach(key => {
          this.decisionPoints[key].forEach(dp => {
            totalCount++;
            if (this.app.conteudosController.tasksProgress[dp.statusKey]) solvedCount++;
          });
        });
      } else {
        const envData = METODO_3P_DATABASE.checklists[envId];
        if (!envData) return '';
        emoji = envData.emoji;
        name = envData.name;
        isLocked = this.app.paywallController.isEnvironmentLocked(envId);
        
        const points = this.decisionPoints[envId] || [];
        totalCount = points.length;
        points.forEach(dp => {
          if (this.app.conteudosController.tasksProgress[dp.statusKey]) solvedCount++;
        });
      }
      
      const progress = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
      const isSelected = this.activeEnvironment === envId;
      const isLockedIcon = isLocked ? ' 🔒' : '';
      const activeClass = isSelected ? 'active pink' : '';
      const color = colorMap[envId] || '#ff2d55';
      
      const label = solvedCount === 1 ? '1 protocolo usado' : `${solvedCount} protocolos usados`;
      
      return `
        <div class="env-carousel-card ${activeClass}" onclick="window.app.decisoesController.selectDecidirEnvironment('${envId}')" style="position: relative; flex-shrink: 0; min-width: 110px;">
          ${isSelected ? `<div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 1.5px solid #0a0b0d; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; font-weight: bold;">✓</div>` : ''}
          <div style="font-size: 20px; margin-bottom: 6px;">${emoji}</div>
          <div style="font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 2px;">${name}${isLockedIcon}</div>
          <div style="font-size: 9px; color: #8c96ab; margin-bottom: 6px;">${label}</div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
            <div style="width: ${progress}%; height: 100%; background: ${color}; border-radius: 2px; transition: width 0.6s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  selectDecidirEnvironment(envId) {
    if (envId !== 'casa_completa' && this.app.paywallController.isEnvironmentLocked(envId)) {
      this.app.paywallController.triggerEnvironmentPurchase(envId);
      return;
    }
    
    this.activeEnvironment = envId;
    localStorage.setItem('reformas_3p_active_env', envId);
    
    this.renderDecidirEnvironmentsScroll();
    this.renderDecidirPontos();
    this.updateDecidirStats();
  }

  renderDecidirPontos() {
    const tbody = document.getElementById('decidir-pontos-table-body');
    if (!tbody) return;
    
    const envId = this.activeEnvironment || 'cozinha';
    let envName = '';
    let points = [];
    
    if (envId === 'casa_completa') {
      envName = 'Casa Completa';
      Object.keys(this.decisionPoints).forEach(key => {
        points.push(...this.decisionPoints[key]);
      });
    } else {
      const envData = METODO_3P_DATABASE.checklists[envId];
      if (!envData) return;
      envName = envData.name;
      points = this.decisionPoints[envId] || [];
    }
    
    const titleEl = document.getElementById('decidir-pontos-title');
    if (titleEl) titleEl.textContent = `2. PONTOS DE DECISÃO DO PROTOCOLO - ${envName.toUpperCase()}`;
    
    if (points.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhum ponto de decisão cadastrado.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = points.map(dp => {
      const isCompleted = !!this.app.conteudosController.tasksProgress[dp.statusKey];
      
      const statusBadge = isCompleted
        ? `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 2px 6px;">Resolvido ✓</span>`
        : `<span class="stats-badge" style="background: rgba(255,45,85,0.1); color: #ff2d55; border: 1px solid rgba(255,45,85,0.2); font-size: 9px; padding: 2px 6px;">Pendente 🧠</span>`;
        
      const actionBtn = `<button class="btn btn-secondary btn-mini" style="font-size: 9px; padding: 2px 6px; border-color: rgba(255,45,85,0.3); color: #ff2d55;" onclick="window.app.decisoesController.toggleDecisionPoint('${dp.statusKey}')">${isCompleted ? 'Reabrir' : 'Decidir ✓'}</button>`;
      
      const guideBtn = `<button class="btn btn-secondary btn-mini" style="font-size: 9px; padding: 2px 6px; border-color: rgba(255,106,0,0.3); color: var(--primary-orange); background: rgba(255,106,0,0.05);" onclick="window.app.conteudosController.openPdfReader('${dp.docId}')">Ver Guia 📖</button>`;
      
      return `
        <tr>
          <td><strong>${dp.category}</strong></td>
          <td>${dp.topic}</td>
          <td>${statusBadge}</td>
          <td>${actionBtn}</td>
          <td>${guideBtn}</td>
        </tr>
      `;
    }).join('');
  }

  toggleDecisionPoint(statusKey) {
    this.app.conteudosController.togglePlanejarTask(statusKey);
    this.renderDecidirPontos();
    this.renderDecidirEnvironmentsScroll();
    this.updateDecidirStats();
  }

  updateDecidirStats() {
    const envId = this.activeEnvironment || 'cozinha';
    let envName = '';
    let envEmoji = '';
    let points = [];
    
    if (envId === 'casa_completa') {
      envName = 'Casa Completa';
      envEmoji = '🏠';
      Object.keys(this.decisionPoints).forEach(key => {
        points.push(...this.decisionPoints[key]);
      });
    } else {
      const envData = METODO_3P_DATABASE.checklists[envId];
      if (!envData) return;
      envName = envData.name;
      envEmoji = envData.emoji;
      points = this.decisionPoints[envId] || [];
    }
    
    // Active Environment details
    const activeEmojiEl = document.getElementById('decidir-active-env-emoji');
    const activeNameEl = document.getElementById('decidir-active-env-name');
    const activeStepsEl = document.getElementById('decidir-active-steps-count');
    const activeCircle = document.getElementById('decidir-active-circle');
    const activePctEl = document.getElementById('decidir-active-pct');
    const activeFullBtn = document.getElementById('decidir-active-full-btn');
    
    if (activeEmojiEl) activeEmojiEl.textContent = envEmoji;
    if (activeNameEl) activeNameEl.textContent = envName;
    
    let completedCount = 0;
    points.forEach(dp => {
      if (this.app.conteudosController.tasksProgress[dp.statusKey]) completedCount++;
    });
    
    if (activeStepsEl) activeStepsEl.textContent = `${completedCount} de ${points.length} concluídas`;
    
    const pct = points.length > 0 ? (completedCount / points.length) * 100 : 0;
    if (activePctEl) activePctEl.textContent = `${pct.toFixed(0)}%`;
    if (activeCircle) {
      const offset = 100 - pct;
      activeCircle.style.strokeDashoffset = offset;
    }
    
    if (activeFullBtn) {
      activeFullBtn.setAttribute('onclick', `window.app.conteudosController.openPdfReader('pdf-doc')`);
    }
    
    // Metric used count (total solved decision points across all environments)
    let totalSolved = 0;
    Object.keys(this.decisionPoints).forEach(key => {
      this.decisionPoints[key].forEach(dp => {
        if (this.app.conteudosController.tasksProgress[dp.statusKey]) totalSolved++;
      });
    });
    
    const usedCountEl = document.getElementById('decidir-metric-used-count');
    if (usedCountEl) usedCountEl.textContent = totalSolved.toString();
    
    // Comparisons and registrations cards count
    const regPdfCountEl = document.getElementById('decidir-reg-pdf-count');
    const regCompCountEl = document.getElementById('decidir-reg-comp-count');
    const regChoiceCountEl = document.getElementById('decidir-reg-choice-count');
    const regDoubtCountEl = document.getElementById('decidir-reg-doubt-count');
    
    if (regPdfCountEl) {
      const savedQuotes = localStorage.getItem('reformas_3p_quotes_saved');
      let quotesCount = 0;
      if (savedQuotes) {
        try { quotesCount = JSON.parse(savedQuotes).length; } catch (e) {}
      }
      regPdfCountEl.textContent = quotesCount.toString();
    }
    if (regCompCountEl) {
      const fin = this.app.financeiroController;
      const count = fin ? fin.plannedItems.length : 0;
      regCompCountEl.textContent = count.toString();
    }
    if (regChoiceCountEl) {
      regChoiceCountEl.textContent = totalSolved.toString();
    }
    if (regDoubtCountEl) {
      const unlockedCount = this.app.selectedEnvironments.length;
      regDoubtCountEl.textContent = unlockedCount.toString();
    }
  }
}
