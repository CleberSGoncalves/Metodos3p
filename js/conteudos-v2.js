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
    this.renderEnvironmentCards();
    this.renderPdfGrid();
    
    // Init sequential cronograma durations
    this.initCronograma();
    this.renderRiskScanner();
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
}
