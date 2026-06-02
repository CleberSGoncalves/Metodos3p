// ==========================================================================
// MAIN APP CONTROLLER - ORCHESTRATOR OF THE METODO 3P APP
// ==========================================================================

class AppOrchestrator {
  constructor() {
    this.name = "Cleber";
    this.userEmail = null; // E-mail real do Google
    this.reformaType = "casa_toda";
    this.selectedEnvironments = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
    
    // Initialize child controllers
    this.database = METODO_3P_DATABASE;
    this.financeiroController = new FinancialController(this);
    this.decisoesController = new DecisionsController(this);
    this.conteudosController = new ContentsController(this);
    this.paywallController = new PaywallController(this);
    
    // PWA deferred install prompt
    this.deferredPrompt = null;
  }

  init() {
    console.log("Initializing Reformas Sem Erro (Método 3P) App Orchestrator...");
    
    // Carregar e-mail salvo (indica que o usuário já fez login antes)
    const savedEmail = localStorage.getItem('reformas_3p_user_email');
    if (savedEmail) {
      this.userEmail = savedEmail;
      const emailEl = document.getElementById('profile-email');
      if (emailEl) emailEl.textContent = savedEmail;
    }
    
    // Load persisted onboarding details
    const savedName = localStorage.getItem('reformas_3p_user_name');
    if (savedName) this.name = savedName;
    
    const savedPicture = localStorage.getItem('reformas_3p_user_picture');
    this.syncUserAvatars(savedPicture, this.name);
    
    const savedReformaType = localStorage.getItem('reformas_3p_reforma_type');
    if (savedReformaType) this.reformaType = savedReformaType;
    
    const savedSelectedEnvs = localStorage.getItem('reformas_3p_selected_envs');
    if (savedSelectedEnvs) {
      try {
        this.selectedEnvironments = JSON.parse(savedSelectedEnvs);
      } catch (e) {
        console.error("Erro ao analisar ambientes salvos:", e);
        this.selectedEnvironments = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
      }
    }
    
    // Check if onboarding was completed
    const onboardingFinished = localStorage.getItem('reformas_3p_onboarding_finished');
    
    // Initialize children modules
    this.financeiroController.init();
    this.conteudosController.init();
    this.paywallController.init();
    this.decisoesController.init();
    
    const infoBtn = document.getElementById('btn-show-infographic');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.showInfographic());
    }
    
    // APRESENTAÇÃO DE ABERTURA FIXA (BRILHO CINEMATOGRÁFICO)
    this.playSplashAnimation('cinematic');
    
    // Listen for PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.updateInstallButtonsState();
    });

    window.addEventListener('appinstalled', (evt) => {
      console.log('PWA was installed successfully');
      this.deferredPrompt = null;
      this.updateInstallButtonsState();
      this.triggerPushNotification("🎉 APLICATIVO INSTALADO!", "Reformas Sem Erro foi adicionado com sucesso à sua tela de início!", "success");
    });

    // Check device type and standalone state
    this.updateInstallButtonsState();

    this.updateProfileStats();
    this.loadPreferences();
    this.initGoogleAuth();
  }

  // ==========================================================================
  // ONBOARDING NAVIGATION AND SETUP WIZARD
  // ==========================================================================
  showOnboardingScreen() {
    document.getElementById('screen-onboarding').classList.add('active');
    document.getElementById('screen-main').classList.remove('active');
    const wizardBtn = document.getElementById('dash-floating-wizard-btn');
    if (wizardBtn) wizardBtn.style.display = 'none';
    const navBar = document.querySelector('.app-navigation-bar');
    if (navBar) navBar.style.display = 'none';
    this.nextOnboardingSlide(1);
  }

  showMainAppScreen() {
    document.getElementById('screen-onboarding').classList.remove('active');
    document.getElementById('screen-main').classList.add('active');
    const navBar = document.querySelector('.app-navigation-bar');
    if (navBar) navBar.style.display = '';
    
    // Welcome push notification simulation
    setTimeout(() => {
      this.triggerPushNotification(
        "👋 BEM-VINDO, " + this.name.toUpperCase() + "!",
        "Seu Centro de Comando do Método 3P está ativo offline. Rumo à obra sem erro!",
        "success"
      );
    }, 1000);
    
    // Load initial dashboard calculations
    this.switchTab('painel');
    this.financeiroController.updateDashboard();
  }



  nextOnboardingSlide(slideNum) {
    const slides = document.querySelectorAll('.onboarding-slide');
    slides.forEach(s => s.classList.remove('active'));
    
    if (slideNum === 1) {
      document.getElementById('ob-slide-welcome').classList.add('active');
    } else if (slideNum === 2) {
      document.getElementById('ob-slide-setup').classList.add('active');
    } else if (slideNum === 3) {
      document.getElementById('ob-slide-budget').classList.add('active');
      
      const nameInput = document.getElementById('setup-name');
      if (nameInput) this.name = nameInput.value.trim() || "Cleber";
    }
  }

  setReformaType(type) {
    this.reformaType = type;
    
    const cards = document.querySelectorAll('.radio-cards-group .radio-card');
    cards.forEach(c => c.classList.remove('active'));
    
    const activeIndex = type === 'casa_toda' ? 0 : 1;
    cards[activeIndex].classList.add('active');
  }

  toggleEnvironmentCheckbox(checkboxEl) {
    const card = checkboxEl.closest('.checkbox-card');
    if (checkboxEl.checked) {
      card.classList.add('checked');
    } else {
      card.classList.remove('checked');
    }
  }

  finishOnboarding() {
    const nameInput = document.getElementById('setup-name');
    this.name = nameInput ? nameInput.value.trim() : (this.name || "Usuário");
    localStorage.setItem('reformas_3p_user_name', this.name);
    
    const budgetInput = document.getElementById('setup-budget');
    const budgetVal = budgetInput ? parseFloat(budgetInput.value) : 50000;
    this.financeiroController.setBudget(budgetVal);
    
    const checkedEnvs = document.querySelectorAll('input[name="setup-environments"]:checked');
    this.selectedEnvironments = Array.from(checkedEnvs).map(el => el.value);
    localStorage.setItem('reformas_3p_selected_envs', JSON.stringify(this.selectedEnvironments));
    localStorage.setItem('reformas_3p_reforma_type', this.reformaType);
    
    localStorage.setItem('reformas_3p_onboarding_finished', 'true');
    
    const headerNameEl = document.getElementById('header-user-name');
    if (headerNameEl) headerNameEl.textContent = `Olá, ${this.name}`;
    const profileNameEl = document.getElementById('profile-name');
    if (profileNameEl) profileNameEl.textContent = this.name;
    
    this.conteudosController.renderEnvironmentCards();
    this.showMainAppScreen();
    this.updateProfileStats();
    
    // Salvar perfil no Supabase em background
    if (this.syncProfileToSupabase) {
      this.syncProfileToSupabase();
    }
  }

  // ==========================================================================
  // SINGLE PAGE TAB ROUTING
  // ==========================================================================
  switchTab(tabId, tabButtonEl) {
    // 1. Hide all tab view screens
    const views = document.querySelectorAll('.tab-view');
    views.forEach(v => v.classList.remove('active'));
    
    // 2. Remove active state from nav buttons
    const navItems = document.querySelectorAll('.app-navigation-bar .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // 3. Show requested screen
    const targetView = document.getElementById(`tab-${tabId}`);
    if (targetView) targetView.classList.add('active');
    
    // 4. Set active navigation tab bar button
    if (tabButtonEl) {
      tabButtonEl.classList.add('active');
    } else {
      const matchedBtn = Array.from(navItems).find(btn => btn.getAttribute('onclick').includes(`'${tabId}'`));
      if (matchedBtn) matchedBtn.classList.add('active');
    }
    
    // Close checklist detail if switching away from central
    if (tabId !== 'central') {
      this.conteudosController.closeEnvironmentDetail();
    }
    
    // Dynamic updates on tab click
    if (tabId === 'painel') {
      this.financeiroController.renderDashboardCentral();
    } else if (tabId === 'orcamento') {
      this.financeiroController.updateDashboard();
    } else if (tabId === 'cronograma') {
      this.conteudosController.updateCronograma();
    } else if (tabId === 'central') {
      this.switchCentralSection('portal');
    }

    // Toggle floating wizard button visibility (only show on Painel / Dashboard tab)
    const wizardBtn = document.getElementById('dash-floating-wizard-btn');
    const checklistBtn = document.getElementById('dash-floating-checklist-btn');
    
    const hasFinishedSetup = localStorage.getItem('reformas_3p_onboarding_finished') === 'true';
    
    if (wizardBtn) {
      wizardBtn.style.display = (tabId === 'painel') ? 'flex' : 'none';
      const wizardBtnText = wizardBtn.querySelector('.wizard-btn-text');
      const wizardBtnIcon = wizardBtn.querySelector('.wizard-btn-icon');
      if (wizardBtnText) {
        wizardBtnText.textContent = hasFinishedSetup ? 'Editar Orçamento' : 'Comece Aqui';
      }
      if (wizardBtnIcon) {
        wizardBtnIcon.textContent = hasFinishedSetup ? '✏️' : '⚡';
      }
    }
    
    if (checklistBtn) {
      checklistBtn.style.display = (tabId === 'painel' && hasFinishedSetup) ? 'flex' : 'none';
    }
  }

  switchCentralSection(sectionId) {
    const portalHome = document.getElementById('central-portal-home');
    const phaseSwitcher = document.getElementById('central-phase-switcher');
    
    // Hide all sub-views in central
    const subviews = document.querySelectorAll('#tab-central .sub-view');
    subviews.forEach(sv => {
      sv.style.display = 'none';
      sv.classList.remove('active');
    });
    
    if (sectionId === 'portal') {
      if (portalHome) portalHome.style.display = 'flex';
      if (phaseSwitcher) phaseSwitcher.style.display = 'grid';
      this.conteudosController.renderPortalShortcuts();
    } else {
      if (portalHome) portalHome.style.display = 'none';
      if (phaseSwitcher) phaseSwitcher.style.display = 'none';
      
      const activeView = document.getElementById(`central-sec-${sectionId}`);
      if (activeView) {
        activeView.style.display = 'block';
        activeView.classList.add('active');
      }
      
      if (sectionId === 'checklists') {
        this.conteudosController.renderEnvironmentCards();
      } else if (sectionId === 'decisoes') {
        this.decisoesController.renderEnvironmentsGrid();
      } else if (sectionId === 'biblioteca') {
        this.conteudosController.renderPdfGrid();
      } else if (sectionId === 'riscos') {
        this.conteudosController.renderRiskScanner();
      }
    }
  }

  // ==========================================================================
  // PROFILE DRAWER OVERLAY WINDOW
  // ==========================================================================
  openProfileDrawer() {
    const overlay = document.getElementById('drawer-profile-overlay');
    if (overlay) {
      overlay.classList.add('active');
      this.updateProfileStats();
    }
  }

  closeProfileDrawer() {
    const overlay = document.getElementById('drawer-profile-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // ==========================================================================
  // MODAL SLIDE DRAWER MANAGEMENT
  // ==========================================================================
  openExpenseDrawer() {
    const overlay = document.getElementById('drawer-expense-overlay');
    overlay.classList.add('active');
    
    const dateInput = document.getElementById('exp-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  closeExpenseDrawer() {
    document.getElementById('drawer-expense-overlay').classList.remove('active');
    document.getElementById('exp-desc').value = '';
    document.getElementById('exp-amount').value = '';
  }

  addExpenseSubmit() {
    const desc = document.getElementById('exp-desc').value.trim();
    const amount = document.getElementById('exp-amount').value;
    const cat = document.getElementById('exp-category').value;
    const date = document.getElementById('exp-date').value;
    
    if (!desc) {
      alert("Por favor, digite a descrição do gasto.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Por favor, digite um valor monetário válido.");
      return;
    }
    
    this.financeiroController.addExpense(desc, cat, amount, date);
    this.closeExpenseDrawer();
  }

  deleteExpense(id) {
    if (confirm("Tem certeza que deseja excluir este lançamento de despesa?")) {
      this.financeiroController.deleteExpense(id);
    }
  }

  closePdfDrawer() {
    this.conteudosController.closePdfReader();
  }

  // ==========================================================================
  // FLOATING MODALS DIALOG WINDOWS
  // ==========================================================================
  showParallelExplanation() {
    document.getElementById('modal-parallel-overlay').classList.add('active');
  }

  closeParallelExplanation() {
    document.getElementById('modal-parallel-overlay').classList.remove('active');
  }

  showPaywallModal() {
    this.paywallController.showPaywallModal();
  }

  closePaywallModal() {
    this.paywallController.closePaywallModal();
  }

  selectPaywallProduct(prodId) {
    this.paywallController.selectPaywallProduct(prodId);
  }

  selectPaywallProductInModal(prodId) {
    this.paywallController.selectPaywallProductInModal(prodId);
  }

  setPaymentMethod(method) {
    this.paywallController.setPaymentMethod(method);
  }

  simulateHotmartCheckout() {
    this.paywallController.simulateHotmartCheckout();
  }

  purchaseSelectedTier() {
    this.paywallController.purchaseSelectedTier();
  }

  // ==========================================================================
  // PROFILE STATISTICS DATA MANAGEMENT
  // ==========================================================================
  updateProfileStats() {
    const statsRooms = document.getElementById('profile-stat-rooms');
    if (statsRooms) statsRooms.textContent = this.selectedEnvironments.length.toString();
    
    const statsExpenses = document.getElementById('profile-stat-expenses');
    if (statsExpenses) statsExpenses.textContent = this.financeiroController.expenses.length.toString();
    
    const statsTasks = document.getElementById('profile-stat-tasks');
    const physicalProgress = this.conteudosController.getOverallPhysicalProgress();
    if (statsTasks) statsTasks.textContent = `${physicalProgress.toFixed(0)}%`;
  }

  async resetProjectData() {
    if (confirm("⚠️ ATENÇÃO: Tem certeza que deseja apagar permanentemente todas as suas despesas, tarefas marcadas e recomeçar o setup? Seus cômodos liberados e conta premium serão preservados.")) {
      // 1. Zerar dados em memória
      this.financeiroController.investment = 0;
      this.financeiroController.budget = 0;
      this.financeiroController.expenses = [];
      this.financeiroController.plannedItems = [];
      this.conteudosController.tasksProgress = {};
      
      // 2. Limpar chaves de dados do localStorage (PRESERVANDO o login, token e compras!)
      const keysToRemove = [
        'reformas_3p_investment',
        'reformas_3p_budget',
        'reformas_3p_expenses',
        'reformas_3p_planned_items',
        'reformas_3p_tasks_progress',
        'reformas_3p_crono_start',
        'reformas_3p_crono_durations',
        'reformas_3p_risk_suppliers',
        'reformas_3p_supplier_scores',
        'reformas_3p_onboarding_finished'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      // 3. Se estiver logado no Supabase, limpar os dados na nuvem também
      if (supabaseDB && supabaseDB.isConfigured && this.userEmail) {
        try {
          this.triggerPushNotification("🔄 LIMPANDO NUVEM", "Apagando dados salvos no servidor...", "warning");
          
          // Apagar despesas, planejados e checklists no Supabase
          const del1 = supabaseDB._delete('expenses', `user_email=eq.${encodeURIComponent(this.userEmail)}`);
          const del2 = supabaseDB._delete('planned_items', `user_email=eq.${encodeURIComponent(this.userEmail)}`);
          const del3 = supabaseDB._delete('tasks_progress', `user_email=eq.${encodeURIComponent(this.userEmail)}`);
          await Promise.all([del1, del2, del3]);
          
          // Clear it again from localstorage just to be extremely sure
          localStorage.setItem('reformas_3p_tasks_progress', '{}');
          
          // Manter o perfil, mas atualizando os valores financeiros para zero (preservando o tier e salas desbloqueadas!)
          await supabaseDB.saveObraProfile(this.userEmail, {
            user_name: this.name,
            user_picture: localStorage.getItem('reformas_3p_user_picture') || null,
            reforma_type: this.reformaType,
            selected_environments: this.selectedEnvironments,
            investment: 0,
            budget: 0,
            pref_notifications: localStorage.getItem('reformas_3p_pref_notifications') !== 'false',
            pref_descompasso: localStorage.getItem('reformas_3p_pref_descompasso') !== 'false',
            pref_overruns: localStorage.getItem('reformas_3p_pref_overruns') !== 'false',
            user_tier: this.paywallController.userTier,
            unlocked_rooms: this.paywallController.unlockedRooms
          });
          
          this.triggerPushNotification("✅ NUVEM LIMPA", "Dados apagados do servidor com sucesso.", "success");
        } catch (err) {
          console.error("Erro ao limpar dados do Supabase:", err);
        }
      }
      
      // 4. Redirecionar para onboarding e recarregar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  // ==========================================================================
  // FLOATING MOBILE PUSH NOTIFICATIONS SYSTEM (HIGH FIDELITY)
  // ==========================================================================
  triggerPushNotification(title, message, type) {
    const notificationsEnabled = localStorage.getItem('reformas_3p_pref_notifications') !== 'false';
    if (!notificationsEnabled && !title.includes("PREFERÊNCIA SALVA")) {
      console.log(`Notification muted: ${title} - ${message}`);
      return;
    }

    const parentContainer = document.getElementById('app-container');
    if (!parentContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `push-toast-block ${type || 'warning'}`;
    
    Object.assign(toast.style, {
      position: 'absolute',
      top: '-80px',
      left: '16px',
      width: 'calc(100% - 32px)',
      backgroundColor: 'rgba(21, 26, 38, 0.92)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      zIndex: '150',
      boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
      opacity: '0',
      transition: 'top 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease',
      pointerEvents: 'auto',
      cursor: 'pointer'
    });
    
    let emoji = "🔔";
    let accentBorder = "var(--primary-orange)";
    if (type === 'success') {
      emoji = "🎉";
      accentBorder = "var(--color-success)";
    } else if (type === 'danger') {
      emoji = "🚨";
      accentBorder = "var(--color-danger)";
    }
    
    toast.style.borderLeft = `4px solid ${accentBorder}`;
    
    toast.innerHTML = `
      <div style="font-size: 22px; margin-top: 2px;">${emoji}</div>
      <div style="flex: 1; text-align: left;">
        <h5 style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">${title}</h5>
        <p style="font-size: 11px; color: #8c96ab; line-height: 1.4; margin: 0;">${message}</p>
      </div>
    `;
    
    parentContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.top = '16px';
      toast.style.opacity = '1';
    }, 100);
    
    const dismiss = () => {
      toast.style.top = '-80px';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    };
    
    toast.onclick = dismiss;
    setTimeout(dismiss, 6500);
  }

  showInfographic() {
    const modal = document.getElementById('modal-infographic-overlay');
    if (modal) modal.classList.add('active');
  }

  closeInfographic() {
    const modal = document.getElementById('modal-infographic-overlay');
    if (modal) modal.classList.remove('active');
  }

  installPwa() {
    if (this.deferredPrompt) {
      // Dispara o prompt nativo de instalação diretamente!
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          this.triggerPushNotification("📲 INSTALAÇÃO INICIADA", "O aplicativo está sendo adicionado à sua tela inicial!", "success");
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        this.deferredPrompt = null;
        this.updateInstallButtonsState();
      });
    } else {
      // Caso contrário, abre o modal instrutivo
      this.openPwaInstallModal();
    }
  }

  updateInstallButtonsState() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    const installBtn = document.getElementById('btn-install-pwa');
    const dashInstallBtn = document.getElementById('dash-btn-install-pwa');
    const directBtn = document.getElementById('pwa-android-direct-btn');
    
    if (isStandalone) {
      if (installBtn) installBtn.style.display = 'none';
      if (dashInstallBtn) {
        dashInstallBtn.style.display = 'none';
      }
      const dashBanner = document.getElementById('dash-pwa-install-banner');
      if (dashBanner) dashBanner.style.display = 'none';
      if (directBtn) directBtn.style.display = 'none';
    } else if (this.deferredPrompt) {
      // Prompt is available (installable)
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.style.background = 'rgba(255, 106, 0, 0.05)';
        installBtn.style.border = '1px solid rgba(255, 106, 0, 0.2)';
        installBtn.style.color = '#ff9500';
        installBtn.textContent = "📲 Baixar Aplicativo";
        installBtn.onclick = () => this.installPwa();
      }
      if (dashInstallBtn) {
        dashInstallBtn.style.display = 'block';
        dashInstallBtn.style.cursor = 'pointer';
        dashInstallBtn.style.background = 'linear-gradient(135deg, #ff6a00 0%, #ff8800 100%)';
        dashInstallBtn.style.boxShadow = '0 4px 15px rgba(255, 106, 0, 0.3)';
        dashInstallBtn.style.border = 'none';
        dashInstallBtn.style.color = '#ffffff';
        dashInstallBtn.textContent = "📲 Baixar Aplicativo Direto";
        dashInstallBtn.disabled = false;
        dashInstallBtn.onclick = () => this.installPwa();
      }
      if (directBtn) {
        directBtn.style.display = 'block';
      }
    } else {
      // Standard state where browser doesn't support programmatic install but might be manual (like iOS)
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.onclick = () => this.installPwa();
      }
      if (dashInstallBtn) {
        dashInstallBtn.style.display = 'block';
        dashInstallBtn.style.cursor = 'pointer';
        dashInstallBtn.style.background = 'rgba(255, 106, 0, 0.1)';
        dashInstallBtn.style.border = '1px solid rgba(255, 106, 0, 0.3)';
        dashInstallBtn.style.color = '#ff9500';
        dashInstallBtn.textContent = "📲 Instalar no Celular";
        dashInstallBtn.disabled = false;
        dashInstallBtn.onclick = () => this.installPwa();
      }
      if (directBtn) {
        directBtn.style.display = 'none';
      }
    }
  }

  openPwaInstallModal() {
    const modal = document.getElementById('modal-pwa-install-overlay');
    if (!modal) return;
    
    modal.classList.add('active');
    
    // Auto-detect platform and pre-select the tab
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.switchPwaInstallTab(isIos ? 'ios' : 'android');
    
    // Show/hide direct install button based on deferredPrompt availability
    const directBtn = document.getElementById('pwa-android-direct-btn');
    if (directBtn) {
      directBtn.style.display = this.deferredPrompt ? 'block' : 'none';
    }
  }

  closePwaInstallModal() {
    const modal = document.getElementById('modal-pwa-install-overlay');
    if (modal) modal.classList.remove('active');
  }

  switchPwaInstallTab(platform) {
    const btnAndroid = document.getElementById('pwa-tab-android');
    const btnIos = document.getElementById('pwa-tab-ios');
    const instAndroid = document.getElementById('pwa-instructions-android');
    const instIos = document.getElementById('pwa-instructions-ios');
    
    if (platform === 'android') {
      if (btnAndroid) btnAndroid.classList.add('active');
      if (btnIos) btnIos.classList.remove('active');
      if (instAndroid) instAndroid.style.display = 'block';
      if (instIos) instIos.style.display = 'none';
    } else {
      if (btnAndroid) btnAndroid.classList.remove('active');
      if (btnIos) btnIos.classList.add('active');
      if (instAndroid) instAndroid.style.display = 'none';
      if (instIos) instIos.style.display = 'block';
    }
  }

  triggerDirectPwaInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          this.triggerPushNotification("📲 INSTALAÇÃO INICIADA", "O aplicativo está sendo adicionado à sua tela inicial!", "success");
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        this.deferredPrompt = null;
        this.updateInstallButtonsState();
        this.closePwaInstallModal();
      });
    }
  }

  // Preference management
  togglePreference(prefId, value) {
    localStorage.setItem(`reformas_3p_pref_${prefId}`, value ? 'true' : 'false');
    
    // Check if notifications are enabled before showing
    const notificationsEnabled = localStorage.getItem('reformas_3p_pref_notifications') !== 'false';
    if (notificationsEnabled) {
      this.triggerPushNotification(
        "⚙️ PREFERÊNCIA SALVA",
        `A configuração de ${prefId === 'notifications' ? 'Notificações' : prefId === 'descompasso' ? 'Descompasso' : 'Estouro'} foi atualizada para ${value ? 'Ativo' : 'Inativo'}.`,
        "success"
      );
    }

    // Refresh central dashboard calculations immediately
    this.financeiroController.renderDashboardCentral();

    // Sincronizar com Supabase em background
    if (this.syncProfileToSupabase) {
      this.syncProfileToSupabase();
    }
  }

  loadPreferences() {
    const prefs = ['notifications', 'descompasso', 'overruns'];
    prefs.forEach(pref => {
      let val = localStorage.getItem(`reformas_3p_pref_${pref}`);
      if (val === null) {
        val = 'true'; // Default to true
        localStorage.setItem(`reformas_3p_pref_${pref}`, 'true');
      }
      const switchEl = document.getElementById(`pref-${pref}`);
      if (switchEl) {
        switchEl.checked = (val === 'true');
      }
    });
  }

  // ==========================================================================
  // SEGURANÇA E BACKUP (EXPORTAR E IMPORTAR JSON)
  // ==========================================================================
  exportDataBackup() {
    try {
      const keysToExport = [
        'reformas_3p_user_name',
        'reformas_3p_reforma_type',
        'reformas_3p_selected_envs',
        'reformas_3p_onboarding_finished',
        'reformas_3p_investment',
        'reformas_3p_budget',
        'reformas_3p_expenses',
        'reformas_3p_planned_items',
        'reformas_3p_tasks_progress',
        'reformas_3p_pref_notifications',
        'reformas_3p_pref_descompasso',
        'reformas_3p_pref_overruns'
      ];
      
      const backupData = {};
      keysToExport.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) backupData[key] = val;
      });
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `reforma-3p-backup-${this.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      this.triggerPushNotification(
        "📥 BACKUP REALIZADO",
        "Seu arquivo de backup da reforma foi gerado e baixado com sucesso!",
        "success"
      );
    } catch (e) {
      console.error(e);
      alert("Falha ao exportar os dados de backup.");
    }
  }

  importDataBackup(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.reformas_3p_user_name && !importedData.reformas_3p_expenses) {
          alert("O arquivo selecionado não parece ser um backup válido do Método 3P.");
          return;
        }
        
        Object.keys(importedData).forEach(key => {
          localStorage.setItem(key, importedData[key]);
        });
        
        this.triggerPushNotification(
          "📤 RESTAURAÇÃO COMPLETA",
          "Dados da reforma importados com sucesso! Recarregando painel...",
          "success"
        );
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error(err);
        alert("Erro ao decodificar o arquivo de backup. Certifique-se de que é um arquivo JSON válido.");
      }
    };
    reader.readAsText(file);
  }

  // ==========================================================================
  // COMPARTILHAMENTO DO STATUS E RESUMO DA REFORMA
  // ==========================================================================
  shareObraSummary() {
    try {
      const totalReal = this.financeiroController.getTotalSpent();
      const available = this.financeiroController.budget;
      const margin = this.financeiroController.investment * 0.10;
      const spentPercent = (totalReal / available) * 100 || 0;
      const physicalProgress = this.conteudosController.getOverallPhysicalProgress() || 0;
      
      this.conteudosController.updateCronograma();
      const forecastDateEl = document.getElementById('crono-display-enddate');
      const forecastDate = forecastDateEl ? forecastDateEl.textContent : "Não definida";
      
      const shareText = `🚧 *Reformas Sem Erro - Método 3P* 🚧\n` +
                        `*CENTRO DE COMANDO DA REFORMA*\n\n` +
                        `👤 *Dono:* ${this.name}\n` +
                        `💰 *Orçamento Disponível (90%):* ${this.financeiroController.formatCurrency(available)}\n` +
                        `🛡️ *Margem de Segurança (10%):* ${this.financeiroController.formatCurrency(margin)}\n` +
                        `💵 *Custos Reais Registrados:* ${this.financeiroController.formatCurrency(totalReal)}\n` +
                        `📊 *Progresso Financeiro:* ${spentPercent.toFixed(0)}% utilizado\n` +
                        `📐 *Avanço Físico Real:* ${physicalProgress.toFixed(0)}% concluído\n` +
                        `📅 *Previsão de Entrega:* ${forecastDate}\n\n` +
                        `---------------------------------\n` +
                        `🔗 Acesse seu painel da reforma online:\n` +
                        `https://reformasemerro.netlify.app/`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Centro de Comando da Minha Reforma',
          text: shareText,
          url: 'https://reformasemerro.netlify.app/'
        }).then(() => {
          console.log('Shared successfully');
        }).catch(err => {
          console.log('Share prompt dismissed', err);
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          this.triggerPushNotification(
            "📋 RESUMO COPIADO",
            "O resumo executivo da sua reforma foi copiado para a área de transferência! Cole no WhatsApp.",
            "success"
          );
        }).catch(err => {
          console.error("Clipboard copy failed", err);
          alert("Não foi possível copiar o texto automaticamente.");
        });
      }
    } catch (e) {
      console.error(e);
      alert("Falha ao gerar o resumo para compartilhamento.");
    }
  }

  // ==========================================================================
  // AUTENTICAÇÃO REAL COM GOOGLE SIGN-IN (GOOGLE IDENTITY SERVICES)
  // ==========================================================================
  initGoogleAuth() {
    console.log("Initializing Google Identity Services Auth...");
    
    // Check if the GSI library has loaded successfully
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      console.warn("Google Identity Services SDK not loaded yet. Retrying in 1s...");
      setTimeout(() => this.initGoogleAuth(), 1000);
      return;
    }
    
    const client_id = "698122894908-bct3ma5e9irb7d22no7q1aphjpkgc5lq.apps.googleusercontent.com"; // Standard Client ID for Netlify / Localhost
    
    // Initialize Google OAuth client
    google.accounts.id.initialize({
      client_id: client_id,
      callback: (res) => this.handleGoogleLoginCredential(res),
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    // Render the official Google sign-in button
    const container = document.getElementById("gsi-google-btn-container");
    if (container) {
      google.accounts.id.renderButton(container, {
        theme: "filled_blue",
        size: "large",
        width: 320,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left"
      });
    }
    
    // Trigger Google One Tap prompt if not already logged in
    const onboardingFinished = localStorage.getItem('reformas_3p_onboarding_finished') === 'true';
    if (!onboardingFinished) {
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("One Tap dialog skipped or already displayed:", notification.getMomentType());
        }
      });
    }
  }

  handleGoogleLoginCredential(response) {
    try {
      console.log("Google Sign-In response credential token received!");
      const idToken = response.credential;
      const userProfile = this.decodeGoogleJwt(idToken);
      
      if (!userProfile) {
        alert("Erro ao validar credenciais do Google.");
        return;
      }
      
      console.log("Google User Authenticated: ", userProfile.name, userProfile.email);
      
      // Persistir informações autenticadas
      this.name = userProfile.name;
      this.userEmail = userProfile.email;
      localStorage.setItem('reformas_3p_user_name', userProfile.name);
      localStorage.setItem('reformas_3p_user_email', userProfile.email);
      if (userProfile.picture) {
        localStorage.setItem('reformas_3p_user_picture', userProfile.picture);
      }
      
      // Sincronizar DOM imediatamente
      const headerName = document.getElementById('header-user-name');
      if (headerName) headerName.textContent = `Olá, ${this.name}`;
      const profileName = document.getElementById('profile-name');
      if (profileName) profileName.textContent = this.name;
      
      const emailEl = document.getElementById('profile-email');
      if (emailEl) emailEl.textContent = userProfile.email;
      
      this.syncUserAvatars(userProfile.picture, userProfile.name);
      
      // Sincronizar com Supabase (carregar dados da nuvem se existirem)
      if (supabaseDB && supabaseDB.isConfigured) {
        supabaseDB.loginWithGoogleIdToken(idToken).then(() => {
          this.syncFromSupabase(userProfile.email).then(() => {
            // Avançar onboarding após sincronizar
            this.triggerPushNotification(
              "🔐 AUTENTICADO COM SUCESSO!",
              `Bem-vindo, ${userProfile.name}! Dados sincronizados com a nuvem.`,
              "success"
            );
            this.nextOnboardingSlide(2);
          });
        });
      } else {
        // Sem Supabase, avançar normalmente
        this.triggerPushNotification(
          "🔐 AUTENTICADO COM SUCESSO!",
          `Bem-vindo, ${userProfile.name}! Sua conta foi vinculada.`,
          "success"
        );
        this.nextOnboardingSlide(2);
      }
      
    } catch (e) {
      console.error("Failed to handle Google credential response", e);
      alert("Falha no login com a Conta do Google.");
    }
  }

  // ==========================================================================
  // SINCRONIZAÇÃO COM SUPABASE
  // ==========================================================================
  async syncFromSupabase(email) {
    if (!supabaseDB || !supabaseDB.isConfigured || !email) return;
    
    try {
      console.log(`Sincronizando dados do Supabase para: ${email}`);
      
      // Carregar perfil da obra
      const obraProfile = await supabaseDB.loadObraProfile(email);
      if (obraProfile) {
        if (obraProfile.user_name) {
          this.name = obraProfile.user_name;
          localStorage.setItem('reformas_3p_user_name', this.name);
        }
        if (obraProfile.investment) {
          this.financeiroController.investment = parseFloat(obraProfile.investment);
          this.financeiroController.budget = this.financeiroController.investment * 0.90;
          localStorage.setItem('reformas_3p_investment', obraProfile.investment.toString());
          localStorage.setItem('reformas_3p_budget', this.financeiroController.budget.toString());
        }
        if (obraProfile.selected_environments) {
          this.selectedEnvironments = obraProfile.selected_environments;
          localStorage.setItem('reformas_3p_selected_envs', JSON.stringify(this.selectedEnvironments));
        }
        if (obraProfile.user_tier) {
          this.paywallController.userTier = obraProfile.user_tier;
          localStorage.setItem('reformas_3p_user_tier', obraProfile.user_tier);
        }
        if (obraProfile.unlocked_rooms) {
          const cloudRooms = Array.isArray(obraProfile.unlocked_rooms) ? obraProfile.unlocked_rooms : [];
          const localRooms = JSON.parse(localStorage.getItem('reformas_3p_unlocked_rooms') || '[]');
          this.paywallController.unlockedRooms = [...new Set([...cloudRooms, ...localRooms])];
          localStorage.setItem('reformas_3p_unlocked_rooms', JSON.stringify(this.paywallController.unlockedRooms));
          
          if (cloudRooms.length !== this.paywallController.unlockedRooms.length) {
            this.syncProfileToSupabase(); // sync the merged rooms back to cloud
          }
        }
        this.paywallController.updatePaywallUI();
      }
      
      // Carregar despesas reais
      const cloudExpenses = await supabaseDB.loadExpenses(email);
      if (cloudExpenses && cloudExpenses.length > 0) {
        this.financeiroController.expenses = cloudExpenses;
        this.financeiroController.saveExpenses();
      }
      
      // Carregar itens planejados
      const cloudPlanned = await supabaseDB.loadPlannedItems(email);
      if (cloudPlanned && cloudPlanned.length > 0) {
        this.financeiroController.plannedItems = cloudPlanned;
        localStorage.setItem('reformas_3p_planned_items', JSON.stringify(cloudPlanned));
      }
      
      // Carregar progresso dos checklists
      const cloudTasks = await supabaseDB.loadAllTasksProgress(email);
      if (cloudTasks) {
        this.conteudosController.tasksProgress = cloudTasks;
        localStorage.setItem('reformas_3p_tasks_progress', JSON.stringify(cloudTasks));
      }
      
      // Atualizar interface com dados sincronizados
      this.financeiroController.recalculateCategoryBudgets();
      this.financeiroController.updateDashboard();
      this.financeiroController.renderPlannedItems();
      this.updateProfileStats();
      
      console.log('Sincronização com Supabase concluída!');
    } catch (err) {
      console.error('Erro na sincronização com Supabase:', err);
    }
  }

  async syncExpensesToSupabase() {
    if (!supabaseDB || !supabaseDB.isConfigured || !this.userEmail) return;
    await supabaseDB.saveExpenses(this.userEmail, this.financeiroController.expenses);
  }

  async syncPlannedToSupabase() {
    if (!supabaseDB || !supabaseDB.isConfigured || !this.userEmail) return;
    await supabaseDB.savePlannedItems(this.userEmail, this.financeiroController.plannedItems);
  }

  async syncProfileToSupabase() {
    if (!supabaseDB || !supabaseDB.isConfigured || !this.userEmail) return;
    await supabaseDB.saveObraProfile(this.userEmail, {
      user_name: this.name,
      user_picture: localStorage.getItem('reformas_3p_user_picture') || null,
      reforma_type: this.reformaType,
      selected_environments: this.selectedEnvironments,
      investment: this.financeiroController.investment,
      budget: this.financeiroController.budget,
      pref_notifications: localStorage.getItem('reformas_3p_pref_notifications') !== 'false',
      pref_descompasso: localStorage.getItem('reformas_3p_pref_descompasso') !== 'false',
      pref_overruns: localStorage.getItem('reformas_3p_pref_overruns') !== 'false',
      user_tier: this.paywallController.userTier,
      unlocked_rooms: this.paywallController.unlockedRooms
    });
  }

  decodeGoogleJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT decoding failed:", e);
      return null;
    }
  }

  syncUserAvatars(pictureUrl, name) {
    const headerImg = document.getElementById('header-user-avatar');
    const headerInitial = document.getElementById('header-user-initial');
    const profileImg = document.getElementById('profile-user-avatar');
    const profileInitial = document.getElementById('profile-user-initial');
    
    const initialChar = (name || "C").charAt(0).toUpperCase();
    
    if (pictureUrl) {
      if (headerImg) {
        headerImg.src = pictureUrl;
        headerImg.style.display = 'block';
      }
      if (headerInitial) headerInitial.style.display = 'none';
      
      if (profileImg) {
        profileImg.src = pictureUrl;
        profileImg.style.display = 'block';
      }
      if (profileInitial) profileInitial.style.display = 'none';
    } else {
      if (headerImg) headerImg.style.display = 'none';
      if (headerInitial) {
        headerInitial.textContent = initialChar;
        headerInitial.style.display = 'block';
      }
      
      if (profileImg) profileImg.style.display = 'none';
      if (profileInitial) {
        profileInitial.textContent = initialChar;
        profileInitial.style.display = 'block';
      }
    }
  }

  // ==========================================================================
  // APRESENTAÇÃO DE ABERTURA (SPLASH SCREEN SELECTOR & ANIMATIONS)
  // ==========================================================================
  showSplashSelector() {
    document.getElementById('app-splash-screen').classList.add('active');
    document.getElementById('splash-main-content').style.display = 'none';
    document.getElementById('splash-selector-panel').style.display = 'flex';
  }

  previewSplashStyle(styleName) {
    this.activePreviewStyle = styleName;
    
    const splashScreen = document.getElementById('app-splash-screen');
    splashScreen.className = 'app-splash-screen active';
    splashScreen.classList.add(`splash-theme-${styleName}`);
    
    const mainContent = document.getElementById('splash-main-content');
    const selectorPanel = document.getElementById('splash-selector-panel');
    
    mainContent.style.display = 'flex';
    selectorPanel.style.display = 'none';
    
    const fill = document.getElementById('splash-loading-fill');
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.transition = 'width 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)';
      fill.style.width = '100%';
    }, 50);

    if (styleName === 'cinematic') {
      this.generateSplashParticles();
    } else {
      document.getElementById('splash-particles').innerHTML = '';
    }
    
    setTimeout(() => {
      mainContent.style.display = 'none';
      selectorPanel.style.display = 'flex';
      
      const confirmBtn = document.getElementById('btn-confirm-splash');
      confirmBtn.style.display = 'block';
      confirmBtn.textContent = `Confirmar Estilo: ${
        styleName === 'minimalist' ? 'Impacto Minimalista' : styleName === 'blueprint' ? 'Linhas de Construção' : 'Brilho Cinematográfico'
      } ➔`;
      
      document.querySelectorAll('.selector-card').forEach(c => c.classList.remove('selected'));
      document.getElementById(`card-splash-${styleName}`).classList.add('selected');
    }, 2200);
  }

  generateSplashParticles() {
    const container = document.getElementById('splash-particles');
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'splash-particle';
      Object.assign(p.style, {
        position: 'absolute',
        width: `${Math.random() * 6 + 2}px`,
        height: `${Math.random() * 6 + 2}px`,
        background: 'rgba(255, 166, 0, 0.6)',
        borderRadius: '50%',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        boxShadow: '0 0 10px rgba(255, 106, 0, 0.5)',
        animation: `splashFloat ${Math.random() * 4 + 3}s infinite ease-in-out`
      });
      container.appendChild(p);
    }
  }

  confirmSplashStyle() {
    if (!this.activePreviewStyle) return;
    
    this.selectedSplashStyle = this.activePreviewStyle;
    localStorage.setItem('reformas_3p_splash_style', this.activePreviewStyle);
    
    this.triggerPushNotification(
      "✨ ABERTURA DEFINIDA",
      `Tema de apresentação "${this.selectedSplashStyle.toUpperCase()}" salvo com sucesso!`,
      "success"
    );
    
    const splashScreen = document.getElementById('app-splash-screen');
    splashScreen.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    splashScreen.style.opacity = '0';
    splashScreen.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      splashScreen.classList.remove('active');
      splashScreen.style.opacity = '1';
      splashScreen.style.transform = 'scale(1)';
      
      const onboardingFinished = localStorage.getItem('reformas_3p_onboarding_finished');
      if (onboardingFinished === 'true') {
        this.showMainAppScreen();
      } else {
        this.showOnboardingScreen();
      }
    }, 600);
  }

  reopenSplashSelector() {
    this.closeProfileDrawer();
    const splashScreen = document.getElementById('app-splash-screen');
    splashScreen.className = 'app-splash-screen active';
    
    document.getElementById('splash-main-content').style.display = 'none';
    document.getElementById('splash-selector-panel').style.display = 'flex';
    
    const confirmBtn = document.getElementById('btn-confirm-splash');
    confirmBtn.style.display = this.selectedSplashStyle ? 'block' : 'none';
    if (this.selectedSplashStyle) {
      confirmBtn.textContent = `Confirmar Estilo: ${
        this.selectedSplashStyle === 'minimalist' ? 'Impacto Minimalista' : this.selectedSplashStyle === 'blueprint' ? 'Linhas de Construção' : 'Brilho Cinematográfico'
      } ➔`;
      
      document.querySelectorAll('.selector-card').forEach(c => c.classList.remove('selected'));
      const activeCard = document.getElementById(`card-splash-${this.selectedSplashStyle}`);
      if (activeCard) activeCard.classList.add('selected');
    }
  }

  playSplashAnimation(styleName) {
    this.selectedSplashStyle = styleName;
    
    const splashScreen = document.getElementById('app-splash-screen');
    splashScreen.className = 'app-splash-screen active';
    splashScreen.classList.add(`splash-theme-${styleName}`);
    
    document.getElementById('splash-main-content').style.display = 'flex';
    document.getElementById('splash-selector-panel').style.display = 'none';
    
    if (styleName === 'cinematic') {
      this.generateSplashParticles();
    }
    
    const fill = document.getElementById('splash-loading-fill');
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.transition = 'width 2.0s cubic-bezier(0.1, 0.8, 0.2, 1)';
      fill.style.width = '100%';
    }, 50);
    
    setTimeout(() => {
      splashScreen.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      splashScreen.style.opacity = '0';
      splashScreen.style.transform = 'scale(1.03)';
      
      setTimeout(() => {
        splashScreen.classList.remove('active');
        splashScreen.style.opacity = '1';
        splashScreen.style.transform = 'scale(1)';
        
        const onboardingFinished = localStorage.getItem('reformas_3p_onboarding_finished');
        if (onboardingFinished === 'true') {
          this.showMainAppScreen();
          if (this.userEmail && supabaseDB && supabaseDB.isConfigured) {
            this.syncFromSupabase(this.userEmail);
          }
        } else {
          this.showOnboardingScreen();
        }
      }, 600);
    }, 2500);
  }

  // ==========================================================================
  // FLOATING ACTION BUTTON ASSISTANT (CHECKLIST MÉTODO 3P)
  // ==========================================================================
  openWizardDrawer() {
    this.updateWizardProgress();
    const overlay = document.getElementById('drawer-wizard-overlay');
    if (overlay) overlay.classList.add('active');
  }

  closeWizardDrawer() {
    const overlay = document.getElementById('drawer-wizard-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  updateWizardProgress() {
    const isStep1Done = this.financeiroController.investment > 0;
    const isStep2Done = this.financeiroController.plannedItems && this.financeiroController.plannedItems.length > 0;
    const isStep3Done = this.financeiroController.expenses && this.financeiroController.expenses.length > 0;
    
    // Check timeline setup: if start date is saved in localStorage or project profile has duration > 0
    const savedStartDate = localStorage.getItem('reformas_3p_crono_start') || document.getElementById('crono-start-date')?.value;
    const isStep4Done = !!savedStartDate;
    
    // Check decisions setup: if any supplier score or waterproofing score has been calculated/saved
    const savedRiskSuppliers = localStorage.getItem('reformas_3p_risk_suppliers') || localStorage.getItem('reformas_3p_supplier_scores');
    const isStep5Done = !!savedRiskSuppliers || (this.decisoesController.calculatedRiskScore !== undefined);
    
    const stepsStatus = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done];
    let completedCount = 0;
    
    stepsStatus.forEach((isDone, idx) => {
      const stepNum = idx + 1;
      const stepRow = document.getElementById(`w-step-${stepNum}`);
      const actionContainer = document.getElementById(`w-action-container-${stepNum}`);
      
      if (!stepRow || !actionContainer) return;
      
      if (isDone) {
        completedCount++;
        stepRow.classList.add('completed');
        actionContainer.innerHTML = `<span class="step-done-badge">✅ Concluído</span>`;
      } else {
        stepRow.classList.remove('completed');
        let verb = 'Definir ➔';
        if (stepNum === 1) verb = 'Definir ➔';
        else if (stepNum === 2) verb = 'Planejar ➔';
        else if (stepNum === 3) verb = 'Lançar ➔';
        else if (stepNum === 4) verb = 'Ajustar ➔';
        else if (stepNum === 5) verb = 'Comparar ➔';
        
        actionContainer.innerHTML = `<button class="btn-step-action" onclick="window.app.navigateToWizardStep(${stepNum})">${verb}</button>`;
      }
    });
    
    const overallProgressPercent = completedCount * 20;
    
    const percentEl = document.getElementById('wizard-progress-percent');
    const fillEl = document.getElementById('wizard-progress-bar');
    
    if (percentEl) percentEl.textContent = `${overallProgressPercent}% CONCLUÍDO`;
    if (fillEl) fillEl.style.width = `${overallProgressPercent}%`;
  }

  navigateToWizardStep(stepNumber) {
    this.closeWizardDrawer();
    
    let targetTab = 'painel';
    let targetSubTab = null;
    let focusInputId = null;
    
    switch(stepNumber) {
      case 1:
        targetTab = 'orcamento';
        targetSubTab = 'projeto';
        focusInputId = 'input-investment';
        break;
      case 2:
        targetTab = 'orcamento';
        targetSubTab = 'detalhado';
        focusInputId = 'plan-input-desc';
        break;
      case 3:
        targetTab = 'orcamento';
        targetSubTab = 'pagamentos';
        break;
      case 4:
        targetTab = 'cronograma';
        focusInputId = 'crono-start-date';
        break;
      case 5:
        targetTab = 'central';
        break;
    }
    
    this.switchTab(targetTab);
    
    if (targetTab === 'orcamento' && targetSubTab) {
      this.financeiroController.switchSubTab(targetSubTab);
    } else if (targetTab === 'central') {
      this.switchCentralSection('decisoes');
      this.decisoesController.switchTool('risk-matrix');
      focusInputId = 'risk-name';
    }
    
    if (focusInputId) {
      setTimeout(() => {
        const el = document.getElementById(focusInputId);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('wizard-focus-attention');
          setTimeout(() => el.classList.remove('wizard-focus-attention'), 3000);
        }
      }, 450);
    } else if (stepNumber === 3) {
      setTimeout(() => {
        this.openExpenseDrawer();
        setTimeout(() => {
          const expDesc = document.getElementById('exp-desc');
          if (expDesc) {
            expDesc.focus();
            expDesc.classList.add('wizard-focus-attention');
            setTimeout(() => expDesc.classList.remove('wizard-focus-attention'), 3000);
          }
        }, 300);
      }, 450);
    }
  }
}

// Global Instantiate Entry Hook (Race-condition & Caching free)
function startApp() {
  if (!window.app) {
    window.app = new AppOrchestrator();
    window.app.init();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
