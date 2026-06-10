// ==========================================================================
// CONTENTS MODULE - PILAR 3: CENTRAL ESTRATÉGICA & CHECKLISTS
// ==========================================================================

class ContentsController {
  constructor(app) {
    this.app = app;
    this.activeEnvironment = null;
    this.activePhase = "planejar";
    this.librarySearchQuery = "";
    this.libraryFilterCategory = "all";
    this.tasksProgress = {}; // Stores task_id: boolean (completed)
    this.activePortalPhase = "planejar";
    this.portalSearchQuery = "";
    
    // Load warranties
    this.warranties = [];
    const savedWarranties = localStorage.getItem('reformas_3p_warranties');
    if (savedWarranties) {
      try {
        this.warranties = JSON.parse(savedWarranties);
      } catch (e) {
        this.warranties = [];
      }
    }

    // Load contracts
    this.contracts = [];
    const savedContracts = localStorage.getItem('reformas_3p_contracts');
    if (savedContracts) {
      try {
        this.contracts = JSON.parse(savedContracts);
      } catch (e) {
        this.contracts = [];
      }
    }

    // Load pendencias
    this.pendencias = [];
    const savedPendencias = localStorage.getItem('reformas_3p_pendencias');
    if (savedPendencias) {
      try {
        this.pendencias = JSON.parse(savedPendencias);
      } catch (e) {
        this.pendencias = [];
      }
    }
    
    this.cronogramaDurations = {
      stage1: 5,
      stage2: 10,
      stage3: 4,
      stage4: 7,
      stage5: 12,
      stage6: 8
    };
    
    // Scanned Priority High Impact structural risks
    this.criticalRisks = [
      {
        id: "coz-pr-1",
        env: "cozinha",
        emoji: "🍳",
        title: "Impermeabilização da Alvenaria (Cozinha)",
        desc: "Evita que a umidade suba pelas paredes e estrague seus móveis planejados de MDF.",
        consequence: "Se não executado: Você perderá os armários planejados da cozinha em menos de 1 ano por estufamento e mofo."
      },
      {
        id: "coz-pr-2",
        env: "cozinha",
        emoji: "🍳",
        title: "Teste de Pressão Hidráulica (Cozinha)",
        desc: "Garante que não haja microvazamentos antes de fechar as paredes com cerâmica.",
        consequence: "Se não executado: Um microvazamento oculto exigirá quebrar seu revestimento premium novo para consertar um cano furado."
      },
      {
        id: "coz-pt-2",
        env: "cozinha",
        emoji: "🍳",
        title: "Disjuntores Dedicados no Quadro (Cozinha)",
        desc: "Protege o forno elétrico e o cooktop contra sobrecargas elétricas severas.",
        consequence: "Se não executado: O uso simultâneo de eletrodomésticos desarmará o disjuntor geral da casa ou derreterá fiações internas."
      },
      {
        id: "ban-pr-1",
        env: "banheiro",
        emoji: "🛁",
        title: "Impermeabilização Estrutural do Box (Banheiro)",
        desc: "A impermeabilização correta blinda a laje do banheiro contra infiltrações catastróficas.",
        consequence: "Se não executado: A água infiltrará no teto do vizinho de baixo, gerando processos judiciais e custos altíssimos de indenização."
      },
      {
        id: "ban-pr-2",
        env: "banheiro",
        emoji: "🛁",
        title: "Teste de Estanqueidade do Ralo - 72h (Banheiro)",
        desc: "Garante que o ralo e as conexões estão 100% estanques antes de aplicar contrapiso.",
        consequence: "Se não executado: Haverá vazamento silencioso na junta do ralo com a laje, manchando tetos e gerando infiltrações insolúveis."
      },
      {
        id: "ban-pt-2",
        env: "banheiro",
        emoji: "🛁",
        title: "Rejuntamento Epóxi no Box (Banheiro)",
        desc: "O rejunte epóxi ou acrílico é impermeável e impede a passagem de umidade do box.",
        consequence: "Se não executado: Rejuntes cimentícios comuns encardirão, mofarão e deixarão a umidade passar sob o revestimento."
      },
      {
        id: "sal-pr-1",
        env: "sala",
        emoji: "📺",
        title: "Impermeabilização e Calafetação de Janela (Sala)",
        desc: "Inspeciona frestas externas do caixilho e veda pingadeiras com silicone PU.",
        consequence: "Se não executado: A água de chuvas de vento penetrará sob o batente, estufando sua pintura nova e descolando gesso."
      },
      {
        id: "sal-pt-1",
        env: "sala",
        emoji: "📺",
        title: "Módulos DPS no Quadro (Sala)",
        desc: "Garante proteção a TVs, computadores e aparelhos na sala contra surtos de raios.",
        consequence: "Se não executado: Uma queda de raio queimará instantaneamente aparelhos caros conectados na tomada sem DPS."
      },
      {
        id: "qua-pr-1",
        env: "quarto",
        emoji: "🛏️",
        title: "Tratamento Anti-Mofo nas Divisórias (Quarto)",
        desc: "Impermeabiliza paredes que dividem o quarto com banheiros ou áreas externas.",
        consequence: "Se não executado: Manchas pretas e mofo surgirão na parede atrás do guarda-roupa, estragando roupas e gerando alergias respiratórias."
      },
      {
        id: "ext-pr-1",
        env: "area_externa",
        emoji: "🪴",
        title: "Impermeabilização de Laje Externa (Varanda/Cobertura)",
        desc: "Aplicação de manta asfáltica 4mm com teste de 72h contra chuvas intensas.",
        consequence: "Se não executado: Infiltração generalizada na laje provocará goteiras e desplacamento de rebocos no cômodo de baixo."
      }
    ];
  }

  init() {
    this.loadTasksProgress();
    
    // Select default environment
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    const activeSaved = localStorage.getItem('reformas_3p_active_env');
    if (activeSaved && !this.app.paywallController.isEnvironmentLocked(activeSaved)) {
      this.activeEnvironment = activeSaved;
    } else {
      const unlocked = allEnvIds.find(id => !this.app.paywallController.isEnvironmentLocked(id));
      this.activeEnvironment = unlocked || 'cozinha';
    }

    this.renderEnvironmentCards();
    this.renderPdfGrid();
    
    // Init sequential cronograma durations
    this.initCronograma();
    this.renderRiskScanner();

    // Initial render of Planejar & Proteger tabs
    this.renderPlanejarEnvironmentsScroll();
    this.renderPlanejarEtapas();
    this.updatePlanejarPhaseProgress();
    this.updateProtegerSummaryMetrics();
  }

  loadTasksProgress() {
    const saved = localStorage.getItem('reformas_3p_tasks_progress');
    if (saved) {
      try {
        this.tasksProgress = JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao analisar tarefas salvas:", e);
        this.tasksProgress = {};
      }
    } else {
      this.tasksProgress = {};
    }
  }

  saveTasksProgress() {
    localStorage.setItem('reformas_3p_tasks_progress', JSON.stringify(this.tasksProgress));
  }

  getOverallPhysicalProgress() {
    if (localStorage.getItem('reformas_3p_obra_concluida') === 'true') return 100;
    
    let progress = null;
    const saved = localStorage.getItem('reformas_3p_acompanhamento');
    if (saved) {
      try {
        progress = JSON.parse(saved);
      } catch(e) {}
    }
    
    if (!progress || Object.keys(progress).length === 0) {
      return null; // indicates no physical progress has been input yet
    }
    
    const stages = [
      "Demolição", "Infraestrutura", "Elétrica", "Hidráulica", 
      "Revestimentos", "Pintura", "Instalações", "Acabamentos", 
      "Limpeza Final", "Entrega Final"
    ];
    
    let sum = 0;
    stages.forEach(stage => {
      sum += (progress[stage] !== undefined ? progress[stage] : 0);
    });
    
    return sum / stages.length;
  }

  getEnvironmentProgress(envId) {
    const envData = METODO_3P_DATABASE.checklists[envId];
    if (!envData) return 0;
    
    const allTasks = [...envData.planejar, ...envData.prevenir, ...envData.proteger];
    if (allTasks.length === 0) return 0;
    
    let completedCount = 0;
    allTasks.forEach(task => {
      if (this.tasksProgress[task.id]) {
        completedCount++;
      }
    });
    
    return (completedCount / allTasks.length) * 100;
  }

  getPhaseProgress(phase) {
    const activeEnvironments = (this.app.selectedEnvironments && this.app.selectedEnvironments.length > 0)
      ? this.app.selectedEnvironments
      : ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
      
    let totalTasks = 0;
    let completedTasks = 0;
    
    activeEnvironments.forEach(envId => {
      const envData = METODO_3P_DATABASE.checklists[envId];
      if (envData && envData[phase]) {
        envData[phase].forEach(task => {
          totalTasks++;
          if (this.tasksProgress[task.id]) {
            completedTasks++;
          }
        });
      }
    });
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }

  // ==========================================================================
  // PASSO 4: CRONOGRAMA SEQUENCIAL (GANTT STYLE)
  // ==========================================================================
  initCronograma() {
    const savedStartDate = localStorage.getItem('reformas_3p_crono_start');
    const startInput = document.getElementById('crono-start-date');
    if (startInput) {
      if (savedStartDate) {
        startInput.value = savedStartDate;
      } else {
        const today = new Date().toISOString().split('T')[0];
        startInput.value = today;
        localStorage.setItem('reformas_3p_crono_start', today);
      }
    }
    
    const savedDurations = localStorage.getItem('reformas_3p_crono_durations');
    if (savedDurations) {
      try {
        this.cronogramaDurations = JSON.parse(savedDurations);
      } catch (e) {
        this.cronogramaDurations = { stage1: 5, stage2: 10, stage3: 4, stage4: 7, stage5: 12, stage6: 8 };
      }
    } else {
      localStorage.setItem('reformas_3p_crono_durations', JSON.stringify(this.cronogramaDurations));
    }
    
    this.updateCronograma();
  }

