// ==========================================================================
// MONETIZATION MODULE - PAYWALL & GATEWAY INTEGRATION (IN-APP PURCHASES)
// ==========================================================================

class PaywallController {
  constructor(app) {
    this.app = app;
    this.userTier = 'free'; // 'free', 'one_room', 'full_house'
    this.unlockedRooms = []; // List of room ids unlocked under 'one_room' tier
    
    this.selectedProduct = 'one_room'; // Default selected in profile upgrade card
    this.paymentMethod = 'pix'; // Default payment simulation
  }

  init() {
    const savedTier = localStorage.getItem('reformas_3p_user_tier');
    if (savedTier) {
      this.userTier = savedTier;
    } else {
      localStorage.setItem('reformas_3p_user_tier', this.userTier);
    }
    
    const savedRooms = localStorage.getItem('reformas_3p_unlocked_rooms');
    if (savedRooms) {
      try {
        this.unlockedRooms = JSON.parse(savedRooms);
      } catch (e) {
        console.error("Erro ao analisar cômodos desbloqueados:", e);
        this.unlockedRooms = [];
      }
    } else {
      this.unlockedRooms = [];
      localStorage.setItem('reformas_3p_unlocked_rooms', JSON.stringify(this.unlockedRooms));
    }
    
    // Hook change event on #paywall-room-select and update preview
    const roomSelect = document.getElementById('paywall-room-select');
    if (roomSelect) {
      roomSelect.addEventListener('change', () => {
        this.updatePaywallPreview();
      });
    }
    
    this.updatePaywallUI();

    // STRICT PAYWALL GATE: Show paywall modal if free and not admin, and onboarding is completed
    const onboardingFinished = localStorage.getItem('reformas_3p_onboarding_finished') === 'true';
    if (this.userTier === 'free' && !this.isAdminUser() && onboardingFinished) {
      setTimeout(() => {
        this.showPaywallModal();
      }, 500);
    }
  }

  isAdminUser() {
    const adminEmails = ['carlasg66@gmail.com', 'binhole@gmail.com'];
    const currentEmail = this.app.userEmail || localStorage.getItem('reformas_3p_user_email');
    return currentEmail && adminEmails.includes(currentEmail.toLowerCase().trim());
  }

  isEnvironmentLocked(envId) {
    if (this.isAdminUser()) return false; // Admin bypass
    if (this.userTier === 'full_house') return false; // Full access
    
    if (this.userTier === 'one_room') {
      // If user purchased this specific room, it is unlocked
      return !this.unlockedRooms.includes(envId);
    }
    
    // Free tier: all environment checklists are locked (teaser visible)
    return true;
  }

  isPdfLocked(pdfId, category) {
    if (this.isAdminUser()) return false; // Admin bypass
    if (this.userTier === 'full_house') return false; // Full access
    
    // Free tier: basic PDFs are free to read (IDs pdf-1 to pdf-4, and pdf-doc), others locked
    const freePdfIds = ['pdf-1', 'pdf-2', 'pdf-3', 'pdf-4', 'pdf-doc'];
    
    if (this.userTier === 'free') {
      return !freePdfIds.includes(pdfId);
    }
    
    if (this.userTier === 'one_room') {
      // One room tier: free PDFs are unlocked + PDFs matching the unlocked room categories
      if (freePdfIds.includes(pdfId)) return false;
      
      // Map room keys to pdf categories
      const categoryMap = {
        cozinha: ['planejamento', 'financeiro'],
        banheiro: ['tecnico'],
        sala: ['planejamento', 'materiais'],
        quarto: ['planejamento', 'materiais'],
        area_externa: ['tecnico', 'materiais']
      };
      
      // Check if user has unlocked any room matching this PDF category
      let categoryUnlocked = false;
      this.unlockedRooms.forEach(room => {
        const allowedCats = categoryMap[room] || [];
        if (allowedCats.includes(category)) {
          categoryUnlocked = true;
        }
      });
      
      return !categoryUnlocked;
    }
    
    return true;
  }

