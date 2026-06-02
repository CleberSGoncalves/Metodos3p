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
  }

  // Renders the list of environments in the "Protocolos" section
  renderEnvironmentsGrid() {
    const grid = document.getElementById('protocolos-environments-grid');
    if (!grid) return;
    
    // Only show environments the user selected
    const envs = this.app.selectedEnvironments && this.app.selectedEnvironments.length > 0 
      ? this.app.selectedEnvironments 
      : Object.keys(METODO_3P_DATABASE.checklists);

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
    this.activeEnvironment = null;
    document.getElementById('protocolos-environments-grid').style.display = 'flex';
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
    
    const library = METODO_3P_DATABASE.library || [];
    
    // Filter PDFs by active environment and active phase
    // Since our DB doesn't have exact phase mapping for all PDFs, we do a basic filter:
    let filtered = library.filter(pdf => {
      // Allow if it matches the phase category (planejamento, tecnico, contratos...)
      // Fake logic just for demo:
      if (this.activePhase === 'planejar' && pdf.category !== 'planejamento' && pdf.category !== 'contratos') return false;
      if (this.activePhase === 'prevenir' && pdf.category !== 'tecnico') return false;
      if (this.activePhase === 'proteger' && pdf.category !== 'tecnico') return false;
      
      // If environment is specific (like banheiro), we could filter by tags.
      // But to avoid empty lists, if the tag doesn't match we include it randomly or if no specific tag.
      return true;
    });

    // If empty, fallback to some default ones
    if (filtered.length === 0) {
      filtered = library.slice(0, 3);
    }

    listContainer.innerHTML = filtered.map(pdf => `
      <div class="library-item-card" onclick="window.app.conteudosController.openPdf('${pdf.id}')" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 12px; padding: 12px; display: flex; gap: 12px; cursor: pointer; transition: transform 0.2s;">
        <div class="library-item-icon" style="background: rgba(255,106,0,0.1); color: var(--primary-orange); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
          📄
        </div>
        <div style="flex: 1; text-align: left;">
          <h4 style="font-size: 13px; font-weight: 700; color: #fff; margin: 0 0 4px 0;">${pdf.title}</h4>
          <p style="font-size: 10px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 6px 0;">
            ${pdf.desc.substring(0, 80)}...
          </p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${pdf.tags.slice(0,2).map(t => `<span style="font-size: 9px; font-weight: 600; color: #8c96ab; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">#${t}</span>`).join('')}
            <span style="font-size: 9px; font-weight: 600; color: var(--primary-orange); background: rgba(255,106,0,0.1); padding: 2px 6px; border-radius: 4px;">${pdf.pages} Páginas</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}