  updateCronograma() {
    const startInput = document.getElementById('crono-start-date');
    if (!startInput) return;
    
    const startDateStr = startInput.value;
    localStorage.setItem('reformas_3p_crono_start', startDateStr);
    
    const stagesList = [
      { key: 'stage1', name: "Demolição & Limpeza de Entulho", emoji: "🔨" },
      { key: 'stage2', name: "Infraestrutura (Elétrica e Hidráulica)", emoji: "⚡" },
      { key: 'stage3', name: "Impermeabilização Estrutural", emoji: "Shower" }, // Shower or generic icon
      { key: 'stage4', name: "Contrapiso e Regularização", emoji: "🧱" },
      { key: 'stage5', name: "Assentamento de Revestimentos", emoji: "📐" },
      { key: 'stage6', name: "Pintura Geral, Luzes & Metais", emoji: "🎨" }
    ];
    
    // Read durations from inputs dynamically
    stagesList.forEach(st => {
      const inputEl = document.getElementById(`crono-input-${st.key}`);
      if (inputEl) {
        const val = parseInt(inputEl.value);
        if (!isNaN(val) && val > 0) {
          this.cronogramaDurations[st.key] = val;
        }
      }
    });
    localStorage.setItem('reformas_3p_crono_durations', JSON.stringify(this.cronogramaDurations));
    
    // Sequential calendar logic
    let currentDate = new Date(startDateStr + 'T00:00:00');
    let totalDays = 0;
    const computedStages = [];
    
    stagesList.forEach(st => {
      const duration = this.cronogramaDurations[st.key] || 5;
      totalDays += duration;
      
      const stStart = new Date(currentDate.getTime());
      const stEnd = new Date(currentDate.getTime());
      stEnd.setDate(stEnd.getDate() + duration - 1);
      
      computedStages.push({
        ...st,
        duration: duration,
        startDate: stStart,
        endDate: stEnd,
        startStr: stStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        endStr: stEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      });
      
      const nextDay = new Date(stEnd.getTime());
      nextDay.setDate(nextDay.getDate() + 1);
      currentDate = nextDay;
    });
    
    // Final Completion Date
    const lastEnd = computedStages[computedStages.length - 1].endDate;
    const completionStr = lastEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const displayEndDate = document.getElementById('crono-display-enddate');
    const displayDuration = document.getElementById('crono-display-duration');
    if (displayEndDate) displayEndDate.textContent = completionStr;
    if (displayDuration) displayDuration.textContent = `${totalDays} Dias`;
    
    const container = document.getElementById('crono-stages-container');
    if (!container) return;
    
    container.innerHTML = computedStages.map((st, idx) => {
      const barWidth = totalDays > 0 ? (st.duration / totalDays) * 100 : 0;
      
      return `
        <div class="crono-stage-row">
          <div class="crono-stage-header">
            <div class="crono-stage-title-block">
              <span class="crono-stage-num">${idx + 1}</span>
              <span class="crono-stage-name">${st.emoji === 'Shower' ? '🚿' : st.emoji} ${st.name}</span>
            </div>
            <div class="crono-stage-duration-input">
              <input type="number" id="crono-input-${st.key}" class="crono-days-input" style="width: 54px; padding: 4px;" value="${st.duration}" min="1" onchange="window.app.conteudosController.updateCronograma()">
              <span style="font-size: 11px; color: var(--text-secondary);">dias</span>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
             <span class="crono-stage-dates-span">📅 Período: <b>${st.startStr}</b> a <b>${st.endStr}</b></span>
             <span class="crono-stage-dates-span" style="color: var(--primary-orange); font-weight: 700;">${st.duration} dias</span>
          </div>
          
          <div class="crono-gantt-bar-bg">
            <div class="crono-gantt-bar-fill" style="width: ${barWidth}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  // ==========================================================================
  // ABA DE RISCO: AUTOMATIC RISK ALERT SCANNER
  // ==========================================================================
  renderRiskScanner() {
    const ativosContainer = document.getElementById('riscos-ativos-container');
    const mitigadosContainer = document.getElementById('riscos-mitigados-container');
    if (!ativosContainer || !mitigadosContainer) return;
    
    const activeEnvs = this.app.selectedEnvironments;
    
    const scannedAtivos = [];
    const scannedMitigados = [];
    
    this.criticalRisks.forEach(risk => {
      // Risk is only relevant if the environment is selected active in onboarding
      if (!activeEnvs.includes(risk.env)) return;
      
      const isCompleted = !!this.tasksProgress[risk.id];
      
      if (isCompleted) {
        scannedMitigados.push(risk);
      } else {
        scannedAtivos.push(risk);
      }
    });
    
    // Render Active Risks
    if (scannedAtivos.length === 0) {
      ativosContainer.innerHTML = `
        <div class="risk-mitigated-card" style="width: 100%; border-color: rgba(38,208,124,0.3); opacity: 1;">
          <span style="font-size: 20px;">🎉</span>
          <div style="text-align: left;">
            <h5 class="risk-mitigated-title">Nenhum Risco Crítico Ativo</h5>
            <p class="risk-mitigated-desc">Parabéns! Suas tarefas essenciais de blindagem estrutural e hidráulica estão todas concluídas no checklist.</p>
          </div>
        </div>`;
    } else {
      ativosContainer.innerHTML = scannedAtivos.map(risk => `
        <div class="risk-alert-card">
          <span class="risk-alert-emoji">${risk.emoji}</span>
          <div class="risk-alert-content">
            <h5 class="risk-alert-title">${risk.title}</h5>
            <p class="risk-alert-desc">${risk.desc}</p>
            <div class="risk-alert-consequence">${risk.consequence}</div>
          </div>
        </div>`).join('');
    }
    
    // Render Mitigated Risks
    if (scannedMitigados.length === 0) {
      mitigadosContainer.innerHTML = `
        <div class="empty-state" style="padding: 12px; background: transparent; border: 1px dashed var(--border-glass); border-radius: 12px;">
          <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Resolva os checklists preventivos na Central 3P para mitigar seus riscos estruturais e ganhar selos verdes.</p>
        </div>`;
    } else {
      mitigadosContainer.innerHTML = scannedMitigados.map(risk => `
        <div class="risk-mitigated-card">
          <span style="font-size: 16px; color: var(--color-success);">✓</span>
          <div style="text-align: left;">
            <h5 class="risk-mitigated-title" style="text-decoration: line-through; opacity: 0.6;">${risk.title}</h5>
            <p class="risk-mitigated-desc">Risco mitigado com sucesso. Blindagem e testes efetuados.</p>
          </div>
        </div>`).join('');
    }
  }

  // ==========================================================================
  // CENTRAL CHECKLISTS POR AMBIENTES
  // ==========================================================================
  renderEnvironmentCards() {
    const grid = document.getElementById('environments-cards-grid');
    if (!grid) return;
    
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    
    const envPhotos = {
      cozinha: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop",
      border: "rgba(255, 255, 255, 0.08)",
      banheiro: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&auto=format&fit=crop",
      quarto: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&auto=format&fit=crop",
      sala: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop",
      area_externa: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=300&auto=format&fit=crop"
    };
    
    grid.innerHTML = allEnvIds.map(envId => {
      const isSelected = this.app.selectedEnvironments.includes(envId);
      
      const envData = METODO_3P_DATABASE.checklists[envId];
      const isLocked = this.app.paywallController.isEnvironmentLocked(envId);
      const progress = this.getEnvironmentProgress(envId);
      
      if (isLocked) {
        return `
          <div class="premium-env-card locked-card">
            <div class="premium-env-card-body">
              <div class="premium-env-card-left">
                <div class="premium-env-card-title-row">
                  <span style="font-size: 16px;">${envData.emoji}</span>
                  <span class="premium-env-card-title">${envData.name.toUpperCase()}</span>
                  <span class="premium-env-card-badge-locked">🔒 BLOQUEADO</span>
                </div>
                <div class="premium-env-card-bullets">
                  <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> O que priorizar</div>
                  <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> O que evitar</div>
                  <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> Recomendações inteligentes</div>
                  <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> Proteção financeira</div>
                </div>
              </div>
              <div class="premium-env-card-right">
                <img src="${envPhotos[envId]}" alt="${envData.name}" class="premium-env-card-photo">
                <div class="premium-env-card-progress-overlay" style="color: var(--color-warning);">R$ 97</div>
              </div>
            </div>
            <div class="premium-env-card-buttons">
              <button class="btn-premium-outline" onclick="window.app.paywallController.triggerEnvironmentPurchase('${envId}')">Ver Prévia</button>
              <button class="btn-premium-solid" onclick="window.app.paywallController.triggerEnvironmentPurchase('${envId}')">Liberar Cômodo</button>
            </div>
          </div>`;
      }
      
      return `
        <div class="premium-env-card">
          <div class="premium-env-card-body">
            <div class="premium-env-card-left">
              <div class="premium-env-card-title-row">
                <span style="font-size: 16px;">${envData.emoji}</span>
                <span class="premium-env-card-title">${envData.name.toUpperCase()}</span>
              </div>
              <div class="premium-env-card-bullets">
                <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> O que priorizar</div>
                <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> O que evitar</div>
                <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> Recomendações inteligentes</div>
                <div class="premium-env-card-bullet"><span class="premium-env-card-bullet-check">✓</span> Proteção financeira</div>
              </div>
            </div>
            <div class="premium-env-card-right">
              <img src="${envPhotos[envId]}" alt="${envData.name}" class="premium-env-card-photo">
              <div class="premium-env-card-progress-overlay">${progress.toFixed(0)}% Concluído</div>
            </div>
          </div>
          <div class="premium-env-card-buttons">
            <button class="btn-premium-outline" onclick="window.app.conteudosController.openEnvironmentProtocol('${envId}')">Ver Protocolo</button>
            <button class="btn-premium-solid" onclick="window.app.conteudosController.openEnvironmentDetail('${envId}')">Iniciar Planejamento</button>
          </div>
        </div>`;
    }).join('');
  }

  openEnvironmentDetail(envId) {
    this.activeEnvironment = envId;
    this.activePhase = "planejar";
    
    document.getElementById('environments-cards-grid').style.display = 'none';
    
    const detailArea = document.getElementById('env-detail-area');
    detailArea.style.display = 'flex';
    
    const envData = METODO_3P_DATABASE.checklists[envId];
    document.getElementById('env-detail-title').textContent = `${envData.emoji} Checklist ${envData.name}`;
    
    this.updateEnvironmentDetailProgress();
    this.switchEnvironmentPhase('planejar');
    
    // Carregar fotos do Diário Visual
    this.renderEnvironmentPhotos();
  }

  closeEnvironmentDetail() {
    if (!this.activeEnvironment) return;
    this.activeEnvironment = null;
    
    document.getElementById('environments-cards-grid').style.display = '';
    document.getElementById('env-detail-area').style.display = 'none';
    
    this.renderEnvironmentCards();
    this.app.financeiroController.updateDashboard();
    
    // Scanning risks when checklist updates
    this.renderRiskScanner();
  }

  updateEnvironmentDetailProgress() {
    if (!this.activeEnvironment) return;
    const progress = this.getEnvironmentProgress(this.activeEnvironment);
    
    document.getElementById('env-detail-progress-percent').textContent = `${progress.toFixed(0)}%`;
    document.getElementById('env-detail-progress-bar').style.width = `${progress}%`;
  }

  switchEnvironmentPhase(phaseId) {
    this.activePhase = phaseId;
    
    const phaseBtns = document.querySelectorAll('.phase-segmented-control .phase-btn');
    phaseBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`phase-btn-${phaseId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const banner = document.getElementById('phase-explanation-banner');
    if (phaseId === 'planejar') {
      banner.innerHTML = `<strong>FASE 1: PLANEJAR</strong> - Alinhamento de layout, tomadas, hidráulica e especificações antes do quebra-quebra começar.`;
    } else if (phaseId === 'prevenir') {
      banner.innerHTML = `<strong>FASE 2: PREVENIR</strong> - Impermeabilizações, testes de carga, nivelamentos de reboco e salvaguardas contra dor de cabeça.`;
    } else {
      banner.innerHTML = `<strong>FASE 3: PROTEGER</strong> - Acabamento impermeável de rejuntes, calafetações finais, dispositivos de proteção e selagem química.`;
    }
    
    this.renderTaskChecklist();
  }

  renderTaskChecklist() {
    if (!this.activeEnvironment) return;
    
    const envData = METODO_3P_DATABASE.checklists[this.activeEnvironment];
    const tasks = envData[this.activePhase] || [];
    
    const container = document.getElementById('env-tasks-list');
    
    if (tasks.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>Nenhuma tarefa cadastrada nesta fase.</p></div>`;
      return;
    }
    
    container.innerHTML = tasks.map(task => {
      const isCompleted = !!this.tasksProgress[task.id];
      const completedClass = isCompleted ? 'completed' : '';
      
      return `
        <div class="task-item-row ${completedClass}" onclick="window.app.conteudosController.toggleTask('${task.id}')">
          <div class="task-checkbox-wrapper">
            <div class="task-check-circle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="task-info-block">
            <div class="task-title" style="font-weight: 700; font-size: 13px;">${task.title}</div>
            <div class="task-desc" style="font-size: 11px; color: var(--text-secondary);">${task.desc}</div>
          </div>
        </div>`;
    }).join('');
  }

  toggleTask(taskId) {
    this.tasksProgress[taskId] = !this.tasksProgress[taskId];
    this.saveTasksProgress();
    
    this.renderTaskChecklist();
    this.updateEnvironmentDetailProgress();
    
    // Realtime scanner update
    this.renderRiskScanner();
    this.app.updateProfileStats();

    // Sincronizar tarefa com Supabase em background
    if (supabaseDB && supabaseDB.isConfigured && this.app.userEmail) {
      supabaseDB.saveTaskProgress(
        this.app.userEmail,
        taskId,
        !!this.tasksProgress[taskId]
      );
    }
  }

  // ==========================================================================
  // PILAR 3.2: PDF Library Grid Renders
  // ==========================================================================
  selectLibraryEnvironment(envId) {
    this.librarySelectedEnvironment = envId;
    
    // Update active button state
    ['cozinha', 'banheiro', 'quarto', 'sala', 'area_externa'].forEach(e => {
      const btn = document.getElementById(`lib-env-btn-${e}`);
      if (btn) {
        if (e === envId) {
          btn.classList.add('active');
          btn.style.background = 'rgba(191,90,242,0.12)';
          btn.style.borderColor = 'rgba(191,90,242,0.3)';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'rgba(255,255,255,0.04)';
          btn.style.borderColor = 'var(--border-glass)';
        }
      }
    });
    
    this.renderPdfGrid();
  }

  selectLibraryPhase(phase) {
    this.librarySelectedPhase = phase;
    
    // Update active button state
    ['planejar', 'prevenir', 'proteger'].forEach(p => {
      const btn = document.getElementById(`lib-phase-btn-${p}`);
      if (btn) {
        if (p === phase) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
    
    this.renderPdfGrid();
  }

  renderPdfGrid() {
    const container = document.getElementById('library-grid-container');
    if (!container) return;
    
    const library = METODO_3P_DATABASE.library;
    const query = (this.librarySearchQuery || '').toLowerCase().trim();
    
    const filtered = library.filter(pdf => {
      // 1. Search Query override
      if (query !== '') {
        return pdf.title.toLowerCase().includes(query) ||
               pdf.desc.toLowerCase().includes(query) ||
               pdf.tags.some(tag => tag.toLowerCase().includes(query));
      }
      
      // 2. Default interactive filters
      const env = this.librarySelectedEnvironment || 'cozinha';
      const phase = this.librarySelectedPhase || 'planejar';
      
      // Match environment
      let matchesEnv = false;
      if (pdf.env === 'general') {
        matchesEnv = true;
      } else if (env === 'cozinha') {
        matchesEnv = pdf.tags.includes('cozinha') || pdf.title.toLowerCase().includes('cozinha');
      } else if (env === 'banheiro') {
        matchesEnv = pdf.tags.includes('banheiro') || pdf.title.toLowerCase().includes('banheiro');
      } else if (env === 'quarto') {
        matchesEnv = pdf.tags.includes('quarto') || pdf.title.toLowerCase().includes('quarto');
      } else if (env === 'sala') {
        matchesEnv = pdf.tags.includes('sala') || pdf.title.toLowerCase().includes('sala') || pdf.tags.includes('sala de estar');
      } else if (env === 'area_externa') {
        matchesEnv = pdf.tags.includes('area') || pdf.tags.includes('externa') || pdf.tags.includes('area_externa') || pdf.title.toLowerCase().includes('externa') || pdf.title.toLowerCase().includes('churrasqueira');
      }
      
      // Match phase category
      let matchesPhase = false;
      if (phase === 'planejar') {
        matchesPhase = pdf.category === 'planejamento';
      } else if (phase === 'prevenir') {
        matchesPhase = pdf.category === 'financeiro' || pdf.category === 'materiais';
      } else if (phase === 'proteger') {
        matchesPhase = pdf.category === 'contratos' || pdf.category === 'tecnico';
      }
      
      return matchesEnv && matchesPhase;
    });
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: span 2">
          <div class="empty-emoji">🔍</div>
          <h4>Nenhum guia encontrado</h4>
          <p>Não há guias nesta fase para o ambiente selecionado.</p>
        </div>`;
      return;
    }
    
    container.innerHTML = filtered.map(pdf => {
      const isLocked = pdf.env !== 'general' && this.app.paywallController.isEnvironmentLocked(pdf.env);
      
      // Dynamic button labels based on category
      let premiumActionLabel = '🔓 LIBERAR GUIA';
      let freeActionLabel = 'LER GUIA AGORA ➔';
      
      if (pdf.category === 'planejamento') {
        premiumActionLabel = '🔓 CONSULTAR GUIA';
        freeActionLabel = 'CONSULTAR GUIA ➔';
      } else if (pdf.category === 'financeiro') {
        premiumActionLabel = '🔓 VER ESTRATÉGIA';
        freeActionLabel = 'VER ESTRATÉGIA ➔';
      } else if (pdf.category === 'contratos') {
        premiumActionLabel = '🔓 ABRIR MINUTA';
        freeActionLabel = 'ABRIR CONTRATO ➔';
      } else if (pdf.category === 'tecnico' || pdf.category === 'materiais') {
        premiumActionLabel = '🔓 ACESSAR MATERIAL';
        freeActionLabel = 'ACESSAR MATERIAL ➔';
      }
      
      if (isLocked) {
        return `
          <div class="premium-pdf-card locked" onclick="window.app.paywallController.triggerEnvironmentPurchase('${pdf.env}')">
            <div class="premium-pdf-left">
              <div class="pdf-tag-row">
                <span class="pdf-cat-badge ${pdf.category}">${pdf.category.toUpperCase()}</span>
                <span class="pdf-pages-badge">📄 ${pdf.pages} PÁG</span>
              </div>
              <h4 class="pdf-title">${pdf.title}</h4>
              <p class="pdf-desc">${pdf.desc}</p>
              <div class="pdf-card-action">
                <span class="pdf-action-btn premium">${premiumActionLabel}</span>
              </div>
            </div>
            <div class="premium-pdf-right">
              <div class="pdf-cover-gradient ${pdf.category}">
                <span class="pdf-cover-emoji">${pdf.category === 'tecnico' ? '🧱' : pdf.category === 'financeiro' ? '💵' : pdf.category === 'contratos' ? '📝' : '📐'}</span>
                <div class="pdf-cover-decor-line"></div>
                <div class="pdf-cover-decor-line mini"></div>
                <div class="pdf-cover-lock">🔒</div>
              </div>
            </div>
          </div>`;
      }
      
      return `
        <div class="premium-pdf-card" onclick="window.app.conteudosController.openPdfReader('${pdf.id}')">
          <div class="premium-pdf-left">
            <div class="pdf-tag-row">
              <span class="pdf-cat-badge ${pdf.category}">${pdf.category.toUpperCase()}</span>
              <span class="pdf-pages-badge">📄 ${pdf.pages} PÁG</span>
            </div>
            <h4 class="pdf-title">${pdf.title}</h4>
            <p class="pdf-desc">${pdf.desc}</p>
            <div class="pdf-card-action">
              <span class="pdf-action-btn">${freeActionLabel}</span>
            </div>
          </div>
          <div class="premium-pdf-right">
            <div class="pdf-cover-gradient ${pdf.category}">
              <span class="pdf-cover-emoji">${pdf.category === 'tecnico' ? '🧱' : pdf.category === 'financeiro' ? '💵' : pdf.category === 'contratos' ? '📝' : '📐'}</span>
              <div class="pdf-cover-decor-line"></div>
              <div class="pdf-cover-decor-line mini"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  openPdfReader(id) {
    this.pdfZoom = 1.0;
    const zoomLevelEl = document.getElementById('pdf-zoom-level');
    if (zoomLevelEl) zoomLevelEl.textContent = '100%';

    let pdf = METODO_3P_DATABASE.library.find(p => p.id === id);
    
    // Fallback dictionary for Protocol Decision PDFs (PDs)
    const protocolPdfs = {
      'prot-coz': {
        id: 'prot-coz',
        title: 'Protocolo de Decisão — Cozinha',
        category: 'planejamento',
        url: './MÉTODO 3P/PROTOCOLO DE  DECISÃO/PROTOCOLO-DE-DECISAO-COZINHA.pdf',
        env: 'cozinha'
      },
      'prot-sal': {
        id: 'prot-sal',
        title: 'Protocolo de Decisão — Sala',
        category: 'planejamento',
        url: './MÉTODO 3P/PROTOCOLO DE  DECISÃO/PROTOCOLO-DECISAO-SALA.pdf',
        env: 'sala'
      },
      'prot-qua': {
        id: 'prot-qua',
        title: 'Protocolo de Decisão — Quarto',
        category: 'planejamento',
        url: './MÉTODO 3P/PROTOCOLO DE  DECISÃO/PROTOCOLO-DE-DECISAO-QUARTO.pdf',
        env: 'quarto'
      },
      'prot-ban': {
        id: 'prot-ban',
        title: 'Protocolo de Decisão — Banheiro',
        category: 'planejamento',
        url: './MÉTODO 3P/PROTOCOLO DE  DECISÃO/PROTOCOLO-DE-DECISAO-BANHEIRO.pdf',
        env: 'banheiro'
      },
      'prot-ext': {
        id: 'prot-ext',
        title: 'Protocolo de Decisão — Área Externa',
        category: 'planejamento',
        url: './MÉTODO 3P/PROTOCOLO DE  DECISÃO/PROTOCOLO-DECISAO-AREA-EXTERNA.pdf',
        env: 'area_externa'
      }
    };

    if (!pdf && protocolPdfs[id]) {
      pdf = protocolPdfs[id];
    }
    
    // Additional generic fallback for checklist steps (e.g. "pdf-1" matching "pdf-1-cozinha")
    if (!pdf && typeof id === 'string') {
      const activeEnv = this.app.decisoesController ? this.app.decisoesController.activeEnvironment : null;
      if (activeEnv) {
        pdf = METODO_3P_DATABASE.library.find(p => p.id === `${id}-${activeEnv}`);
      }
      if (!pdf) {
        pdf = METODO_3P_DATABASE.library.find(p => p.id.startsWith(id));
      }
    }

    if (!pdf) return;
    
    // Check environment paywall lock first
    if (pdf.env !== 'general' && this.app.paywallController.isEnvironmentLocked(pdf.env)) {
      this.app.paywallController.triggerEnvironmentPurchase(pdf.env);
      return;
    }
    
    // If it is the app manual or a direct local PDF
    if (id === 'pdf-doc' || (pdf.url && pdf.url.toLowerCase().endsWith('.pdf'))) {
      const overlay = document.getElementById('drawer-pdf-overlay');
      const drawerTitle = document.getElementById('pdf-reader-title');
      const drawerCat = document.getElementById('pdf-reader-category');
      const simulatedPages = document.querySelector('.pdf-simulated-pages');
      
      if (drawerTitle) drawerTitle.textContent = pdf.title;
      if (drawerCat) drawerCat.textContent = pdf.category ? pdf.category.toUpperCase() : 'PDF';
      
      if (simulatedPages) {
        if (id === 'pdf-doc') {
          simulatedPages.innerHTML = `
            <div class="pdf-page-view" style="background: #ffffff; color: #000000; padding: 20px; border-radius: 12px; font-size: 12px; line-height: 1.6; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              ${pdf.content}
            </div>
          `;
        } else {
          // It's a local PDF file, embed it securely via Canvas
          const encodedUrl = encodeURI(pdf.url);
          simulatedPages.innerHTML = `
            <div id="pdf-render-container" style="width: 100%; height: calc(100vh - 130px); overflow: auto; background: #12131a; border-radius: 0; text-align: center; padding: 20px 0; -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y;">
               <div id="pdf-canvas-wrapper" style="width: 100%; transition: width 0.3s ease; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
                 <div id="pdf-loading-indicator" style="color: #fff; font-size: 14px; font-weight: bold; margin-top: 50px;">
                   <span style="display: inline-block; animation: pulse 1.5s infinite;">Carregando visualizador seguro...</span>
                 </div>
               </div>
            </div>
          `;
          this.renderSecurePdf(encodedUrl);

          // Setup pinch to zoom and double-tap touch events
          const containerEl = document.getElementById('pdf-render-container');
          if (containerEl) {
            let initialDist = 0;
            let initialZoom = 1.0;
            let lastTap = 0;
            let wasPinching = false;
            
            containerEl.addEventListener('touchstart', (e) => {
              if (e.touches.length === 2) {
                e.preventDefault();
                wasPinching = true;
                initialDist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                initialZoom = this.pdfZoom || 1.0;
              }
            }, { passive: false });
            
            containerEl.addEventListener('touchmove', (e) => {
              if (e.touches.length === 2 && initialDist > 0) {
                e.preventDefault();
                wasPinching = true;
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = dist / initialDist;
                
                let newZoom = initialZoom * factor;
                if (newZoom < 0.5) newZoom = 0.5;
                if (newZoom > 3.0) newZoom = 3.0;
                
                this.pdfZoom = newZoom;
                
                const zoomLevelEl = document.getElementById('pdf-zoom-level');
                if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(this.pdfZoom * 100)}%`;
                
                const wrapper = document.getElementById('pdf-canvas-wrapper');
                if (wrapper) {
                  wrapper.style.transition = 'none';
                  wrapper.style.width = `${this.pdfZoom * 100}%`;
                }
              }
            }, { passive: false });
            
            containerEl.addEventListener('touchend', (e) => {
              if (e.touches.length < 2) {
                initialDist = 0;
                const wrapper = document.getElementById('pdf-canvas-wrapper');
                if (wrapper) {
                  wrapper.style.transition = 'width 0.3s ease';
                }
              }
              
              if (e.touches.length === 0) {
                setTimeout(() => {
                  wasPinching = false;
                }, 300);
              }
              
              // Double tap toggle zoom (100% <=> 175%)
              if (!wasPinching) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                  e.preventDefault();
                  if (this.pdfZoom > 1.2) {
                    this.pdfZoom = 1.0;
                  } else {
                    this.pdfZoom = 1.75;
                  }
                  
                  const zoomLevelEl = document.getElementById('pdf-zoom-level');
                  if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(this.pdfZoom * 100)}%`;
                  
                  const wrapper = document.getElementById('pdf-canvas-wrapper');
                  if (wrapper) {
                    wrapper.style.transition = 'width 0.3s ease';
                    wrapper.style.width = `${this.pdfZoom * 100}%`;
                  }
                }
                lastTap = currentTime;
              }
            });
          }
        }
      }
      
      if (overlay) overlay.classList.add('active');
      
      // Anti-screenshot listener
      this.antiScreenshotListener = (e) => {
        if (e.key === "PrintScreen" || (e.ctrlKey && (e.key === "p" || e.key === "s"))) {
          e.preventDefault();
          this.app.triggerPushNotification("⚠️ AÇÃO BLOQUEADA", "A captura ou cópia de tela é restrita por direitos autorais.", "danger");
          const overlay = document.getElementById('drawer-pdf-overlay');
          if (overlay) overlay.style.display = 'none'; // Flash hide
          setTimeout(() => { if(overlay) overlay.style.display = 'flex'; }, 2000);
          
          // Clear clipboard
          navigator.clipboard.writeText("Conteúdo protegido.").catch(()=>{});
        }
      };
      window.addEventListener('keyup', this.antiScreenshotListener);
      window.addEventListener('keydown', this.antiScreenshotListener);
      
      return;
    }
    
    // Support direct custom link URL added by Admin
    if (pdf.url) {
      this.app.triggerPushNotification("📖 ABRINDO LINK EXTERNO", `Redirecionando para o link cadastrado...`, "success");
      setTimeout(() => {
        window.open(pdf.url, '_blank');
      }, 400);
      return;
    }

    // Otherwise, redirect to Gama App!
    const gamaLinks = {
      'pdf-1': 'https://gama.app/shared/reformas-sem-erro-pdf-1',
      'pdf-2': 'https://gama.app/shared/reformas-sem-erro-pdf-2',
      'pdf-3': 'https://gama.app/shared/reformas-sem-erro-pdf-3',
      'pdf-4': 'https://gama.app/shared/reformas-sem-erro-pdf-4',
    };
    
    const url = gamaLinks[id] || `https://reformasemerro.com.br/gama-app-pdf?id=${id}`;
    
    this.app.triggerPushNotification("📖 ABRINDO GUIA NO GAMA APP", `Redirecionando para visualização completa no Gama App...`, "success");
    
    setTimeout(() => {
      window.open(url, '_blank');
    }, 400);
  }

  zoomPdf(delta) {
    if (!this.pdfZoom) this.pdfZoom = 1.0;
    this.pdfZoom += delta;
    if (this.pdfZoom < 0.5) this.pdfZoom = 0.5;
    if (this.pdfZoom > 3.0) this.pdfZoom = 3.0;
    
    const zoomLevelEl = document.getElementById('pdf-zoom-level');
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(this.pdfZoom * 100)}%`;
    
    const wrapper = document.getElementById('pdf-canvas-wrapper');
    if (wrapper) {
      wrapper.style.width = `${this.pdfZoom * 100}%`;
    }
  }

  closePdfReader() {
    document.getElementById('drawer-pdf-overlay').classList.remove('active');
    if (this.antiScreenshotListener) {
      window.removeEventListener('keyup', this.antiScreenshotListener);
      window.removeEventListener('keydown', this.antiScreenshotListener);
    }
  }

  async renderSecurePdf(pdfUrl) {
    try {
      const wrapper = document.getElementById('pdf-canvas-wrapper');
      if (!wrapper) return;

      if (typeof pdfjsLib === 'undefined') {
        throw new Error("A biblioteca PDF.js não carregou a tempo.");
      }

      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      const loadingIndicator = document.getElementById('pdf-loading-indicator');
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        const viewportForScale = page.getViewport({ scale: 1.0 });
        const container = document.getElementById('pdf-render-container');
        const containerWidth = container.clientWidth - 40; // 40px padding
        
        let scale = containerWidth / viewportForScale.width;
        // Render at a higher resolution (e.g. 2x) for sharpness when zooming
        scale = scale * 2.0; 
        
        const viewport = page.getViewport({ scale: scale });
        
        const pageContainer = document.createElement('div');
        pageContainer.style.marginBottom = '16px';
        pageContainer.style.display = 'flex';
        pageContainer.style.justifyContent = 'center';
        pageContainer.style.width = '100%';
        pageContainer.style.padding = '0 10px';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
        canvas.style.borderRadius = "8px";
        canvas.style.width = "100%"; // CSS width 100% of the wrapper
        canvas.style.height = "auto";
        canvas.style.background = "#fff";
        canvas.style.userSelect = "none";
        canvas.style.pointerEvents = "none"; // Disable all interaction
        
        // Anti-piracy measure: Disable right click context menu to prevent easy saving
        canvas.oncontextmenu = function(e) { e.preventDefault(); return false; };
        
        pageContainer.appendChild(canvas);
        wrapper.appendChild(pageContainer);
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
      }
    } catch (error) {
      console.error('Error rendering PDF:', error);
      const wrapper = document.getElementById('pdf-canvas-wrapper');
      if (wrapper) {
        wrapper.innerHTML = `<div style="color: #ff3b30; padding: 20px; font-weight: bold;">⚠️ Erro ao carregar o PDF protegido. Tente novamente mais tarde.</div>`;
      }
    }
  }

  searchLibrary() {
    const input = document.getElementById('library-search-input');
    this.librarySearchQuery = input.value.trim();
    this.renderPdfGrid();
  }

  filterLibrary(cat, el) {
    this.libraryFilterCategory = cat;
    
    const tags = document.querySelectorAll('.library-tags-scroll .tag-filter');
    tags.forEach(t => t.classList.remove('active'));
    
    if (el) el.classList.add('active');
    
    this.renderPdfGrid();
  }

  // ==========================================================================
  // DIÁRIO VISUAL DA OBRA (UPLOADS & STORAGE)
  // ==========================================================================
  async renderEnvironmentPhotos() {
    const grid = document.getElementById('env-photos-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column: span 3; font-size: 11px; color: var(--text-secondary); text-align: center; padding: 10px;">Carregando fotos...</div>';
    
    if (!supabaseDB || !supabaseDB.isConfigured || !this.app.userEmail || !this.activeEnvironment) {
      grid.innerHTML = '<div style="grid-column: span 3; font-size: 11px; color: var(--text-secondary); text-align: center; padding: 10px;">Faça login com o Google para salvar fotos na nuvem.</div>';
      return;
    }
    
    try {
      const email = this.app.userEmail;
      const env = this.activeEnvironment;
      const prefix = `${email}/${env}`;
      
      const res = await fetch(`${supabaseDB.url}/storage/v1/object/list/obra-photos`, {
        method: 'POST',
        headers: {
          'apikey': supabaseDB.key,
          'Authorization': supabaseDB.accessToken ? `Bearer ${supabaseDB.accessToken}` : `Bearer ${supabaseDB.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: prefix,
          limit: 100,
          sortBy: { column: 'name', order: 'desc' }
        })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to list photos: ${res.status}`);
      }
      
      const list = await res.json();
      if (!list || list.length === 0) {
        grid.innerHTML = '<div style="grid-column: span 3; font-size: 11px; color: var(--text-secondary); text-align: center; padding: 14px; border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px;">Nenhuma foto registrada neste cômodo.</div>';
        return;
      }
      
      grid.innerHTML = list.map(item => {
        const publicUrl = `${supabaseDB.url}/storage/v1/object/public/obra-photos/${prefix}/${item.name}`;
        return `
          <div class="photo-thumbnail-card" style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-glass); background: rgba(0,0,0,0.3);">
            <img src="${publicUrl}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${publicUrl}', '_blank')">
            <button onclick="window.app.conteudosController.deleteProgressPhoto('${item.name}')" style="position: absolute; top: 4px; right: 4px; border-radius: 50%; width: 18px; height: 18px; border: none; background: rgba(255,59,48,0.85); color: #fff; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700; line-height: 1;">✖</button>
          </div>
        `;
      }).join('');
    } catch (e) {
      console.error("Erro ao carregar fotos:", e);
      grid.innerHTML = '<div style="grid-column: span 3; font-size: 11px; color: var(--color-danger); text-align: center; padding: 10px;">Erro ao carregar fotos da nuvem.</div>';
    }
  }

  async uploadProgressPhoto(inputEl) {
    if (!inputEl.files || inputEl.files.length === 0) return;
    
    if (!supabaseDB || !supabaseDB.isConfigured || !this.app.userEmail || !this.activeEnvironment) {
      this.app.triggerPushNotification(
        "🚫 LOGIN NECESSÁRIO",
        "Você precisa fazer login no Google para poder salvar fotos da obra na nuvem.",
        "danger"
      );
      return;
    }
    
    const file = inputEl.files[0];
    const email = this.app.userEmail;
    const env = this.activeEnvironment;
    const photoId = Date.now();
    const fileName = `${photoId}.jpg`;
    const path = `${email}/${env}/${fileName}`;
    
    this.app.triggerPushNotification(
      "📤 ENVIANDO FOTO",
      "Sua foto do andamento físico está sendo enviada para o servidor...",
      "warning"
    );
    
    try {
      const uploadUrl = `${supabaseDB.url}/storage/v1/object/obra-photos/${path}`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseDB.key,
          'Authorization': supabaseDB.accessToken ? `Bearer ${supabaseDB.accessToken}` : `Bearer ${supabaseDB.key}`,
          'Content-Type': file.type
        },
        body: file
      });
      
      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }
      
      this.app.triggerPushNotification(
        "📸 FOTO ADICIONADA!",
        "A foto do diário visual da obra foi salva na nuvem com sucesso.",
        "success"
      );
      
      inputEl.value = '';
      this.renderEnvironmentPhotos();
    } catch (err) {
      console.error("Erro no upload de foto:", err);
      this.app.triggerPushNotification(
        "🚨 ERRO NO UPLOAD",
        "Não foi possível salvar a imagem no servidor. Verifique sua conexão.",
        "danger"
      );
    }
  }

  async deleteProgressPhoto(photoName) {
    if (!confirm("Tem certeza que deseja excluir esta foto da obra?")) return;
    
    const email = this.app.userEmail;
    const env = this.activeEnvironment;
    const path = `${email}/${env}/${photoName}`;
    
    try {
      const deleteUrl = `${supabaseDB.url}/storage/v1/object/obra-photos/${path}`;
      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseDB.key,
          'Authorization': supabaseDB.accessToken ? `Bearer ${supabaseDB.accessToken}` : `Bearer ${supabaseDB.key}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Exclusão falhou com status: ${res.status}`);
      }
      
      this.app.triggerPushNotification(
        "🗑️ FOTO EXCLUÍDA",
        "A imagem foi removida do diário visual.",
        "success"
      );
      
      this.renderEnvironmentPhotos();
    } catch (err) {
      console.error("Erro ao deletar foto:", err);
      this.app.triggerPushNotification(
        "🚨 ERRO AO DELETAR",
        "Falha ao tentar excluir a imagem do servidor.",
        "danger"
      );
    }
  }

  // ==========================================================================
  // PORTAL ESTRATÉGICO 3P & COCKPIT CONTROLS (FASE 6)
  // ==========================================================================
  renderPortalShortcuts() {
    const container = document.getElementById('central-shortcuts-container');
    if (!container) return;
    
    const shortcuts = {
      planejar: [
        {
          title: "Checklist Pré-Obra",
          subtitle: "Evite erros antes de começar",
          icon: "📋",
          action: () => this.app.switchCentralSection('checklists')
        },
        {
          title: "Comparador de Orçamentos",
          subtitle: "Descubra excessos e riscos",
          icon: "📊",
          action: () => this.app.switchTab('orcamento')
        },
        {
          title: "Cronograma Inteligente",
          subtitle: "Acompanhe etapas críticas",
          icon: "📅",
          action: () => this.app.switchTab('cronograma')
        },
        {
          title: "Dilemas de Contratação",
          subtitle: "Diária ou Empreitada? Móveis Modulados?",
          icon: "🤝",
          action: () => alert("Os Protocolos de Decisão (Árvores) estão sendo atualizados para o novo formato PDF e serão disponibilizados em breve!")
        }
      ],
      prevenir: [
        {
          title: "Guia de Impermeabilização",
          subtitle: "Blinde áreas úmidas contra infiltrações",
          icon: "🚿",
          action: () => alert("O Guia Completo de Impermeabilização em PDF interativo será liberado na sua conta em breve!")
        },
        {
          title: "Matriz de Risco do Fornecedor",
          subtitle: "Calcule a segurança antes de contratar",
          icon: "⚖️",
          action: () => alert("A Ferramenta da Matriz de Risco do Fornecedor está passando por atualizações e será relançada em formato de protocolo interativo!")
        },
        {
          title: "Diário Visual da Obra",
          subtitle: "Acompanhe e registre fotos por ambiente",
          icon: "📸",
          action: () => this.app.switchCentralSection('checklists')
        },
        {
          title: "Prevenção de Infiltrações",
          subtitle: "PDF Técnico: Guia prático contra umidade",
          icon: "📕",
          action: () => {
            this.app.switchCentralSection('biblioteca');
            this.filterLibrary('tecnico', document.querySelector('.tag-filter:nth-child(5)'));
            this.openPdfReader('pdf-1');
          }
        }
      ],
      proteger: [
        {
          title: "Garantias & Inspeção",
          subtitle: "Proteja sua obra e vistorie até o final",
          icon: "🛡️",
          action: () => {
            this.app.switchCentralSection('biblioteca');
            this.openPdfReader('pdf-doc');
          }
        },
        {
          title: "Controle de Materiais",
          subtitle: "Evite desperdícios e desvios no canteiro",
          icon: "📦",
          action: () => {
            this.app.switchCentralSection('biblioteca');
            const matchedTag = document.querySelector('.tag-filter:nth-child(2)');
            this.filterLibrary('planejamento', matchedTag);
          }
        },
        {
          title: "Painel de Riscos Ativos",
          subtitle: "Monitore erros estruturais pendentes",
          icon: "🚨",
          action: () => this.app.switchCentralSection('riscos')
        },
        {
          title: "Manuais & PDFs Offline",
          subtitle: "Acesse todos os 60+ e-books do método",
          icon: "📚",
          action: () => this.app.switchCentralSection('biblioteca')
        }
      ]
    };
    
    const activePhase = this.activePortalPhase || 'planejar';
    let phaseItems = shortcuts[activePhase] || [];
    
    // If search is active, search dynamically across all phases
    if (this.portalSearchQuery && this.portalSearchQuery.trim() !== '') {
      const q = this.portalSearchQuery.toLowerCase();
      phaseItems = [];
      Object.keys(shortcuts).forEach(phase => {
        shortcuts[phase].forEach(item => {
          if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) {
            phaseItems.push(item);
          }
        });
      });
    }
    
    if (phaseItems.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 11px;">
          Nenhum atalho ou protocolo encontrado para "${this.portalSearchQuery}".
        </div>
      `;
      return;
    }
    
