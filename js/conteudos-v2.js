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
    const activeEnvironments = this.app.selectedEnvironments;
    if (activeEnvironments.length === 0) return 0;
    
    let totalProgressSum = 0;
    activeEnvironments.forEach(envId => {
      totalProgressSum += this.getEnvironmentProgress(envId);
    });
    
    return totalProgressSum / activeEnvironments.length;
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
  renderPdfGrid() {
    const container = document.getElementById('library-grid-container');
    if (!container) return;
    
    const library = METODO_3P_DATABASE.library;
    
    const filtered = library.filter(pdf => {
      const matchesCat = this.libraryFilterCategory === 'all' || pdf.category === this.libraryFilterCategory;
      const matchesSearch = this.librarySearchQuery === '' || 
        pdf.title.toLowerCase().includes(this.librarySearchQuery.toLowerCase()) ||
        pdf.desc.toLowerCase().includes(this.librarySearchQuery.toLowerCase()) ||
        pdf.tags.some(tag => tag.toLowerCase().includes(this.librarySearchQuery.toLowerCase()));
        
      return matchesCat && matchesSearch;
    });
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: span 2">
          <div class="empty-emoji">🔍</div>
          <h4>Nenhum guia encontrado</h4>
          <p>Tente buscar por termos simples como 'porcelanato', 'vazamento' ou 'cimento'.</p>
        </div>`;
      return;
    }
    
    container.innerHTML = filtered.map(pdf => {
      const isLocked = this.app.paywallController.isPdfLocked(pdf.id, pdf.category);
      
      if (isLocked) {
        return `
          <div class="premium-pdf-card locked" onclick="window.app.paywallController.showPaywallModal()">
            <div class="premium-pdf-left">
              <div class="pdf-tag-row">
                <span class="pdf-cat-badge ${pdf.category}">${pdf.category.toUpperCase()}</span>
                <span class="pdf-pages-badge">📄 ${pdf.pages} PÁG</span>
              </div>
              <h4 class="pdf-title">${pdf.title}</h4>
              <p class="pdf-desc">${pdf.desc}</p>
              <div class="pdf-card-action">
                <span class="pdf-action-btn premium">🔓 LIBERAR GUIA PREMIUM</span>
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
              <span class="pdf-action-btn">LER GUIA AGORA ➔</span>
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
    const pdf = METODO_3P_DATABASE.library.find(p => p.id === id);
    if (!pdf) return;
    
    // If it is the app manual, open it locally in the drawer so they have a nice local documentation viewer!
    if (id === 'pdf-doc') {
      const overlay = document.getElementById('drawer-pdf-overlay');
      const drawerTitle = document.getElementById('pdf-reader-title');
      const drawerCat = document.getElementById('pdf-reader-category');
      const simulatedPages = document.querySelector('.pdf-simulated-pages');
      
      if (drawerTitle) drawerTitle.textContent = pdf.title;
      if (drawerCat) drawerCat.textContent = pdf.category.toUpperCase();
      
      if (simulatedPages) {
        simulatedPages.innerHTML = `
          <div class="pdf-page-view" style="background: #ffffff; color: #000000; padding: 20px; border-radius: 12px; font-size: 12px; line-height: 1.6; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            ${pdf.content}
          </div>
        `;
      }
      
      if (overlay) overlay.classList.add('active');
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

  closePdfReader() {
    document.getElementById('drawer-pdf-overlay').classList.remove('active');
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
          <td><strong>${task.title}</strong></td>
          <td>${envData.name}</td>
          <td>${statusBadge}</td>
          <td style="font-size: 10px; color: #8c96ab; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${task.desc}</td>
          <td>${actionBtn}</td>
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

  updateProtegerSummaryMetrics() {
    const checkedItemsEl = document.getElementById('proteger-metric-checked-items');
    const checkedItemsPctEl = document.getElementById('proteger-metric-checked-items-pct');
    const warrantiesEl = document.getElementById('proteger-metric-warranties');
    const documentsEl = document.getElementById('proteger-metric-documents');
    const finalProgressEl = document.getElementById('proteger-metric-final-progress');
    
    const activeEnvironments = this.app.selectedEnvironments || ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    activeEnvironments.forEach(envId => {
      const envData = METODO_3P_DATABASE.checklists[envId];
      if (envData && envData.proteger) {
        envData.proteger.forEach(t => {
          totalTasks++;
          if (this.tasksProgress[t.id]) completedTasks++;
        });
      }
    });
    
    if (checkedItemsEl) checkedItemsEl.textContent = `${completedTasks} / ${totalTasks}`;
    if (checkedItemsPctEl) {
      const pct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      checkedItemsPctEl.textContent = `${pct.toFixed(0)}% concluído`;
    }
    
    if (warrantiesEl) warrantiesEl.textContent = this.warranties.length.toString();
    
    let docsCount = this.warranties.length;
    const fin = this.app.financeiroController;
    if (fin) {
      docsCount += fin.expenses.length;
    }
    if (documentsEl) documentsEl.textContent = docsCount.toString();
    
    const overallProgress = this.getPhaseProgress('proteger') || 0;
    if (finalProgressEl) finalProgressEl.textContent = `${overallProgress.toFixed(0)}%`;
  }
}