  populatePaywallRoomsDropdown() {
    const select = document.getElementById('paywall-room-select');
    if (!select) return;
    
    select.innerHTML = '';
    
    const rooms = [
      { id: 'cozinha', name: 'Cozinha (Recomendado)', emoji: '🍳' },
      { id: 'banheiro', name: 'Banheiro', emoji: '🚿' },
      { id: 'sala', name: 'Sala', emoji: '🛋️' },
      { id: 'quarto', name: 'Quarto', emoji: '🛏️' },
      { id: 'area_externa', name: 'Área Externa', emoji: '🌳' }
    ];
    
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = `${room.emoji} ${room.name}`;
      if (this.unlockedRooms.includes(room.id)) {
        option.disabled = true;
        option.textContent += ' (Já Adquirido)';
      }
      select.appendChild(option);
    });
  }

  showPaywallModal() {
    const modal = document.getElementById('modal-paywall-overlay');
    if (modal) modal.classList.add('active');
    
    this.populatePaywallRoomsDropdown();
    
    // Pre-select default modal product values
    this.selectPaywallProductInModal(this.selectedProduct);
    this.updatePaywallPreview();
  }

  closePaywallModal() {
    if (this.userTier === 'free' && !this.isAdminUser()) {
      if (this.app) {
        this.app.triggerPushNotification("⚠️ ACESSO BLOQUEADO", "Por favor, adquira um ambiente ou a casa toda para prosseguir.", "warning");
      }
      return;
    }
    const modal = document.getElementById('modal-paywall-overlay');
    if (modal) modal.classList.remove('active');
  }

  triggerEnvironmentPurchase(envId) {
    // Open paywall and pre-select the 1 Room option, focusing the dropdown on this room
    this.showPaywallModal();
    this.selectPaywallProductInModal('one_room');
    
    const select = document.getElementById('paywall-room-select');
    if (select) {
      select.value = envId;
    }
    this.updatePaywallPreview();
  }

  // Choose product inside Profile pricing panel
  selectPaywallProduct(productId) {
    this.selectedProduct = productId;
    
    // Update Radio buttons
    const radRoom = document.getElementById('pay-opt-room');
    const radHouse = document.getElementById('pay-opt-house');
    
    if (productId === 'one_room' && radRoom) radRoom.checked = true;
    if (productId === 'full_house' && radHouse) radHouse.checked = true;
  }

  // Choose product inside Modal popup
  selectPaywallProductInModal(productId) {
    this.selectedProduct = productId;
    
    const cardRoom = document.getElementById('pw-card-room');
    const cardHouse = document.getElementById('pw-card-house');
    const roomSelectGroup = document.getElementById('paywall-room-selector-group');
    const submitBtn = document.getElementById('paywall-submit-btn');
    
    if (productId === 'one_room') {
      if (cardRoom) cardRoom.classList.add('active');
      if (cardHouse) cardHouse.classList.remove('active');
      if (roomSelectGroup) roomSelectGroup.style.display = 'block';
      if (submitBtn) submitBtn.textContent = "DESBLOQUEAR CÔMODO • R$ 97,00";
    } else {
      if (cardRoom) cardRoom.classList.remove('active');
      if (cardHouse) cardHouse.classList.add('active');
      if (roomSelectGroup) roomSelectGroup.style.display = 'none';
      if (submitBtn) submitBtn.textContent = "DESBLOQUEAR CASA COMPLETA • R$ 297,00";
    }
    
    this.updatePaywallPreview();
  }

  purchaseSelectedTier() {
    // If upgrade clicked from profile, launch modal
    this.showPaywallModal();
  }

  getCheckoutUrl() {
    if (this.selectedProduct === 'full_house') {
      return 'https://pay.hotmart.com/F97813608C?checkoutMode=10';
    }
    
    const roomSelect = document.getElementById('paywall-room-select');
    const room = roomSelect ? roomSelect.value : 'cozinha';
    
    const urls = {
      cozinha: 'https://pay.hotmart.com/G102751519S',
      banheiro: 'https://pay.hotmart.com/K102759780J',
      quarto: 'https://pay.hotmart.com/N102760096U',
      sala: 'https://pay.hotmart.com/X102759897L',
      area_externa: 'https://pay.hotmart.com/Q102750818X'
    };
    
    return urls[room] || urls.cozinha;
  }

  updatePaywallPreview() {
    const iconEl = document.getElementById('pw-preview-icon');
    const titleEl = document.getElementById('pw-preview-title');
    const descEl = document.getElementById('pw-preview-desc');
    
    if (!iconEl || !titleEl || !descEl) return;
    
    if (this.selectedProduct === 'full_house') {
      iconEl.textContent = '👑';
      titleEl.textContent = 'MÉTODO 3P: CASA COMPLETA';
      descEl.textContent = 'Acesso ilimitado e offline a todas as ferramentas financeiras, checklists de todos os cômodos e biblioteca completa de PDFs.';
    } else {
      const roomSelect = document.getElementById('paywall-room-select');
      const room = roomSelect ? roomSelect.value : 'cozinha';
      
      const info = {
        cozinha: {
          icon: '🍳',
          title: 'MÉTODO 3P: COZINHA UNLOCKED',
          desc: 'Planeje sua cozinha sem erros. Checklist completo, controle de custos específico e guias técnicos de bancadas, cubas e elétrica.'
        },
        banheiro: {
          icon: '🚿',
          title: 'MÉTODO 3P: BANHEIRO UNLOCKED',
          desc: 'Evite infiltrações e dores de cabeça. Checklist completo do banheiro, controle financeiro e guias de impermeabilização.'
        },
        sala: {
          icon: '🛋️',
          title: 'MÉTODO 3P: SALA UNLOCKED',
          desc: 'Otimize a iluminação, revestimentos e gesso. Checklist completo, controle de gastos e guias de iluminação.'
        },
        quarto: {
          icon: '🛏️',
          title: 'MÉTODO 3P: QUARTO UNLOCKED',
          desc: 'Conforto acústico e layout perfeito. Checklist detalhado do quarto, planejamento de móveis sob medida e controle financeiro.'
        },
        area_externa: {
          icon: '🌳',
          title: 'MÉTODO 3P: ÁREA EXTERNA UNLOCKED',
          desc: 'Drenagem, pisos antiderrapantes e fachadas. Checklist da área externa, planejamento paisagístico e controle de despesas.'
        }
      };
      
      const current = info[room] || info.cozinha;
      iconEl.textContent = current.icon;
      titleEl.textContent = current.title;
      descEl.textContent = current.desc;
    }
  }

  executeCheckout() {
    const url = this.getCheckoutUrl();
    window.open(url, '_blank');
  }

  simulateCheckout() {
    this.simulateHotmartCheckout();
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    
    const btns = document.querySelectorAll('.payment-methods-grid .pay-method-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`pay-btn-${method}`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // SIMULATED TRANSACTION SUBMIT FLOW
  simulateHotmartCheckout() {
    const submitBtn = document.getElementById('paywall-submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Processando transação Hotmart...";
    submitBtn.style.opacity = "0.7";
    
    // 1.5 seconds simulated latency
    setTimeout(() => {
      submitBtn.textContent = "Aprovando na App Store / Pix...";
      
      setTimeout(() => {
        // Unlock logic
        if (this.selectedProduct === 'one_room') {
          const roomSelect = document.getElementById('paywall-room-select');
          const roomToUnlock = roomSelect.value;
          
          if (!this.unlockedRooms.includes(roomToUnlock)) {
            this.unlockedRooms.push(roomToUnlock);
            localStorage.setItem('reformas_3p_unlocked_rooms', JSON.stringify(this.unlockedRooms));
          }
          
          this.userTier = 'one_room';
          localStorage.setItem('reformas_3p_user_tier', 'one_room');
          
          const roomNames = {
            cozinha: "Cozinha",
            banheiro: "Banheiro",
            sala: "Sala",
            quarto: "Quarto",
            area_externa: "Área Externa"
          };
          
          this.app.triggerPushNotification(
            "🎉 AMBIENTE DESBLOQUEADO!",
            `Seu acesso à ${roomNames[roomToUnlock]} foi ativado offline com sucesso.`,
            "success"
          );
        } else {
          // Unlocked full house!
          this.userTier = 'full_house';
          localStorage.setItem('reformas_3p_user_tier', 'full_house');
          
          this.app.triggerPushNotification(
            "👑 CASA COMPLETA ATIVADA!",
            "Toda a plataforma, 5 cômodos e 60+ PDFs livres offline.",
            "success"
          );
        }
        
        // Finalize transaction
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
        
        this.closePaywallModal();
        this.updatePaywallUI();
        
        // Sincronizar com Supabase em background
        if (this.app.syncProfileToSupabase) {
          this.app.syncProfileToSupabase();
        }
        
        // Refresh grids and active screens in real time!
        this.app.conteudosController.renderEnvironmentCards();
        this.app.conteudosController.renderPdfGrid();
        this.app.financeiroController.updateDashboard();
        if (this.app.decisoesController) {
          this.app.decisoesController.renderEnvironmentsGrid();
        }
        
      }, 800);
    }, 1000);
  }

  updatePaywallUI() {
    const tierDisplay = document.getElementById('header-tier-display');
    const tierLabel = document.getElementById('tier-name-label');
    const tierDot = tierDisplay ? tierDisplay.querySelector('.tier-dot') : null;
    
    const sellPanel = document.getElementById('premium-sell-panel');
    const activePanel = document.getElementById('premium-active-panel');
    const adminActivePanel = document.getElementById('admin-active-panel');
    
    // Check admin first
    if (this.isAdminUser()) {
      if (tierLabel) tierLabel.textContent = "Administrador 🛠️";
      if (tierDot) {
        tierDot.className = "tier-dot premium";
        tierDot.style.background = "#007fff";
      }
      if (sellPanel) sellPanel.style.display = 'none';
      if (activePanel) activePanel.style.display = 'none';
      if (adminActivePanel) adminActivePanel.style.display = 'block';

      const adminBtn = document.getElementById('admin-floating-btn');
      if (adminBtn) adminBtn.style.display = 'none';

      return;
    }
    
    if (adminActivePanel) adminActivePanel.style.display = 'none';
    const adminBtn = document.getElementById('admin-floating-btn');
    if (adminBtn) adminBtn.style.display = 'none';
    
    if (this.userTier === 'full_house') {
      if (tierLabel) tierLabel.textContent = "Casa Completa 👑";
      if (tierDot) {
        tierDot.className = "tier-dot premium";
      }
      if (sellPanel) sellPanel.style.display = 'none';
      if (activePanel) activePanel.style.display = 'block';
    } else if (this.userTier === 'one_room') {
      if (tierLabel) tierLabel.textContent = "Acesso Parcial 🔓";
      if (tierDot) {
        tierDot.className = "tier-dot free";
      }
      // Keep sell panel active to let them buy full house easily
      if (sellPanel) sellPanel.style.display = 'block';
      if (activePanel) activePanel.style.display = 'none';
    } else {
      if (tierLabel) tierLabel.textContent = "Conta Grátis 🚧";
      if (tierDot) {
        tierDot.className = "tier-dot free";
      }
      if (sellPanel) sellPanel.style.display = 'block';
      if (activePanel) activePanel.style.display = 'none';
    }
  }

  resetBilling() {
    this.userTier = 'free';
    this.unlockedRooms = [];
    localStorage.setItem('reformas_3p_user_tier', 'free');
    localStorage.setItem('reformas_3p_unlocked_rooms', JSON.stringify([]));
    this.updatePaywallUI();
    
    // Sincronizar com Supabase em background
    if (this.app.syncProfileToSupabase) {
      this.app.syncProfileToSupabase();
    }
  }
}