    container.innerHTML = phaseItems.map((item, index) => `
      <div class="strategic-shortcut-card" id="shortcut-card-${index}">
        <div class="strategic-card-info">
          <div class="strategic-card-icon-container">
            <span style="font-size: 16px;">${item.icon}</span>
          </div>
          <div class="strategic-card-text">
            <span class="strategic-card-title">${item.title}</span>
            <span class="strategic-card-subtitle">${item.subtitle}</span>
          </div>
        </div>
        <div class="strategic-card-chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    `).join('');
    
    // Bind click events
    phaseItems.forEach((item, index) => {
      const el = document.getElementById(`shortcut-card-${index}`);
      if (el) {
        el.addEventListener('click', () => item.action());
      }
    });
  }

  switchCentralPhase(phaseId) {
    this.activePortalPhase = phaseId;
    
    const btns = document.querySelectorAll('#central-phase-switcher .premium-phase-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`phase-tab-${phaseId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    this.renderPortalShortcuts();
  }

  handlePortalSearch(query) {
    this.portalSearchQuery = query;
    const phaseSwitcher = document.getElementById('central-phase-switcher');
    if (query && query.trim() !== '') {
      if (phaseSwitcher) phaseSwitcher.style.display = 'none';
    } else {
      if (phaseSwitcher) phaseSwitcher.style.display = 'grid';
    }
    this.renderPortalShortcuts();
  }

  resetPortalSearch() {
    const input = document.getElementById('central-search-input');
    if (input) input.value = '';
    this.portalSearchQuery = '';
    const phaseSwitcher = document.getElementById('central-phase-switcher');
    if (phaseSwitcher) phaseSwitcher.style.display = 'grid';
    this.renderPortalShortcuts();
  }

  backToPortalHome() {
    this.app.switchCentralSection('portal');
  }

  openEnvironmentProtocol(envId) {
    this.app.switchCentralSection('decisoes');
    this.app.decisoesController.openEnvironment(envId);
  }

  // ==========================================
  // PHASE 1: PLANEJAR METHODS
  // ==========================================
  renderPlanejarEnvironmentsScroll() {
    const container = document.getElementById('planejar-environments-scroll');
    if (!container) return;
    
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    
    container.innerHTML = allEnvIds.map(envId => {
      const envData = METODO_3P_DATABASE.checklists[envId];
      if (!envData) return '';
      
      const isSelected = this.activeEnvironment === envId;
      const isLocked = this.app.paywallController.isEnvironmentLocked(envId);
      const progress = this.getEnvironmentProgress(envId);
      
      const activeClass = isSelected ? 'active' : '';
      const lockIcon = isLocked ? ' 🔒' : '';
      
      return `
        <div class="env-carousel-card ${activeClass}" onclick="window.app.conteudosController.selectPlanejarEnvironment('${envId}')">
          <div style="font-size: 20px; margin-bottom: 6px;">${envData.emoji}</div>
          <div style="font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 2px;">${envData.name}${lockIcon}</div>
          <div style="font-size: 9px; color: ${isSelected ? '#32d74b' : '#8c96ab'}; font-weight: 600;">${progress.toFixed(0)}%</div>
        </div>
      `;
    }).join('');
  }

  selectPlanejarEnvironment(envId) {
    if (this.app.paywallController.isEnvironmentLocked(envId)) {
      this.app.paywallController.triggerEnvironmentPurchase(envId);
      return;
    }
    
    this.activeEnvironment = envId;
    localStorage.setItem('reformas_3p_active_env', envId);
    
    this.renderPlanejarEnvironmentsScroll();
    this.renderPlanejarEtapas();
    this.updatePlanejarPhaseProgress();
  }

  renderPlanejarEtapas() {
    const container = document.getElementById('planejar-etapas-list');
    if (!container) return;
    
    const envId = this.activeEnvironment || 'cozinha';
    const envData = METODO_3P_DATABASE.checklists[envId];
    if (!envData) return;
    
    const titleEl = document.getElementById('planejar-etapas-title');
    if (titleEl) titleEl.textContent = `📋 ETAPAS DO PLANEJAMENTO - ${envData.name.toUpperCase()}`;
    
    const tasks = envData.planejar || [];
    
    if (tasks.length === 0) {
      container.innerHTML = `<div style="font-size: 11px; color: #8c96ab; text-align: center; padding: 20px;">Nenhuma etapa encontrada.</div>`;
      return;
    }
    
    const pdfMap = {
      'coz-pl-1': 'pdf-doc', 'coz-pl-2': 'pdf-7', 'coz-pl-3': 'pdf-8', 'coz-pl-4': 'pdf-1',
      'ban-pl-1': 'pdf-doc', 'ban-pl-2': 'pdf-doc', 'ban-pl-3': 'pdf-8', 'ban-pl-4': 'pdf-7',
      'sal-pl-1': 'pdf-doc', 'sal-pl-2': 'pdf-6', 'sal-pl-3': 'pdf-7',
      'qua-pl-1': 'pdf-doc', 'qua-pl-2': 'pdf-6', 'qua-pl-3': 'pdf-7',
      'ext-pl-1': 'pdf-8', 'ext-pl-2': 'pdf-1', 'ext-pl-3': 'pdf-7'
    };
    
    let completedCount = 0;
    container.innerHTML = tasks.map(task => {
      const isCompleted = !!this.tasksProgress[task.id];
      if (isCompleted) completedCount++;
      const completedClass = isCompleted ? 'completed' : '';
      
      const pdfId = pdfMap[task.id] || 'pdf-doc';
      
      return `
        <div class="task-item-row ${completedClass}">
          <div class="task-checkbox-wrapper" onclick="window.app.conteudosController.togglePlanejarTask('${task.id}')">
            <div class="task-check-circle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="task-info-block" onclick="window.app.conteudosController.togglePlanejarTask('${task.id}')">
            <div class="task-title" style="font-weight: 700; font-size: 13px;">${task.title}</div>
            <div class="task-desc" style="font-size: 11px; color: var(--text-secondary);">${task.desc}</div>
          </div>
          <button class="btn btn-secondary btn-mini" style="margin-left: auto; font-size: 10px; padding: 4px 8px; border-color: rgba(50,215,75,0.3); color: #32d74b; background: rgba(50,215,75,0.05);" onclick="window.app.conteudosController.openPdfReader('${pdfId}')">Guia Técnico 📖</button>
        </div>`;
    }).join('');
    
    const countEl = document.getElementById('planejar-etapas-count');
    const barEl = document.getElementById('planejar-etapas-progress-bar');
    
    const pct = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    if (countEl) countEl.textContent = `${completedCount} de ${tasks.length} concluídas`;
    if (barEl) barEl.style.width = `${pct}%`;
  }

  togglePlanejarTask(taskId) {
    this.tasksProgress[taskId] = !this.tasksProgress[taskId];
    this.saveTasksProgress();
    this.renderPlanejarEtapas();
    this.renderPlanejarEnvironmentsScroll();
    this.updatePlanejarPhaseProgress();
    
    this.app.updateProfileStats();
    this.app.financeiroController.renderDashboardCentral();
    
    // Sync with Supabase in background
    if (supabaseDB && supabaseDB.isConfigured && this.app.userEmail) {
      supabaseDB.saveTaskProgress(
        this.app.userEmail,
        taskId,
        !!this.tasksProgress[taskId]
      );
    }
  }

  updatePlanejarPhaseProgress() {
    const planejarProgress = this.getPhaseProgress('planejar') || 0;
    const circle = document.getElementById('planejar-phase-circle');
    const pctLabel = document.getElementById('planejar-phase-pct');
    if (pctLabel) pctLabel.textContent = `${planejarProgress.toFixed(0)}%`;
    if (circle) {
      const offset = 100 - planejarProgress;
      circle.style.strokeDashoffset = offset;
    }
  }

  // ==========================================
  // PHASE 3: PROTEGER METHODS
  // ==========================================
  renderProtegerTab() {
    this.renderProtegerChecklistTable();
    this.renderProtegerGarantiasTable();
    this.renderProtegerRelatorioFinal();
  }

  switchProtegerStep(stepNum, scroll = false) {
    this.activeProtegerStep = stepNum;
    
    // Highlight timeline nodes
    for (let i = 1; i <= 3; i++) {
      const node = document.getElementById(`proteger-node-${i}`);
      if (node) {
        if (i < stepNum) {
          node.className = "timeline-step-node completed active";
        } else if (i === stepNum) {
          node.className = "timeline-step-node active";
        } else {
          node.className = "timeline-step-node";
        }
      }
    }
    
    // Update timeline line fill width
    const fill = document.getElementById('proteger-timeline-line-fill');
    if (fill) {
      const widthPct = (stepNum - 1) * 50; // 0%, 50%, 100%
      fill.style.width = `${widthPct}%`;
    }
    
    // Smooth scroll to the specific content section if requested by user click
    if (scroll) {
      const content = document.getElementById(`proteger-step-content-${stepNum}`);
      if (content) {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  renderProtegerChecklistTable() {
    const tbody = document.getElementById('proteger-checklist-table-body');
    if (!tbody) return;
    
    const envId = this.activeEnvironment || 'cozinha';
    const envData = METODO_3P_DATABASE.checklists[envId];
    if (!envData) return;
    
    const tasks = envData.proteger || [];
    
    if (tasks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma etapa de proteção cadastrada para este ambiente.</td></tr>`;
      return;
    }
    
    let completedCount = 0;
    tbody.innerHTML = tasks.map(task => {
      const isCompleted = !!this.tasksProgress[task.id];
      if (isCompleted) completedCount++;
      
      const statusBadge = isCompleted 
        ? `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 2px 6px;">Concluído ✓</span>`
        : `<span class="stats-badge" style="background: rgba(255,159,10,0.1); color: var(--color-warning); border: 1px solid rgba(255,159,10,0.2); font-size: 9px; padding: 2px 6px;">Pendente ⏱️</span>`;
        
      const toggleAction = `window.app.conteudosController.toggleProtegerTask('${task.id}')`;
      const actionBtn = `<button class="btn btn-secondary btn-mini" style="font-size: 9px; padding: 2px 6px;" onclick="${toggleAction}">${isCompleted ? 'Desmarcar' : 'Concluir'}</button>`;
      
      return `
        <tr>
          <td data-label="Etapa / Item"><strong>${task.title}</strong></td>
          <td data-label="Ambiente">${envData.name}</td>
          <td data-label="Status">${statusBadge}</td>
          <td data-label="Detalhes / Recomendação" style="font-size: 10px; color: #8c96ab; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${task.desc}</td>
          <td data-label="Ação">${actionBtn}</td>
        </tr>
      `;
    }).join('');
    
    // Update footer labels
    const concludedText = document.getElementById('proteger-checklist-concluidos-text');
    if (concludedText) {
      const pct = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
      concludedText.textContent = `${completedCount} de ${tasks.length} (${pct.toFixed(0)}%)`;
    }
    
    this.updateProtegerSummaryMetrics();
  }

  toggleProtegerTask(taskId) {
    this.tasksProgress[taskId] = !this.tasksProgress[taskId];
    this.saveTasksProgress();
    this.renderProtegerChecklistTable();
    this.updateProtegerPhaseProgress();
    
    this.app.updateProfileStats();
    this.app.financeiroController.renderDashboardCentral();
    
    // Sync with Supabase in background
    if (supabaseDB && supabaseDB.isConfigured && this.app.userEmail) {
      supabaseDB.saveTaskProgress(
        this.app.userEmail,
        taskId,
        !!this.tasksProgress[taskId]
      );
    }
  }

  updateProtegerPhaseProgress() {
    const protegerProgress = this.getPhaseProgress('proteger') || 0;
    const circle = document.getElementById('proteger-phase-circle');
    const pctLabel = document.getElementById('proteger-phase-pct');
    if (pctLabel) pctLabel.textContent = `${protegerProgress.toFixed(0)}%`;
    if (circle) {
      const offset = 100 - protegerProgress;
      circle.style.strokeDashoffset = offset;
    }
  }

  saveWarranties() {
    localStorage.setItem('reformas_3p_warranties', JSON.stringify(this.warranties));
    this.updateProtegerSummaryMetrics();
  }

  openAddWarrantyDrawer() {
    const supplier = prompt("Nome do Fornecedor / Fabricante:");
    if (!supplier) return;
    const item = prompt("Produto ou Serviço:");
    if (!item) return;
    const duration = prompt("Tempo de Garantia (Ex: 1 ano, 5 anos):");
    if (!duration) return;
    
    const today = new Date().toISOString().split('T')[0];
    const startDate = prompt("Data de Início (AAAA-MM-DD):", today) || today;
    
    let years = 1;
    if (duration.toLowerCase().includes('ano')) {
      years = parseInt(duration) || 1;
    } else if (duration.toLowerCase().includes('mes')) {
      years = (parseInt(duration) || 12) / 12;
    }
    
    let endDate = '';
    try {
      const d = new Date(startDate + 'T00:00:00');
      d.setFullYear(d.getFullYear() + years);
      endDate = d.toISOString().split('T')[0];
    } catch(e) {
      endDate = startDate;
    }
    
    const newWarranty = {
      id: 'warr-' + Date.now(),
      supplier: supplier,
      item: item,
      duration: duration,
      startDate: startDate,
      endDate: endDate,
      docUrl: '#'
    };
    
    this.warranties.push(newWarranty);
    this.saveWarranties();
    this.renderProtegerGarantiasTable();
    this.app.triggerPushNotification("🛡️ GARANTIA ADICIONADA", `Garantia de "${item}" registrada com sucesso.`, "success");
  }

  deleteWarranty(id) {
    this.warranties = this.warranties.filter(w => w.id !== id);
    this.saveWarranties();
    this.renderProtegerGarantiasTable();
  }

  renderProtegerGarantiasTable() {
    const tbody = document.getElementById('proteger-garantias-table-body');
    if (!tbody) return;
    
    if (this.warranties.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma garantia registrada ainda. Clique em "Adicionar garantia".</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.warranties.map(w => {
      let fStart = w.startDate;
      let fEnd = w.endDate;
      try {
        fStart = new Date(w.startDate + 'T00:00:00').toLocaleDateString('pt-BR');
        fEnd = new Date(w.endDate + 'T00:00:00').toLocaleDateString('pt-BR');
      } catch (e) {}
      
      const docLink = w.docUrl && w.docUrl !== '#'
        ? `<a href="${w.docUrl}" target="_blank" style="color: #bf5af2; font-weight: 700; text-decoration: none;">Download 📂</a>`
        : `<span style="color: #8c96ab; font-style: italic;">Sem anexo</span>`;
        
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.conteudosController.deleteWarranty('${w.id}')">✕</button>`;
      
      return `
        <tr>
          <td><strong>${w.supplier}</strong></td>
          <td>${w.item}</td>
          <td style="color: #bf5af2; font-weight: 700;">${w.duration}</td>
          <td>${fStart}</td>
          <td>${fEnd}</td>
          <td>${docLink}</td>
          <td>${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  }

  renderProtegerRelatorioFinal() {
    const fin = this.app.financeiroController;
    if (!fin) return;
    
    const totalSpent = fin.getTotalSpent();
    const budget = fin.budget;
    const economy = budget - totalSpent;
    
    const budgetEl = document.getElementById('report-metric-budget');
    const executedEl = document.getElementById('report-metric-executed');
    const economyEl = document.getElementById('report-metric-economy');
    
    if (budgetEl) budgetEl.textContent = fin.formatCurrency(budget);
    if (executedEl) executedEl.textContent = fin.formatCurrency(totalSpent);
    if (economyEl) {
      economyEl.textContent = fin.formatCurrency(Math.max(0, economy));
      economyEl.style.color = economy >= 0 ? '#32d74b' : '#ff453a';
    }
    
    // Update doc counters
    const nfEl = document.getElementById('report-doc-count-nfs');
    const contractEl = document.getElementById('report-doc-count-contracts');
    const warrantyEl = document.getElementById('report-doc-count-warranties');
    const receiptEl = document.getElementById('report-doc-count-receipts');
    const photoEl = document.getElementById('report-doc-count-photos');
    
    const invoiceExpenses = fin.expenses.filter(e => e.status === 'pago');
    const pendingExpenses = fin.expenses.filter(e => e.status === 'a_pagar');
    
    if (nfEl) nfEl.textContent = `${invoiceExpenses.length} arquivos`;
    if (contractEl) contractEl.textContent = `${Math.min(3, fin.expenses.length)} arquivos`;
    if (warrantyEl) warrantyEl.textContent = `${this.warranties.length} arquivos`;
    if (receiptEl) receiptEl.textContent = `${pendingExpenses.length} arquivos`;
    
    let photosCount = 0;
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    allEnvIds.forEach(envId => {
      const savedPhotos = localStorage.getItem(`reformas_3p_photos_${envId}`);
      if (savedPhotos) {
        try {
          const list = JSON.parse(savedPhotos);
          photosCount += list.length;
        } catch (e) {}
      }
    });
    if (photoEl) photoEl.textContent = `${photosCount} arquivos`;
  }

  saveContracts() {
    localStorage.setItem('reformas_3p_contracts', JSON.stringify(this.contracts));
    this.updateProtegerSummaryMetrics();
  }

  savePendencias() {
    localStorage.setItem('reformas_3p_pendencias', JSON.stringify(this.pendencias));
    this.updateProtegerSummaryMetrics();
  }

  saveWarranties() {
    localStorage.setItem('reformas_3p_warranties', JSON.stringify(this.warranties));
    this.updateProtegerSummaryMetrics();
  }

  saveWarrantyFromForm() {
    const type = document.getElementById('warr-type')?.value || 'Garantia';
    const supplier = document.getElementById('warr-supplier')?.value.trim();
    const item = document.getElementById('warr-item')?.value.trim();
    const duration = document.getElementById('warr-duration')?.value.trim() || 'N/A';
    const startDate = document.getElementById('warr-date')?.value || new Date().toISOString().split('T')[0];
    const file = document.getElementById('warr-file')?.value.trim() || '#';
    const obs = document.getElementById('warr-obs')?.value.trim() || '';
    
    if (!supplier || !item) {
      alert("Por favor, preencha o Fornecedor e o Item/Produto.");
      return;
    }
    
    let years = 1;
    if (duration.toLowerCase().includes('ano')) {
      years = parseInt(duration) || 1;
    } else if (duration.toLowerCase().includes('mes') || duration.toLowerCase().includes('mês')) {
      years = (parseInt(duration) || 12) / 12;
    }
    
    let endDate = '';
    try {
      const d = new Date(startDate + 'T00:00:00');
      d.setFullYear(d.getFullYear() + years);
      endDate = d.toISOString().split('T')[0];
    } catch(e) {
      endDate = startDate;
    }
    
    const newWarranty = {
      id: 'warr-' + Date.now(),
      type,
      supplier,
      item,
      duration,
      startDate,
      endDate,
      docUrl: file,
      obs
    };
    
    this.warranties.push(newWarranty);
    this.saveWarranties();
    this.renderProtegerGarantiasTable();
    
    this.app.triggerPushNotification("🛡️ DOCUMENTO SALVO", `${type} de "${item}" salva com sucesso.`, "success");
    
    // Clear form
    if (document.getElementById('warr-supplier')) document.getElementById('warr-supplier').value = '';
    if (document.getElementById('warr-item')) document.getElementById('warr-item').value = '';
    if (document.getElementById('warr-duration')) document.getElementById('warr-duration').value = '';
    if (document.getElementById('warr-date')) document.getElementById('warr-date').value = '';
    if (document.getElementById('warr-file')) document.getElementById('warr-file').value = '';
    if (document.getElementById('warr-obs')) document.getElementById('warr-obs').value = '';
  }

  deleteWarranty(id) {
    this.warranties = this.warranties.filter(w => w.id !== id);
    this.saveWarranties();
    this.renderProtegerGarantiasTable();
  }

  renderProtegerGarantiasTable() {
    const tbody = document.getElementById('proteger-garantias-table-body');
    if (!tbody) return;
    
    if (this.warranties.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhum documento registrado ainda. Preencha o formulário acima.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.warranties.map(w => {
      let fStart = w.startDate;
      try {
        fStart = new Date(w.startDate + 'T00:00:00').toLocaleDateString('pt-BR');
      } catch (e) {}
      
      const docLink = w.docUrl && w.docUrl !== '#'
        ? `<a href="#" onclick="alert('Visualização do documento: ${w.docUrl}'); return false;" style="color: #bf5af2; font-weight: 700; text-decoration: none;">Link 📂</a>`
        : `<span style="color: #8c96ab; font-style: italic;">Sem anexo</span>`;
        
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.conteudosController.deleteWarranty('${w.id}')">✕</button>`;
      
      const typeBadge = `<span class="stats-badge" style="background: rgba(191,90,242,0.1); color: #bf5af2; border: 1px solid rgba(191,90,242,0.2); font-size: 9px; padding: 2px 6px;">${w.type || 'Garantia'}</span>`;
      
      return `
        <tr>
          <td data-label="Tipo">${typeBadge}</td>
          <td data-label="Fornecedor"><strong>${w.supplier}</strong></td>
          <td data-label="Item / Descrição">${w.item}</td>
          <td data-label="Garantia" style="color: #bf5af2; font-weight: 700;">${w.duration}</td>
          <td data-label="Início">${fStart}</td>
          <td data-label="Anexo">${docLink}</td>
          <td data-label="Excluir">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  }

  openAddContratoModal() {
    const service = prompt("Serviço / Objeto do Contrato (Ex: Pintura, Gesso, Obra Geral):");
    if (!service) return;
    const provider = prompt("Empresa ou Profissional Contratado:");
    if (!provider) return;
    const value = parseFloat(prompt("Valor Total do Contrato (R$):")) || 0;
    
    const newContract = {
      id: 'contract-' + Date.now(),
      service: service,
      provider: provider,
      value: value,
      date: new Date().toISOString().split('T')[0]
    };
    
    this.contracts.push(newContract);
    this.saveContracts();
    this.renderProtegerContratosTable();
    this.app.triggerPushNotification("📂 CONTRATO INCLUÍDO", `Contrato de "${service}" registrado.`, "success");
  }

  deleteContract(id) {
    this.contracts = this.contracts.filter(c => c.id !== id);
    this.saveContracts();
    this.renderProtegerContratosTable();
  }

  renderProtegerContratosTable() {
    const tbody = document.getElementById('proteger-contratos-tbody');
    if (!tbody) return;
    
    if (this.contracts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhum contrato registrado ainda. Clique em "Novo Contrato".</td></tr>`;
      return;
    }
    
    const fin = this.app.financeiroController;
    tbody.innerHTML = this.contracts.map(c => {
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.conteudosController.deleteContract('${c.id}')">✕</button>`;
      const formattedValue = fin ? fin.formatCurrency(c.value) : `R$ ${c.value.toFixed(2)}`;
      return `
        <tr>
          <td data-label="Serviço"><strong>${c.service}</strong></td>
          <td data-label="Contratado">${c.provider}</td>
          <td data-label="Valor total" style="color: #bf5af2; font-weight: 700;">${formattedValue}</td>
          <td data-label="Excluir">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  }

  renderAcompanhamentoObra() {
    const container = document.getElementById('proteger-acompanhamento-list');
    if (!container) return;
    
    const stages = [
      "Demolição", "Infraestrutura", "Elétrica", "Hidráulica", 
      "Revestimentos", "Pintura", "Instalações", "Acabamentos", 
      "Limpeza Final", "Entrega Final"
    ];
    
    let progress = {};
    try {
      progress = JSON.parse(localStorage.getItem('reformas_3p_acompanhamento') || '{}');
    } catch(e) {}
    
    container.innerHTML = stages.map((stage, idx) => {
      const currentPct = progress[stage] !== undefined ? progress[stage] : 0;
      
      const pctOptions = [0, 25, 50, 75, 100];
      const buttonsHtml = pctOptions.map(pct => {
        const isActive = currentPct === pct;
        let btnBg = 'transparent';
        let borderCol = 'rgba(255,255,255,0.1)';
        if (isActive) {
          btnBg = pct === 100 ? '#30d158' : '#bf5af2';
          borderCol = pct === 100 ? '#30d158' : '#bf5af2';
        }
        return `
          <button type="button" class="btn-stage-pct" onclick="window.app.conteudosController.setStageProgress('${stage}', ${pct})" style="padding: 4px 6px; font-size: 9px; font-weight: bold; border-radius: 4px; border: 1px solid ${borderCol}; background: ${btnBg}; color: #fff; cursor: pointer; min-width: 36px; transition: all 0.2s;">
            ${pct}%
          </button>
        `;
      }).join('');
      
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 10px; color: #8c96ab; width: 18px;">${idx + 1}.</span>
            <span style="font-size: 11px; font-weight: 700; color: #fff;">${stage}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center;">
            ${buttonsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  setStageProgress(stage, pct) {
    let progress = {};
    try {
      progress = JSON.parse(localStorage.getItem('reformas_3p_acompanhamento') || '{}');
    } catch(e) {}
    
    progress[stage] = pct;
    localStorage.setItem('reformas_3p_acompanhamento', JSON.stringify(progress));
    
    this.renderAcompanhamentoObra();
    
    // Update central stats
    this.app.financeiroController.updateDashboard();
  }

  savePendenciaFromForm() {
    const detail = document.getElementById('pend-detail')?.value.trim();
    const responsible = document.getElementById('pend-responsible')?.value.trim() || 'Empreiteiro';
    const deadline = document.getElementById('pend-deadline')?.value.trim() || 'N/A';
    const status = document.getElementById('pend-status')?.value || 'Aberta';
    const photo = document.getElementById('pend-photo')?.value.trim() || '#';
    
    if (!detail) {
      alert("Por favor, preencha a descrição da pendência.");
      return;
    }
    
    const newPendencia = {
      id: 'pend-' + Date.now(),
      detail,
      responsible,
      deadline,
      status,
      photo
    };
    
    this.pendencias.push(newPendencia);
    this.savePendencias();
    this.renderProtegerPendenciasTable();
    
    this.app.triggerPushNotification("📋 PENDÊNCIA SALVA", `Pendência registrada com sucesso.`, "warning");
    
    // Clear form
    if (document.getElementById('pend-detail')) document.getElementById('pend-detail').value = '';
    if (document.getElementById('pend-responsible')) document.getElementById('pend-responsible').value = '';
    if (document.getElementById('pend-deadline')) document.getElementById('pend-deadline').value = '';
    if (document.getElementById('pend-photo')) document.getElementById('pend-photo').value = '';
  }

  deletePendencia(id) {
    this.pendencias = this.pendencias.filter(p => p.id !== id);
    this.savePendencias();
    this.renderProtegerPendenciasTable();
  }

  togglePendenciaNextStatus(id) {
    const pend = this.pendencias.find(p => p.id === id);
    if (!pend) return;
    const order = ['Aberta', 'Em andamento', 'Resolvida', 'Cancelada'];
    let idx = order.indexOf(pend.status);
    if (idx === -1) idx = 0;
    pend.status = order[(idx + 1) % order.length];
    this.savePendencias();
    this.renderProtegerPendenciasTable();
  }

  renderProtegerPendenciasTable() {
    const tbody = document.getElementById('proteger-pendencias-tbody');
    if (!tbody) return;
    
    if (this.pendencias.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma pendência registrada ainda.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.pendencias.map(p => {
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.conteudosController.deletePendencia('${p.id}')">✕</button>`;
      
      const statusColors = {
        'Aberta': 'background: rgba(255,59,48,0.1); color: var(--color-danger); border: 1px solid rgba(255,59,48,0.2);',
        'Em andamento': 'background: rgba(255,159,10,0.1); color: var(--color-warning); border: 1px solid rgba(255,159,10,0.2);',
        'Resolvida': 'background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2);',
        'Cancelada': 'background: rgba(255,255,255,0.05); color: #8c96ab; border: 1px solid rgba(255,255,255,0.1);'
      };
      
      const statusBadge = `<span class="stats-badge" style="font-size: 9px; padding: 4px 8px; border-radius: 4px; cursor: pointer; ${statusColors[p.status] || ''}" onclick="window.app.conteudosController.togglePendenciaNextStatus('${p.id}')">${p.status}</span>`;
      
      return `
        <tr>
          <td data-label="Pendência"><strong>${p.detail}</strong></td>
          <td data-label="Responsável">${p.responsible}</td>
          <td data-label="Prazo limite">${p.deadline}</td>
          <td data-label="Status">${statusBadge}</td>
          <td data-label="Excluir">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  }

  renderProtegerChecklistTable() {
    const container = document.getElementById('vistoria-checklist-container');
    if (!container) return;
    
    const items = [
      { id: "v1", title: "🔌 Elétrica testada", desc: "Tomadas, lâmpadas, disjuntores e fiação verificados." },
      { id: "v2", title: "🚿 Hidráulica testada", desc: "Vazamentos, ralos, fluxo de água e pressão checados." },
      { id: "v3", title: "✨ Acabamentos revisados", desc: "Pintura, gesso, rodapés e rejuntes sem falhas visíveis." },
      { id: "v4", title: "🚪 Portas funcionando", desc: "Dobradiças, fechaduras e fechamento perfeitos." },
      { id: "v5", title: "🪟 Janelas funcionando", desc: "Correr suave, travas e esquadrias vedadas." },
      { id: "v6", title: "💡 Iluminação funcionando", desc: "Todos os spots, lustres e fitas de LED acesos." },
      { id: "v7", title: "🛡️ Garantias anexadas", desc: "Todos os manuais e termos guardados no app." },
      { id: "v8", title: "📁 Contratos arquivados", desc: "Todos os acordos de prestação de serviço assinados." },
      { id: "v9", title: "📋 Pendências resolvidas", desc: "Nenhum erro grave pendente de correção." },
      { id: "v10", title: "🧹 Limpeza final realizada", desc: "Canteiro limpo, resíduos e entulho descartados." }
    ];
    
    let checked = {};
    try {
      checked = JSON.parse(localStorage.getItem('reformas_3p_checklist_final') || '{}');
    } catch(e) {}
    
    let completedCount = 0;
    container.innerHTML = items.map(item => {
      const isChecked = !!checked[item.id];
      if (isChecked) completedCount++;
      
      return `
        <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); cursor: pointer;">
          <input type="checkbox" style="margin-top: 3px;" ${isChecked ? 'checked' : ''} onchange="window.app.conteudosController.toggleChecklistFinalItem('${item.id}', this.checked)">
          <div>
            <strong style="font-size: 12px; color: #fff; display: block;">${item.title}</strong>
            <span style="font-size: 10px; color: #8c96ab;">${item.desc}</span>
          </div>
        </label>
      `;
    }).join('');
    
    const pct = items.length > 0 ? (completedCount / items.length) * 100 : 0;
    const txt = document.getElementById('proteger-checklist-concluidos-text');
    if (txt) {
      txt.textContent = `${completedCount} de ${items.length} (${pct.toFixed(0)}%)`;
    }
  }

  toggleChecklistFinalItem(id, isChecked) {
    let checked = {};
    try {
      checked = JSON.parse(localStorage.getItem('reformas_3p_checklist_final') || '{}');
    } catch(e) {}
    
    checked[id] = isChecked;
    localStorage.setItem('reformas_3p_checklist_final', JSON.stringify(checked));
    
    this.renderProtegerChecklistTable();
    this.updateProtegerSummaryMetrics();
  }

  finalizarReforma() {
    let checked = {};
    try {
      checked = JSON.parse(localStorage.getItem('reformas_3p_checklist_final') || '{}');
    } catch(e) {}
    
    const checkedCount = Object.values(checked).filter(v => v).length;
    if (checkedCount < 10) {
      alert("Atenção: É recomendado concluir todos os 10 itens de vistoria técnica antes de finalizar a reforma.");
      if (!confirm("Deseja finalizar mesmo com vistorias pendentes?")) return;
    }
    
    const resultado = document.getElementById('vistoria-resultado')?.value || 'aprovado';
    const obs = document.getElementById('vistoria-obs')?.value.trim() || '';
    const fotos = document.getElementById('vistoria-fotos')?.value.trim() || '';
    
    localStorage.setItem('reformas_3p_obra_concluida', 'true');
    localStorage.setItem('reformas_3p_vistoria_resultado', resultado);
    localStorage.setItem('reformas_3p_vistoria_obs', obs);
    localStorage.setItem('reformas_3p_vistoria_fotos', fotos);
    
    // Set all stage progress to 100%
    const stages = [
      "Demolição", "Infraestrutura", "Elétrica", "Hidráulica", 
      "Revestimentos", "Pintura", "Instalações", "Acabamentos", 
      "Limpeza Final", "Entrega Final"
    ];
    let progress = {};
    stages.forEach(s => progress[s] = 100);
    localStorage.setItem('reformas_3p_acompanhamento', JSON.stringify(progress));
    
    this.app.financeiroController.updateDashboard();
    window.app.closeProtegerDrawer('checklist');
    
    // Switch to Painel to show completed state
    this.app.switchTab('painel');
    
    this.app.triggerPushNotification(
      "🏆 REFORMA CONCLUÍDA!",
      "Parabéns! Sua reforma foi finalizada seguindo o Método 3P.",
      "success"
    );
  }

  renderProtegerRelatorioFinal() {
    const fin = this.app.financeiroController;
    if (!fin) return;
    
    const totalSpent = fin.getTotalSpent();
    const budget = fin.budget;
    const economy = budget - totalSpent;
    
    const budgetEl = document.getElementById('report-metric-budget');
    const executedEl = document.getElementById('report-metric-executed');
    const economyEl = document.getElementById('report-metric-economy');
    
    if (budgetEl) budgetEl.textContent = fin.formatCurrency(budget);
    if (executedEl) executedEl.textContent = fin.formatCurrency(totalSpent);
    if (economyEl) {
      economyEl.textContent = fin.formatCurrency(Math.max(0, economy));
      economyEl.style.color = economy >= 0 ? '#32d74b' : '#ff453a';
    }
    
    // Update doc counters
    const nfEl = document.getElementById('report-doc-count-nfs');
    const contractEl = document.getElementById('report-doc-count-contracts');
    const warrantyEl = document.getElementById('report-doc-count-warranties');
    const receiptEl = document.getElementById('report-doc-count-receipts');
    const photoEl = document.getElementById('report-doc-count-photos');
    
    const invoiceExpenses = fin.expenses.filter(e => e.status === 'pago');
    const pendingExpenses = fin.expenses.filter(e => e.status === 'a_pagar');
    
    if (nfEl) nfEl.textContent = `${invoiceExpenses.length} arquivos`;
    if (contractEl) contractEl.textContent = `${Math.min(3, fin.expenses.length)} arquivos`;
    if (warrantyEl) warrantyEl.textContent = `${this.warranties.length} arquivos`;
    if (receiptEl) receiptEl.textContent = `${pendingExpenses.length} arquivos`;
    
    let photosCount = 0;
    const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    allEnvIds.forEach(envId => {
      const savedPhotos = localStorage.getItem(`reformas_3p_photos_${envId}`);
      if (savedPhotos) {
        try {
          const list = JSON.parse(savedPhotos);
          photosCount += list.length;
        } catch (e) {}
      }
    });
    if (photoEl) photoEl.textContent = `${photosCount} arquivos`;
  }

  updateProtegerSummaryMetrics() {
    const hasGarantias = this.warranties.length > 0;
    const hasContratos = this.contracts.length > 0;
    
    let checklistPercent = 0;
    let checked = {};
    try {
      checked = JSON.parse(localStorage.getItem('reformas_3p_checklist_final') || '{}');
      const checkedCount = Object.values(checked).filter(v => v).length;
      checklistPercent = (checkedCount / 10) * 100;
    } catch(e) {}
    
    let progress = {};
    try {
      progress = JSON.parse(localStorage.getItem('reformas_3p_acompanhamento') || '{}');
    } catch(e) {}
    const hasAcompanhamento = Object.keys(progress).length > 0;
    
    const chkGarantias = document.getElementById('chk-garantias-status');
    const chkContratos = document.getElementById('chk-contratos-status');
    const chkAcompanhamentos = document.getElementById('chk-acompanhamentos-status');
    const chkChecklist = document.getElementById('chk-checklist-status');
    
    if (chkGarantias) chkGarantias.textContent = hasGarantias ? '🟢' : '⚪';
    if (chkContratos) chkContratos.textContent = hasContratos ? '🟢' : '⚪';
    if (chkAcompanhamentos) chkAcompanhamentos.textContent = hasAcompanhamento ? '🟢' : '⚪';
    if (chkChecklist) chkChecklist.textContent = checklistPercent > 0 ? '🟢' : '⚪';
    
    const progressPercent = Math.round(
      (hasGarantias ? 25 : 0) +
      (hasContratos ? 25 : 0) +
      (hasAcompanhamento ? 25 : 0) +
      (checklistPercent * 0.25)
    );
    
    const progressCircle = document.getElementById('proteger-progress-circle');
    const progressText = document.getElementById('proteger-progress-text');
    
    if (progressCircle) {
      progressCircle.style.strokeDasharray = `${progressPercent}, 100`;
    }
    if (progressText) {
      progressText.textContent = `${progressPercent}%`;
    }
    
    const timelineText = document.getElementById('proteger-timeline-progress-text');
    if (timelineText) {
      timelineText.textContent = `${progressPercent}% concluído`;
    }
    
    const gPct = document.getElementById('proteger-garantias-pct');
    const gBar = document.getElementById('proteger-garantias-bar');
    if (gPct) gPct.textContent = hasGarantias ? '100%' : '0%';
    if (gBar) gBar.style.width = hasGarantias ? '100%' : '0%';

    const cPct = document.getElementById('proteger-contratos-pct');
    const cBar = document.getElementById('proteger-contratos-bar');
    if (cPct) cPct.textContent = hasContratos ? '100%' : '0%';
    if (cBar) cBar.style.width = hasContratos ? '100%' : '0%';

    const pPct = document.getElementById('proteger-pendencias-pct');
    const pBar = document.getElementById('proteger-pendencias-bar');
    if (pPct) pPct.textContent = hasAcompanhamento ? '100%' : '0%';
    if (pBar) pBar.style.width = hasAcompanhamento ? '100%' : '0%';

    const fPct = document.getElementById('proteger-final-pct');
    const fBar = document.getElementById('proteger-final-bar');
    if (fPct) fPct.textContent = `${checklistPercent.toFixed(0)}%`;
    if (fBar) fBar.style.width = `${checklistPercent}%`;
  }
}
