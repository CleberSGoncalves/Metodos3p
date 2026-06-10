// ==========================================================================
// FINANCIAL MODULE - PILAR 1: PAINEL DE CONTROLE (FINANCEIRO)
// ==========================================================================

class FinancialController {
  constructor(app) {
    this.app = app;
    this.investment = 50000;
    this.budget = 45000; // 90% of investment (10% safety margin)
    this.expenses = [];
    this.plannedItems = [];
    this.priorityItems = [];
    this.activeSubTab = "projeto";
    
    // Default categories limits (80% and 100% of these will trigger alerts)
    this.categoryBudgets = {
      material: 18000,
      mao_de_obra: 13500,
      acabamento: 9000,
      decoracao: 2700,
      emergencias: 1800
    };
    
    this.triggeredAlerts = new Set(); // Keep track of triggered alerts in session
    this.chart = null;
    this.activeChartType = 'doughnut'; // 'doughnut' ou 'line' (Curva S)
  }

  // Load from localStorage or set defaults
  // Load from localStorage or set defaults
  init() {
    console.log("Initializing FinancialController...");
    
    // Load Investment & Budget
    const savedInvestment = localStorage.getItem('reformas_3p_investment');
    if (savedInvestment) {
      this.investment = parseFloat(savedInvestment);
      const savedBudget = localStorage.getItem('reformas_3p_budget');
      if (savedBudget) {
        this.budget = parseFloat(savedBudget);
      } else {
        const hasMargin = localStorage.getItem('reformas_3p_margem_definida') === 'true';
        const marginPctVal = hasMargin ? parseFloat(localStorage.getItem('reformas_3p_margem_pct') || '10') : 0;
        this.budget = hasMargin ? this.investment * (1 - marginPctVal / 100) : this.investment;
      }
    } else {
      // Initialize to 0 so they do Mission 1
      this.investment = 0;
      this.budget = 0;
    }
    
    // Recalculate category sub-budgets proportionally
    this.recalculateCategoryBudgets();
    
    // Load Planned Items (Passo 2)
    const savedPlanned = localStorage.getItem('reformas_3p_planned_items');
    if (savedPlanned) {
      try {
        this.plannedItems = JSON.parse(savedPlanned);
      } catch (e) {
        console.error("Erro ao analisar itens planejados:", e);
        this.plannedItems = [];
      }
    } else {
      // Iniciar vazio — sem dados de amostra que confundem o usuário
      this.plannedItems = [];
      localStorage.setItem('reformas_3p_planned_items', JSON.stringify(this.plannedItems));
    }
    
    // Load Real Expenses (Passo 3)
    const savedExpenses = localStorage.getItem('reformas_3p_expenses');
    if (savedExpenses) {
      try {
        this.expenses = JSON.parse(savedExpenses);
      } catch (e) {
        console.error("Erro ao analisar despesas salvas:", e);
        this.expenses = [];
      }
    } else {
      // Iniciar vazio — sem despesas de amostra
      this.expenses = [];
      this.saveExpenses();
    }
    
    // Load Priority Items
    const savedPriorities = localStorage.getItem('reformas_3p_priority_items');
    if (savedPriorities) {
      try {
        this.priorityItems = JSON.parse(savedPriorities);
      } catch (e) {
        console.error("Erro ao analisar itens prioritários:", e);
        this.priorityItems = [];
      }
    } else {
      this.priorityItems = [];
      localStorage.setItem('reformas_3p_priority_items', JSON.stringify([]));
    }

    // Load Quotes
    const savedQuotes = localStorage.getItem('reformas_3p_quotes');
    if (savedQuotes) {
      try {
        this.quotes = JSON.parse(savedQuotes);
      } catch (e) {
        this.quotes = [];
      }
    } else {
      this.quotes = [];
    }

    // Sync DOM selectors — só sincroniza o input se ele estiver vazio ou com valor padrão
    const investmentInput = document.getElementById('input-investment');
    if (investmentInput) {
      investmentInput.value = this.investment.toString();
    }
    
    // Render initial states
    this.updateDashboard();
    this.renderPlannedItems();
  }

  saveExpenses() {
    localStorage.setItem('reformas_3p_expenses', JSON.stringify(this.expenses));
  }

  recalculateCategoryBudgets() {
    this.categoryBudgets.material = this.budget * 0.40;     // 40% basic materials
    this.categoryBudgets.mao_de_obra = this.budget * 0.30;   // 30% labor
    this.categoryBudgets.acabamento = this.budget * 0.20;    // 20% finishing
    this.categoryBudgets.decoracao = this.budget * 0.06;     // 6% decor
    this.categoryBudgets.emergencias = this.budget * 0.04;   // 4% emergency
  }

  // Set Budget called from onboarding finish
  setBudget(val) {
    this.investment = val;
    this.budget = val * 0.90; // 10% contingency
    localStorage.setItem('reformas_3p_investment', this.investment.toString());
    localStorage.setItem('reformas_3p_budget', this.budget.toString());
    localStorage.setItem('reformas_3p_orcamento_definido', 'true');
    localStorage.setItem('reformas_3p_margem_definida', 'true');
    localStorage.setItem('reformas_3p_margem_pct', '10');
    
    this.recalculateCategoryBudgets();
    this.updateDashboard();
    this.renderPlannedItems();
  }

  // Update investment from Passo 1
  updateInvestment(val) {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) return;
    
    this.investment = parsed;
    this.budget = this.investment * 0.90; // 10% safety margin
    
    localStorage.setItem('reformas_3p_investment', this.investment.toString());
    localStorage.setItem('reformas_3p_budget', this.budget.toString());
    localStorage.setItem('reformas_3p_orcamento_definido', 'true');
    localStorage.setItem('reformas_3p_margem_definida', 'true');
    localStorage.setItem('reformas_3p_margem_pct', '10');
    
    this.recalculateCategoryBudgets();
    this.updateDashboard();
    this.renderPlannedItems();
    
    // Sincronizar com Supabase em background com debounce
    if (this.app.syncProfileToSupabase) {
      clearTimeout(this._syncTimeout);
      this._syncTimeout = setTimeout(() => {
        this.app.syncProfileToSupabase();
      }, 1000);
    }
  }

  promptSetInvestment() {
    const valStr = prompt("Qual o valor total disponível para sua reforma?", this.investment || 80000);
    if (valStr === null) return; // user cancelled
    const val = parseFloat(valStr.replace(/[^\d.]/g, ''));
    if (isNaN(val) || val <= 0) {
      alert("Por favor, digite um valor numérico válido.");
      return;
    }
    this.investment = val;
    localStorage.setItem('reformas_3p_investment', val.toString());
    localStorage.setItem('reformas_3p_orcamento_definido', 'true');
    // Clear margem_definida so they have to go to Mission 2
    localStorage.removeItem('reformas_3p_margem_definida');
    localStorage.removeItem('reformas_3p_margem_pct');
    
    // Sync inputs in Planejar
    const setupBudget = document.getElementById('setup-budget');
    if (setupBudget) setupBudget.value = val.toString();
    
    // Temporarily set budget to total investment until margin is defined!
    this.budget = val; 
    localStorage.setItem('reformas_3p_budget', this.budget.toString());
    
    this.recalculateCategoryBudgets();
    this.updateDashboard();
    
    this.app.triggerPushNotification(
      "💰 ORÇAMENTO DEFINIDO",
      `Seu orçamento máximo foi definido em ${this.formatCurrency(val)}. Defina a margem de segurança na próxima etapa!`,
      "success"
    );
  }

  promptSetSafetyMargin() {
    const valStr = prompt("Qual a porcentagem de margem de segurança que deseja reservar? (Recomendado: 10%)", "10");
    if (valStr === null) return;
    const val = parseFloat(valStr.replace(/[^\d.]/g, ''));
    if (isNaN(val) || val < 0 || val > 100) {
      alert("Por favor, digite uma porcentagem válida de 0 a 100.");
      return;
    }
    const marginAmount = this.investment * (val / 100);
    this.budget = this.investment - marginAmount;
    localStorage.setItem('reformas_3p_budget', this.budget.toString());
    localStorage.setItem('reformas_3p_margem_definida', 'true');
    localStorage.setItem('reformas_3p_margem_pct', val.toString());
    
    this.recalculateCategoryBudgets();
    this.updateDashboard();
    
    this.app.triggerPushNotification(
      "🛡️ MARGEM DEFINIDA",
      `Margem de ${val}% (${this.formatCurrency(marginAmount)}) definida. Orçamento disponível para gastar: ${this.formatCurrency(this.budget)}.`,
      "success"
    );
  }

  saveOrcamentoForm() {
    const valInput = document.getElementById('form-orcamento-valor');
    const obsText = document.getElementById('form-orcamento-obs');
    const origens = document.getElementsByName('form-orcamento-origem');
    
    let origemVal = 'Recursos próprios';
    origens.forEach(o => {
      if (o.checked) origemVal = o.value;
    });
    
    const val = valInput ? parseFloat(valInput.value) : 0;
    if (isNaN(val) || val <= 0) {
      alert("Por favor, digite um valor de orçamento válido.");
      return;
    }
    
    this.investment = val;
    localStorage.setItem('reformas_3p_investment', val.toString());
    localStorage.setItem('reformas_3p_orcamento_obs', obsText ? obsText.value : '');
    localStorage.setItem('reformas_3p_orcamento_origem', origemVal);
    localStorage.setItem('reformas_3p_orcamento_definido', 'true');
    
    const hasMargin = localStorage.getItem('reformas_3p_margem_definida') === 'true';
    if (!hasMargin) {
      this.budget = val;
      localStorage.setItem('reformas_3p_budget', this.budget.toString());
    } else {
      const marginPctVal = parseFloat(localStorage.getItem('reformas_3p_margem_pct') || '10');
      this.budget = val * (1 - marginPctVal / 100);
      localStorage.setItem('reformas_3p_budget', this.budget.toString());
    }
    
    this.recalculateCategoryBudgets();
    this.updateDashboard();
    
    window.app.closePlanejarDrawer('orcamento');
    
    this.app.triggerPushNotification(
      "💰 ORÇAMENTO DEFINIDO",
      `Seu orçamento máximo foi definido em ${this.formatCurrency(val)}. Defina a margem de segurança na próxima etapa!`,
      "success"
    );
    
    if (this.app.syncProfileToSupabase) {
      this.app.syncProfileToSupabase();
    }
  }

  saveMargemForm() {
    const radioSug = document.getElementsByName('form-margem-sug');
    let type = '10';
    radioSug.forEach(r => {
      if (r.checked) type = r.value;
    });
    
    let percent = 10;
    if (type === 'custom') {
      const customInput = document.getElementById('form-margem-custom-val');
      percent = customInput ? parseFloat(customInput.value) : 10;
      if (isNaN(percent) || percent < 0 || percent > 100) {
        alert("Por favor, digite uma porcentagem de margem válida entre 0 e 100.");
        return;
      }
    } else {
      percent = parseFloat(type);
    }
    
    const marginAmount = this.investment * (percent / 100);
    this.budget = this.investment - marginAmount;
    
    localStorage.setItem('reformas_3p_budget', this.budget.toString());
    localStorage.setItem('reformas_3p_margem_definida', 'true');
    localStorage.setItem('reformas_3p_margem_pct', percent.toString());
    
    this.recalculateCategoryBudgets();
    this.updateDashboard();
    
    window.app.closePlanejarDrawer('margem');
    
    this.app.triggerPushNotification(
      "🛡️ MARGEM DEFINIDA",
      `Margem de ${percent}% (${this.formatCurrency(marginAmount)}) definida. Orçamento disponível: ${this.formatCurrency(this.budget)}.`,
      "success"
    );
    
    if (this.app.syncProfileToSupabase) {
      this.app.syncProfileToSupabase();
    }
  }

  renderPrioritiesFormList() {
    const container = document.getElementById('form-prioridades-list');
    if (!container) return;
    const categories = ['Estrutura', 'Elétrica', 'Hidráulica', 'Acabamentos', 'Móveis', 'Iluminação', 'Área Externa', 'Automação', 'Paisagismo'];
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('reformas_3p_prioridades_niveis') || '{}');
    } catch(e) {}
    
    container.innerHTML = categories.map(cat => {
      const level = saved[cat] || 'Media';
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
          <span style="font-size: 12px; font-weight: 700; color: #fff;">${cat}</span>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-prio-opt ${level === 'Alta' ? 'active' : ''}" data-cat="${cat}" data-level="Alta" onclick="window.app.financeiroController.setPriorityLevel(this, '${cat}', 'Alta')" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: ${level === 'Alta' ? '#ff3b30' : 'transparent'}; color: #fff; cursor: pointer; font-weight: bold; border-color: ${level === 'Alta' ? '#ff3b30' : 'rgba(255,255,255,0.1)'};">Alta</button>
            <button type="button" class="btn-prio-opt ${level === 'Media' ? 'active' : ''}" data-cat="${cat}" data-level="Media" onclick="window.app.financeiroController.setPriorityLevel(this, '${cat}', 'Media')" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: ${level === 'Media' ? '#ff9f0a' : 'transparent'}; color: #fff; cursor: pointer; font-weight: bold; border-color: ${level === 'Media' ? '#ff9f0a' : 'rgba(255,255,255,0.1)'};">Média</button>
            <button type="button" class="btn-prio-opt ${level === 'Baixa' ? 'active' : ''}" data-cat="${cat}" data-level="Baixa" onclick="window.app.financeiroController.setPriorityLevel(this, '${cat}', 'Baixa')" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: ${level === 'Baixa' ? '#30d158' : 'transparent'}; color: #fff; cursor: pointer; font-weight: bold; border-color: ${level === 'Baixa' ? '#30d158' : 'rgba(255,255,255,0.1)'};">Baixa</button>
          </div>
        </div>
      `;
    }).join('');
  }

  setPriorityLevel(btn, cat, level) {
    const parent = btn.parentElement;
    const buttons = parent.querySelectorAll('.btn-prio-opt');
    buttons.forEach(b => {
      b.classList.remove('active');
      b.style.background = 'transparent';
      b.style.borderColor = 'rgba(255,255,255,0.1)';
    });
    
    btn.classList.add('active');
    let color = '#ff9f0a';
    if (level === 'Alta') color = '#ff3b30';
    if (level === 'Baixa') color = '#30d158';
    
    btn.style.background = color;
    btn.style.borderColor = color;
    
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('reformas_3p_prioridades_niveis') || '{}');
    } catch(e) {}
    
    saved[cat] = level;
    localStorage.setItem('reformas_3p_prioridades_niveis', JSON.stringify(saved));
  }

  savePrioritiesForm() {
    localStorage.setItem('reformas_3p_prioridades_definidas', 'true');
    this.updateDashboard();
    
    window.app.closePlanejarDrawer('prioridades');
    
    this.app.triggerPushNotification(
      "🎯 PRIORIDADES DEFINIDAS",
      "Suas prioridades da reforma foram salvas com sucesso. Fase Prevenir liberada!",
      "success"
    );
    
    if (this.app.syncProfileToSupabase) {
      this.app.syncProfileToSupabase();
    }
  }

  // ==========================================================================
  // PASSO 2: ORÇAMENTO DETALHADO (PLANEJADO)
  // ==========================================================================
  addPlannedItem() {
    const descEl = document.getElementById('plan-input-desc');
    const amountEl = document.getElementById('plan-input-amount');
    const typeEl = document.getElementById('plan-input-type');
    
    const desc = descEl ? descEl.value.trim() : '';
    const amount = amountEl ? parseFloat(amountEl.value) : 0;
    const type = typeEl ? typeEl.value : 'material';
    
    if (!desc) {
      alert("Por favor, digite a descrição do item a planejar.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, digite um valor monetário de previsão válido.");
      return;
    }
    
    const newItem = {
      id: "plan-" + Date.now(),
      description: desc,
      category: type,
      amount: amount
    };
    
    this.plannedItems.unshift(newItem);
    localStorage.setItem('reformas_3p_planned_items', JSON.stringify(this.plannedItems));
    
    if (descEl) descEl.value = '';
    if (amountEl) amountEl.value = '';
    
    this.renderPlannedItems();
    
    // Sincronizar com Supabase em background
    if (this.app.syncPlannedToSupabase) {
      this.app.syncPlannedToSupabase();
    }
    
    this.app.triggerPushNotification(
      "📝 PREVISÃO REGISTRADA",
      `"${desc}" de ${this.formatCurrency(amount)} foi incluído no planejamento.`,
      "success"
    );
  }

  deletePlannedItem(id) {
    if (confirm("Tem certeza que deseja excluir este item planejado?")) {
      this.plannedItems = this.plannedItems.filter(item => item.id !== id);
      localStorage.setItem('reformas_3p_planned_items', JSON.stringify(this.plannedItems));
      this.renderPlannedItems();
      
      // Sincronizar com Supabase em background
      if (this.app.syncPlannedToSupabase) {
        this.app.syncPlannedToSupabase();
      }
    }
  }

  getPlannedTotal() {
    return this.plannedItems.reduce((sum, item) => sum + item.amount, 0);
  }

  renderPlannedItems() {
    const totalPlanned = this.getPlannedTotal();
    const plannedPercent = this.budget > 0 ? (totalPlanned / this.budget) * 100 : 0;
    
    const capEl = document.getElementById('planner-budget-cap');
    const sumEl = document.getElementById('planner-total-sum');
    const barEl = document.getElementById('planner-progress-bar');
    const statusEl = document.getElementById('planner-budget-status');
    
    if (capEl) capEl.textContent = this.formatCurrency(this.budget);
    if (sumEl) sumEl.textContent = this.formatCurrency(totalPlanned);
    
    if (barEl) {
      barEl.style.width = `${Math.min(plannedPercent, 100)}%`;
      if (plannedPercent > 100) {
        barEl.style.background = 'var(--color-danger)';
      } else {
        barEl.style.background = 'var(--primary-gradient)';
      }
    }
    
    if (statusEl) {
      if (plannedPercent > 100) {
        statusEl.textContent = "ESTOURADO!";
        statusEl.className = "stats-badge danger";
        
        if (!this.triggeredAlerts.has('planned-over')) {
          this.triggeredAlerts.add('planned-over');
          this.app.triggerPushNotification(
            "🚨 PLANEJAMENTO ESTOURADO",
            `Seu total planejado (${this.formatCurrency(totalPlanned)}) ultrapassou o teto de 90% da obra (${this.formatCurrency(this.budget)}).`,
            "danger"
          );
        }
      } else {
        statusEl.textContent = "Planejamento OK";
        statusEl.className = "stats-badge";
      }
    }
    
    const listEl = document.getElementById('planner-items-list');
    if (!listEl) return;
    
    if (this.plannedItems.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-emoji">📝</div>
          <h4>Nenhum item planejado</h4>
          <p>Adicione materiais e mão de obra previstos acima para começar a mapear a obra.</p>
        </div>`;
      return;
    }
    
    listEl.innerHTML = this.plannedItems.map(item => {
      const typeLabel = item.category === 'material' ? '🧱 Material' : '👷 Serviço';
      const typeColor = item.category === 'material' ? '#ff6a00' : '#f39c12';
      
      return `
        <div class="planned-item-row">
          <div class="planned-left">
            <div class="planned-emoji-badge">${item.category === 'material' ? '🧱' : '👷'}</div>
            <div class="planned-info">
              <span class="planned-title">${item.description}</span>
              <span class="planned-type-tag" style="color: ${typeColor}">${typeLabel}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="planned-amount-val">${this.formatCurrency(item.amount)}</span>
            <button class="btn btn-secondary btn-mini" style="padding: 4px 8px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05);" onclick="window.app.financeiroController.deletePlannedItem('${item.id}')">✖</button>
          </div>
        </div>`;
    }).join('');
  }

  // ==========================================================================
  // PASSO 3: REALIZADO (PAGO E A PAGAR)
  // ==========================================================================
  addExpense(description, category, amount, date, plannedVal, supplier, status) {
    const newExpense = {
      id: "exp-" + Date.now(),
      description: description || "Gasto Geral",
      category: category,
      plannedVal: parseFloat(plannedVal) || 0,
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'concluido',
      supplier: supplier || 'Geral',
      delivered: false
    };
    
    this.expenses.unshift(newExpense);
    this.saveExpenses();
    this.checkAlerts(category);
    this.updateDashboard();
    
    this.app.updateProfileStats();
    
    // Sincronizar com Supabase em background
    if (this.app.syncExpensesToSupabase) {
      this.app.syncExpensesToSupabase();
    }
    
    this.app.triggerPushNotification(
      "🛒 COMPRA REGISTRADA",
      `"${newExpense.description}" foi adicionado com sucesso.`,
      "success"
    );
  }

  deleteExpense(id) {
    this.expenses = this.expenses.filter(exp => exp.id !== id);
    this.saveExpenses();
    this.updateDashboard();
    this.app.updateProfileStats();
    // Sincronizar com Supabase em background
    if (this.app.syncExpensesToSupabase) {
      this.app.syncExpensesToSupabase();
    }
  }

  toggleExpenseStatus(id) {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) return;
    
    const oldStatus = exp.status;
    if (oldStatus === 'pago' || oldStatus === 'concluido') {
      exp.status = 'planejado';
    } else if (oldStatus === 'a_pagar' || oldStatus === 'planejado') {
      exp.status = 'em_andamento';
    } else {
      exp.status = 'concluido';
    }
    
    this.saveExpenses();
    this.updateDashboard();
    this.app.updateProfileStats();
    
    if (this.app.syncExpensesToSupabase) {
      this.app.syncExpensesToSupabase();
    }
    
    const statusLabels = {
      'concluido': 'Concluído',
      'pago': 'Concluído',
      'em_andamento': 'Em andamento',
      'planejado': 'Planejado',
      'a_pagar': 'Planejado'
    };
    
    this.app.triggerPushNotification(
      "✅ STATUS ATUALIZADO",
      `O status de "${exp.description}" foi alterado para "${statusLabels[exp.status]}".`,
      "success"
    );
  }

  getTotalSpent() {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  getPaidTotal() {
    return this.expenses
      .filter(exp => exp.status === 'pago')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  getToPayTotal() {
    return this.expenses
      .filter(exp => exp.status === 'a_pagar')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  getCategorySum(cat) {
    return this.expenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  checkAlerts(newExpenseCategory) {
    const totalSpent = this.getTotalSpent();
    const totalSpentPercent = this.budget > 0 ? (totalSpent / this.budget) * 100 : 0;
    
    if (totalSpentPercent >= 100 && !this.triggeredAlerts.has('total-100')) {
      this.triggeredAlerts.add('total-100');
      this.app.triggerPushNotification(
        "🚨 ORÇAMENTO REAL ESGOTADO",
        "Atenção! Suas despesas acumuladas atingiram 100% do teto máximo planejado.",
        "danger"
      );
    } else if (totalSpentPercent >= 80 && !this.triggeredAlerts.has('total-80')) {
      this.triggeredAlerts.add('total-80');
      this.app.triggerPushNotification(
        "⚠️ ALERTA DE FLUXO DE CAIXA (80%)",
        "Os custos totais atingiram 80% do limite máximo da obra de 90%.",
        "warning"
      );
    }
  }

  switchSubTab(subTabId) {
    this.activeSubTab = subTabId;
    
    const subviews = document.querySelectorAll('#tab-orcamento .sub-view');
    subviews.forEach(sv => sv.classList.remove('active'));
    
    const activeView = document.getElementById(`subview-${subTabId}`);
    if (activeView) activeView.classList.add('active');
    
    const segmentBtns = document.querySelectorAll('#tab-orcamento .tool-segmented-control .segment-btn');
    segmentBtns.forEach(btn => btn.classList.remove('active'));
    
    const matchedBtn = document.getElementById(`subtab-btn-${subTabId}`);
    if (matchedBtn) matchedBtn.classList.add('active');
    
    if (subTabId === 'detalhado') {
      this.renderPlannedItems();
    } else if (subTabId === 'pagamentos') {
      this.updateDashboard();
    }

    if (this.app && this.app.highlightNavButton) {
      this.app.highlightNavButton('orcamento', subTabId);
    }
  }

  updateDashboard() {
    // 1. Passo 1 view rendering updates
    const projDisplayTotal = document.getElementById('proj-display-total');
    const projDisplayMargin = document.getElementById('proj-display-margin');
    const projDisplayBudget = document.getElementById('proj-display-budget');
    
    if (projDisplayTotal) projDisplayTotal.textContent = this.formatCurrency(this.investment);
    if (projDisplayMargin) projDisplayMargin.textContent = `- ${this.formatCurrency(this.investment * 0.10)}`;
    if (projDisplayBudget) projDisplayBudget.textContent = this.formatCurrency(this.budget);
    
    // 2. Passo 3 view rendering updates
    const totalRealSpent = this.getTotalSpent();
    const totalPaid = this.getPaidTotal();
    const totalToPay = this.getToPayTotal();
    const spentPercent = this.budget > 0 ? (totalPaid / this.budget) * 100 : 0;
    
    const statsRemaining = document.getElementById('stats-remaining-val');
    const realPaidSum = document.getElementById('real-paid-sum');
    const realToPaySum = document.getElementById('real-topay-sum');
    const marginBadge = document.getElementById('stats-margin-status');
    
    if (statsRemaining) statsRemaining.textContent = this.formatCurrency(totalRealSpent);
    if (realPaidSum) realPaidSum.textContent = this.formatCurrency(totalPaid);
    if (realToPaySum) realToPaySum.textContent = this.formatCurrency(totalToPay);
    
    if (marginBadge) {
      if (totalRealSpent > this.budget) {
        marginBadge.textContent = "Teto Estourado!";
        marginBadge.className = "stats-badge danger";
      } else if (spentPercent >= 80) {
        marginBadge.textContent = "Aviso: Limite de 80%";
        marginBadge.className = "stats-badge warn";
      } else {
        marginBadge.textContent = "Orçamento sob Controle";
        marginBadge.className = "stats-badge";
      }
    }
    
    // 3. Descompasso calculations
    const physicalProgress = this.app.conteudosController.getOverallPhysicalProgress();
    
    const pBarFinance = document.getElementById('p-bar-finance');
    const pPercentFinance = document.getElementById('p-percent-finance');
    const pBarPhysical = document.getElementById('p-bar-physical');
    const pPercentPhysical = document.getElementById('p-percent-physical');
    const syncAlert = document.getElementById('progress-sync-alert');
    const syncMsg = document.getElementById('progress-sync-msg');
    
    if (pBarFinance) pBarFinance.style.width = `${Math.min(spentPercent, 100)}%`;
    if (pPercentFinance) pPercentFinance.textContent = `${spentPercent.toFixed(0)}%`;
    
    if (physicalProgress === null) {
      if (pBarPhysical) pBarPhysical.style.width = `0%`;
      if (pPercentPhysical) pPercentPhysical.textContent = `-`;
      if (syncAlert && syncMsg) {
        syncAlert.className = "progress-warning-alert safe";
        const iconEl = syncAlert.querySelector('.alert-icon');
        if (iconEl) iconEl.textContent = "ℹ️";
        syncMsg.innerHTML = `<strong>Aguardando acompanhamento:</strong> Cadastre o acompanhamento da obra para calcular a evolução física da reforma.`;
      }
    } else {
      if (pBarPhysical) pBarPhysical.style.width = `${physicalProgress.toFixed(0)}%`;
      if (pPercentPhysical) pPercentPhysical.textContent = `${physicalProgress.toFixed(0)}%`;
      
      if (syncAlert && syncMsg) {
        const diff = spentPercent - physicalProgress;
        
        if (diff > 30) {
          syncAlert.className = "progress-warning-alert danger";
          const iconEl = syncAlert.querySelector('.alert-icon');
          if (iconEl) iconEl.textContent = "🔴";
          syncMsg.innerHTML = `<strong>Risco de Prejuízo!</strong> Você já consumiu ${spentPercent.toFixed(0)}% do orçamento disponível, mas a obra avançou apenas ${physicalProgress.toFixed(0)}%. O descompasso é de <b>${diff.toFixed(0)}%</b>. Pare imediatamente de adiantar dinheiro ao pedreiro!`;
        } else if (diff > 10) {
          syncAlert.className = "progress-warning-alert warn";
          const iconEl = syncAlert.querySelector('.alert-icon');
          if (iconEl) iconEl.textContent = "🟡";
          syncMsg.innerHTML = `<strong>Aviso de Atenção!</strong> Você pagou (${spentPercent.toFixed(0)}%) ligeiramente mais do que a obra andou (${physicalProgress.toFixed(0)}%). O descompasso é de <b>${diff.toFixed(0)}%</b>. Acompanhe as próximas entregas.`;
        } else {
          syncAlert.className = "progress-warning-alert safe";
          const iconEl = syncAlert.querySelector('.alert-icon');
          if (iconEl) iconEl.textContent = "🟢";
          syncMsg.innerHTML = `<strong>Tudo sob controle!</strong> Seu avanço financeiro (${spentPercent.toFixed(0)}%) está perfeitamente alinhado com o progresso físico da sua obra (${physicalProgress.toFixed(0)}%). O descompasso é de <b>${diff.toFixed(0)}%</b>.`;
        }
      }
    }
    
    // Render real transactions list
    this.renderExpensesList();
    
    // Redraw Chart
    this.drawChart();
    
    // Refresh Central Dashboard command center
    this.renderDashboardCentral();
    this.renderPriorityItems();
  }

  renderExpensesList() {
    const listEl = document.getElementById('dashboard-expenses-list');
    if (!listEl) return;
    
    if (this.expenses.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-emoji">💸</div>
          <h4>Nenhum gasto lançado</h4>
          <p>Adicione suas despesas para começar a monitorar o andamento financeiro real.</p>
        </div>`;
      return;
    }
    
    const categoryEmojis = {
      material: "🧱",
      mao_de_obra: "👷",
      acabamento: "🛁",
      decoracao: "🛋️",
      emergencias: "⚠️"
    };
    
    const categoryColors = {
      material: "#ff6a00",
      mao_de_obra: "#f39c12",
      acabamento: "#2ecc71",
      decoracao: "#9b59b6",
      emergencias: "#e74c3c"
    };
    
    const categoryNames = {
      material: "Material Básico",
      mao_de_obra: "Mão de Obra",
      acabamento: "Acabamento",
      decoracao: "Decoração",
      emergencias: "Extras/Emergência"
    };
    
    listEl.innerHTML = this.expenses.map(exp => {
      const emoji = categoryEmojis[exp.category] || "💸";
      const name = categoryNames[exp.category] || "Geral";
      const color = categoryColors[exp.category] || "#ffffff";
      const isPaid = exp.status === 'pago';
      
      let formattedDate = exp.date;
      try {
        const d = new Date(exp.date + 'T00:00:00');
        formattedDate = d.toLocaleDateString('pt-BR');
      } catch (e) {}
      
      const statusBadge = isPaid
        ? `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 2px 6px;">Pago</span>`
        : `<span class="stats-badge" style="background: rgba(255,159,10,0.1); color: var(--color-warning); border: 1px solid rgba(255,159,10,0.2); font-size: 9px; padding: 2px 6px;">A Pagar</span>`;
        
      const quickActionBtn = isPaid
        ? `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; font-size: 10px; margin-top: 4px; border: none; background: rgba(255,255,255,0.03);" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}')">Marcar A Pagar</button>`
        : `<button class="btn btn-primary btn-mini" style="padding: 2px 6px; font-size: 10px; margin-top: 4px; background: rgba(38,208,124,0.15); color: var(--color-success); border: none; box-shadow: none;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}')">✓ Pagar agora</button>`;
      
      return `
        <div class="expense-item">
          <div class="expense-left">
            <div class="category-badge-icon">${emoji}</div>
            <div>
              <div class="expense-title" style="display: flex; align-items: center; gap: 6px;">
                ${exp.description} ${statusBadge}
              </div>
              <div class="expense-meta">
                <span class="expense-category-tag" style="color: ${color}">${name}</span> • ${formattedDate}
              </div>
            </div>
          </div>
          <div class="expense-right" style="display: flex; flex-direction: column; align-items: flex-end;">
            <div class="expense-amount-val">${this.formatCurrency(exp.amount)}</div>
            <div style="display: flex; gap: 4px;">
              ${quickActionBtn}
              <button class="btn btn-secondary btn-mini" style="margin-top: 4px; padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255,59,48,0.05);" onclick="window.app.deleteExpense('${exp.id}')">Excluir</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  switchChartType(type) {
    this.activeChartType = type;
    
    // Toggle active segment button class
    const btnDoughnut = document.getElementById('chart-btn-doughnut');
    const btnLine = document.getElementById('chart-btn-line');
    
    if (type === 'doughnut') {
      if (btnDoughnut) btnDoughnut.classList.add('active');
      if (btnLine) btnLine.classList.remove('active');
      
      const title = document.getElementById('chart-card-title');
      if (title) title.textContent = "Distribuição de Gastos";
    } else {
      if (btnDoughnut) btnDoughnut.classList.remove('active');
      if (btnLine) btnLine.classList.add('active');
      
      const title = document.getElementById('chart-card-title');
      if (title) title.textContent = "Curva S (Planejado vs Real)";
    }
    
    this.drawChart();
  }

  drawChart() {
    const canvas = document.getElementById('expenses-chart');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
      console.warn("Chart.js não carregado ainda.");
      return;
    }
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    const ctx = canvas.getContext('2d');

    // ------------------------------------------------------------------------
    // MODO 1: GRÁFICO DE PIZZA (DOUGHNUT)
    // ------------------------------------------------------------------------
    if (this.activeChartType === 'doughnut') {
      const labels = ["M. Básico", "Mão de Obra", "Acabamento", "Decoração", "Extras"];
      const data = [
        this.getCategorySum('material'),
        this.getCategorySum('mao_de_obra'),
        this.getCategorySum('acabamento'),
        this.getCategorySum('decoracao'),
        this.getCategorySum('emergencias')
      ];
      
      const colors = ["#ff6a00", "#f39c12", "#26d07c", "#9b59b6", "#ff3b30"];
      const total = data.reduce((s, v) => s + v, 0);
      
      if (total === 0) {
        this.chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ["Sem Lançamento Real"],
            datasets: [{
              data: [1],
              backgroundColor: ["#161924"],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#8c96ab', font: { family: 'Inter', size: 10 } }
              }
            }
          }
        });
        return;
      }
      
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderColor: "#0f121a",
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#8c96ab',
                boxWidth: 8,
                padding: 10,
                font: { family: 'Inter', size: 10, weight: '500' }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const val = context.raw || 0;
                  const percent = (val / total) * 100;
                  return ` ${context.label}: ${this.formatCurrency(val)} (${percent.toFixed(1)}%)`;
                }
              }
            }
          }
        }
      });
      return;
    }

    // ------------------------------------------------------------------------
    // MODO 2: CURVA S TEMPORAL ACUMULADA (LINE CHART)
    // ------------------------------------------------------------------------
    const allDates = new Set();
    this.plannedItems.forEach(item => {
      const dateStr = item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
      allDates.add(dateStr);
    });
    this.expenses.forEach(exp => {
      const dateStr = exp.date || (exp.created_at ? exp.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
      allDates.add(dateStr);
    });
    
    const sortedDates = Array.from(allDates).sort();
    
    // Tratamento para garantir dados no gráfico
    if (sortedDates.length === 0) {
      sortedDates.push(new Date().toISOString().split('T')[0]);
    }
    if (sortedDates.length === 1) {
      const singleDate = new Date(sortedDates[0]);
      const prevDate = new Date(singleDate.setDate(singleDate.getDate() - 7));
      sortedDates.unshift(prevDate.toISOString().split('T')[0]);
    }

    const plannedData = [];
    const realData = [];
    
    sortedDates.forEach(dateStr => {
      // Previsão acumulada planejada
      const plannedSum = this.plannedItems
        .filter(item => {
          const itemDate = item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
          return itemDate <= dateStr;
        })
        .reduce((sum, item) => sum + item.amount, 0);
        
      // Gasto acumulado realizado
      const realSum = this.expenses
        .filter(exp => {
          const expDate = exp.date || (exp.created_at ? exp.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
          return expDate <= dateStr;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
        
      plannedData.push(plannedSum);
      realData.push(realSum);
    });

    const chartLabels = sortedDates.map(d => {
      const parts = d.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return d;
    });

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Previsão Planejada',
            data: plannedData,
            borderColor: '#ff6a00',
            backgroundColor: 'rgba(255, 106, 0, 0.04)',
            borderWidth: 2,
            tension: 0.25,
            fill: true
          },
          {
            label: 'Gasto Realizado',
            data: realData,
            borderColor: '#26d07c',
            backgroundColor: 'rgba(38, 208, 124, 0.04)',
            borderWidth: 2,
            tension: 0.25,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.02)' },
            ticks: { color: '#8c96ab', font: { family: 'Inter', size: 8 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.02)' },
            ticks: { 
              color: '#8c96ab', 
              font: { family: 'Inter', size: 8 },
              callback: (val) => 'R$ ' + val.toLocaleString('pt-BR')
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#8c96ab', font: { family: 'Inter', size: 9 }, boxWidth: 10, padding: 8 }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw || 0;
                return ` ${context.dataset.label}: ${this.formatCurrency(val)}`;
              }
            }
          }
        }
      }
    });
  }

  renderDashboardCentral() {
    const totalRealSpent = this.getTotalSpent();
    const totalPlanned = this.plannedItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Evaluate if margin is defined
    const hasMargin = localStorage.getItem('reformas_3p_margem_definida') === 'true';
    const marginPctVal = hasMargin ? parseFloat(localStorage.getItem('reformas_3p_margem_pct') || '10') : 0;
    const marginAmount = this.investment * (marginPctVal / 100);
    
    // Budget is the available budget: if margin is defined, it is investment - marginAmount. Otherwise, it is the total investment.
    this.budget = hasMargin ? (this.investment - marginAmount) : this.investment;
    localStorage.setItem('reformas_3p_budget', this.budget.toString());
    
    const paidTotal = this.getPaidTotal();
    const spentPercent = this.budget > 0 ? (paidTotal / this.budget) * 100 : 0;
    
    // Let's get physical progress
    const rawPhysicalProgress = this.app.conteudosController.getOverallPhysicalProgress();
    const hasPhysicalProgressData = rawPhysicalProgress !== null;
    let physicalProgress = hasPhysicalProgressData ? rawPhysicalProgress : 0;
    
    const isConcluida = localStorage.getItem('reformas_3p_obra_concluida') === 'true';
    if (isConcluida) {
      physicalProgress = 100;
    }
    const hasGarantias = (this.app.conteudosController.warranties && this.app.conteudosController.warranties.length > 0) || localStorage.getItem('reformas_3p_garantias_organizadas') === 'true';
    const hasPendencias = (this.app.conteudosController.pendencias && this.app.conteudosController.pendencias.length > 0) || localStorage.getItem('reformas_3p_pendencias_registradas') === 'true';
    
    const diff = spentPercent - physicalProgress;
    const unpaidTotal = this.getToPayTotal();
    
    const isDescompassoEnabled = localStorage.getItem('reformas_3p_pref_descompasso') !== 'false';
    
    // ==========================================
    // 1. DYNAMIC STATUS CARD & HEADER
    // ==========================================
    const statusCard = document.querySelector('.status-obra-card');
    const statusTitle = document.getElementById('dash-status-title');
    const statusDesc = document.getElementById('dash-status-desc');
    const statusIconContainer = document.getElementById('dash-status-icon-container');
    const statusPill = document.getElementById('dash-status-pill'); // compatibility
    
    // Dynamic Status Greeting in Header
    const headerGreetingName = document.getElementById('header-user-name');
    if (headerGreetingName) {
      headerGreetingName.textContent = this.app.name || "Cleber";
    }
    
    let statusText = "SOB CONTROLE";
    let statusColor = "#32d74b"; // green
    
    if (isConcluida) {
      statusText = "CONCLUÍDA";
      statusColor = "#32d74b";
      if (statusTitle) statusTitle.textContent = "CONCLUÍDA";
      if (statusTitle) statusTitle.style.color = "#32d74b";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(50, 215, 75, 0.4)";
        statusCard.style.boxShadow = "0 8px 32px rgba(50, 215, 75, 0.08)";
      }
      if (statusDesc) statusDesc.textContent = "Sua reforma foi concluída com sucesso! Parabéns!";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        statusIconContainer.style.background = "rgba(50, 215, 75, 0.12)";
        statusIconContainer.style.borderColor = "#32d74b";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #32d74b; display: inline-block;"></span> CONCLUÍDA`;
      }
    } else if (!hasPhysicalProgressData) {
      statusText = "AGUARDANDO ACOMPANHAMENTO";
      statusColor = "#0088ff";
      if (statusTitle) statusTitle.textContent = "AGUARDANDO DADOS";
      if (statusTitle) statusTitle.style.color = "#0088ff";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(0, 136, 255, 0.4)";
        statusCard.style.boxShadow = "none";
      }
      if (statusDesc) statusDesc.textContent = "Cadastre o acompanhamento da obra para calcular a evolução física da reforma.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0088ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        statusIconContainer.style.background = "rgba(0, 136, 255, 0.12)";
        statusIconContainer.style.borderColor = "#0088ff";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #0088ff; display: inline-block;"></span> AGUARDANDO ACOMP.";`;
      }
    } else if (!isDescompassoEnabled) {
      statusText = "INATIVO";
      statusColor = "#8c96ab";
      if (statusTitle) statusTitle.textContent = "INATIVO";
      if (statusTitle) statusTitle.style.color = "#8c96ab";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(255, 255, 255, 0.1)";
        statusCard.style.boxShadow = "none";
      }
      if (statusDesc) statusDesc.textContent = "Análise de descompasso física-financeira desativada.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c96ab" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
        statusIconContainer.style.background = "rgba(255, 255, 255, 0.05)";
        statusIconContainer.style.borderColor = "#8c96ab";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #8c96ab; display: inline-block;"></span> INATIVO`;
      }
    } else if (diff > 30) {
      statusText = "EM RISCO";
      statusColor = "#ff453a";
      if (statusTitle) statusTitle.textContent = "EM RISCO";
      if (statusTitle) statusTitle.style.color = "#ff453a";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(255, 69, 58, 0.4)";
        statusCard.style.boxShadow = "0 8px 32px rgba(255, 69, 58, 0.06)";
      }
      if (statusDesc) statusDesc.textContent = "Aviso de Risco: pare de adiantar pagamentos! Descompasso crítico física-financeira.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        statusIconContainer.style.background = "rgba(255, 69, 58, 0.12)";
        statusIconContainer.style.borderColor = "#ff453a";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #ff453a; display: inline-block;"></span> EM RISCO`;
      }
    } else if (diff > 10 || totalRealSpent > this.budget) {
      statusText = "ATENÇÃO";
      statusColor = "#ff9f0a";
      if (statusTitle) statusTitle.textContent = "ATENÇÃO";
      if (statusTitle) statusTitle.style.color = "#ff9f0a";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(255, 159, 10, 0.4)";
        statusCard.style.boxShadow = "0 8px 32px rgba(255, 159, 10, 0.06)";
      }
      if (statusDesc) statusDesc.textContent = "Atenção: avanço físico ligeiramente abaixo do planejado ou teto próximo.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        statusIconContainer.style.background = "rgba(255, 159, 10, 0.12)";
        statusIconContainer.style.borderColor = "#ff9f0a";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #ff9f0a; display: inline-block;"></span> ATENÇÃO`;
      }
    } else {
      statusText = "SOB CONTROLE";
      statusColor = "#32d74b";
      if (statusTitle) statusTitle.textContent = "SOB CONTROLE";
      if (statusTitle) statusTitle.style.color = "#32d74b";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(50, 215, 75, 0.25)";
        statusCard.style.boxShadow = "0 8px 32px rgba(50, 215, 75, 0.05)";
      }
      if (statusDesc) statusDesc.textContent = "Sua reforma está evoluindo conforme o planejado.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        statusIconContainer.style.background = "rgba(50, 215, 75, 0.12)";
        statusIconContainer.style.borderColor = "#32d74b";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #32d74b; display: inline-block;"></span> SOB CONTROLE`;
      }
    }
    
    // Also update dynamic greeting text in header
    const headerGreetingText = document.querySelector('.header-right-container span[style*="color: #8c96ab"]');
    if (headerGreetingText) {
      if (isConcluida) {
        headerGreetingText.innerHTML = `Sua reforma foi <span style="color: #32d74b; font-weight: 700;">concluída!</span>`;
      } else {
        const colorHex = statusColor === '#32d74b' ? '#32d74b' : (statusColor === '#ff9f0a' ? '#ff9f0a' : '#ff453a');
        headerGreetingText.innerHTML = `Sua reforma está sob <span style="color: ${colorHex}; font-weight: 700;">controle.</span>`;
      }
    }

    // ==========================================
    // 2. CENTRO DE CONTROLE 3P METRICS CARD GRID
    // ==========================================
    const metricBudget = document.getElementById('dash-metric-budget');
    const metricExecuted = document.getElementById('dash-metric-executed');
    const metricExecutedPct = document.getElementById('dash-metric-executed-pct');
    const metricToPay = document.getElementById('dash-metric-topay');
    const metricToPayPct = document.getElementById('dash-metric-topay-pct');
    const metricPhysical = document.getElementById('dash-metric-physical');
    
    // Dynamically update Budget card label and values
    const budgetCardInfo = document.getElementById('dash-metric-budget')?.parentElement;
    if (budgetCardInfo) {
      const labelSpan = budgetCardInfo.querySelector('span:first-child');
      const subSpan = budgetCardInfo.querySelector('.pct-sub');
      
      if (hasMargin) {
        if (labelSpan) labelSpan.textContent = "ORÇAMENTO DISPONÍVEL";
        if (metricBudget) metricBudget.textContent = this.formatCurrency(this.budget);
        if (subSpan) subSpan.textContent = `Margem: ${this.formatCurrency(marginAmount)} (${marginPctVal}%)`;
      } else {
        if (labelSpan) labelSpan.textContent = "ORÇAMENTO MÁXIMO";
        if (metricBudget) metricBudget.textContent = this.formatCurrency(this.investment);
        if (subSpan) subSpan.textContent = "Sem margem de segurança";
      }
    } else {
      if (metricBudget) {
        metricBudget.textContent = this.formatCurrency(hasMargin ? this.budget : this.investment);
      }
    }
    
    if (metricExecuted) {
      metricExecuted.textContent = this.formatCurrency(totalRealSpent);
    }
    if (metricExecutedPct) {
      metricExecutedPct.textContent = `${Math.round(spentPercent)}% do total gasto`;
    }
    if (metricToPay) {
      metricToPay.textContent = this.formatCurrency(unpaidTotal);
    }
    if (metricToPayPct) {
      const topayPct = this.budget > 0 ? (unpaidTotal / this.budget) * 100 : 0;
      metricToPayPct.textContent = `${Math.round(topayPct)}% do total`;
    }
    if (metricPhysical) {
      metricPhysical.textContent = `${physicalProgress.toFixed(0)}%`;
    }

    // ==========================================
    // 3. TERMÔMETRO 3P SLIDER & TOOLTIP BUBBLE
    // ==========================================
    const thermDescPct = document.getElementById('thermometer-desc-pct');
    const thermDesc = document.getElementById('thermometer-desc');
    const thermBubble = document.getElementById('thermometer-bubble');
    const thermPinContainer = document.getElementById('thermometer-pin-container');
    const thermBarMarker = document.getElementById('thermometer-bar-marker');

    if (thermDescPct) thermDescPct.textContent = `${spentPercent.toFixed(1)}%`;
    if (thermDesc) {
      thermDesc.innerHTML = `Você utilizou <strong style="color: #ffffff;">${spentPercent.toFixed(1)}%</strong> do orçamento máximo.`;
    }
    if (thermBubble) {
      thermBubble.textContent = `${spentPercent.toFixed(1)}%`;
    }
    if (thermPinContainer) {
      const displayPct = Math.min(Math.max(spentPercent, 0), 100);
      thermPinContainer.style.left = `${displayPct}%`;
      if (thermBarMarker) thermBarMarker.style.left = `${displayPct}%`;
    }

    // ==========================================
    // 4. DYNAMIC RECOMMENDED ACTION CARD (10 PASSOS GPS)
    // ==========================================
    const actionTitle = document.getElementById('dash-action-title');
    const actionDesc = document.getElementById('dash-action-desc');
    const actionBtn = document.getElementById('dash-action-btn');
    const actionStepLabel = document.getElementById('dash-action-step-label');
    const actionStepFill = document.getElementById('dash-action-step-fill');
    
    // 10 Missions Sequence
    const missions = [
      {
        step: 1,
        title: "💰 Definir Orçamento da Reforma",
        desc: "Informe o valor total disponível para sua reforma.",
        check: () => localStorage.getItem('reformas_3p_orcamento_definido') === 'true',
        action: "window.app.openPlanejarDrawer('orcamento')"
      },
      {
        step: 2,
        title: "🛡️ Definir Margem de Segurança",
        desc: "Reserve um percentual do seu orçamento para cobrir imprevistos.",
        check: () => localStorage.getItem('reformas_3p_margem_definida') === 'true',
        action: "window.app.openPlanejarDrawer('margem')"
      },
      {
        step: 3,
        title: "🎯 Definir Prioridades",
        desc: "Escolha quais pilares da reforma são indispensáveis antes de gastar.",
        check: () => localStorage.getItem('reformas_3p_prioridades_definidas') === 'true' || this.priorityItems.length > 0,
        action: "window.app.openPlanejarDrawer('prioridades')"
      },
      {
        step: 4,
        title: "🔍 Comparar Antes de Comprar",
        desc: "Registre as cotações de preços de fornecedores para economizar.",
        check: () => {
          try {
            const quotes = JSON.parse(localStorage.getItem('reformas_3p_quotes_saved') || '[]');
            return quotes.length > 0 || localStorage.getItem('reformas_3p_quotes_completed') === 'true';
          } catch(e) { return false; }
        },
        action: "window.app.openPrevenirDrawer('comparar')"
      },
      {
        step: 5,
        title: "🛒 Controlar Compras",
        desc: "Registre seus materiais e compras realizadas para monitorar desvios.",
        check: () => this.expenses.length > 0 || localStorage.getItem('reformas_3p_compras_controladas') === 'true',
        action: "window.app.openPrevenirDrawer('compras')"
      },
      {
        step: 6,
        title: "👷 Registrar Fornecedor Aprovado",
        desc: "Registre o profissional ou empresa que executará os serviços.",
        check: () => {
          try {
            const sups = JSON.parse(localStorage.getItem('reformas_3p_suppliers_aprovados') || '[]');
            return sups.length > 0 || localStorage.getItem('reformas_3p_fornecedor_aprovado_registrado') === 'true';
          } catch(e) { return false; }
        },
        action: "window.app.openPrevenirDrawer('fornecedores')"
      },
      {
        step: 7,
        title: "💳 Registrar Pagamentos",
        desc: "Acompanhe todos os pagamentos efetuados e saldos ainda pendentes.",
        check: () => this.expenses.filter(e => e.status === 'pago').length > 0 || localStorage.getItem('reformas_3p_pagamentos_registrados') === 'true',
        action: "window.app.openPrevenirDrawer('pagamentos')"
      },
      {
        step: 8,
        title: "📂 Organizar Garantias e Documentos",
        desc: "Organize notas fiscais, contratos e prazos de garantia dos fornecedores.",
        check: () => {
          try {
            const warranties = JSON.parse(localStorage.getItem('reformas_3p_warranties') || '[]');
            return warranties.length > 0 || localStorage.getItem('reformas_3p_garantias_organizadas') === 'true';
          } catch(e) { return false; }
        },
        action: "window.app.openProtegerDrawer('garantias')"
      },
      {
        step: 9,
        title: "📋 Registrar Pendências e Correções",
        desc: "Controle os ajustes finos e itens pendentes para correção.",
        check: () => {
          try {
            const pends = JSON.parse(localStorage.getItem('reformas_3p_pendencias') || '[]');
            const progress = JSON.parse(localStorage.getItem('reformas_3p_acompanhamento') || '{}');
            const hasProgress = Object.keys(progress).length > 0;
            return pends.length > 0 || hasProgress || localStorage.getItem('reformas_3p_pendencias_registradas') === 'true';
          } catch(e) { return false; }
        },
        action: "window.app.openProtegerDrawer('pendencias')"
      },
      {
        step: 10,
        title: "✅ Conferir Entrega Final",
        desc: "Realize o checklist de vistoria técnica e aprove a conclusão da obra.",
        check: () => isConcluida,
        action: "window.app.openProtegerDrawer('checklist')"
      }
    ];

    // Find first active/uncompleted mission
    let currentMission = null;
    for (const m of missions) {
      if (!m.check()) {
        currentMission = m;
        break;
      }
    }
    
    // If all completed, default to celebration
    if (!currentMission || isConcluida) {
      if (actionTitle && actionDesc && actionBtn) {
        actionTitle.textContent = "🎉 Reforma Concluída com Sucesso!";
        actionDesc.textContent = "Parabéns! Sua reforma foi finalizada 100% sob controle pelo Método 3P.";
        actionBtn.setAttribute('onclick', "window.app.switchTab('proteger')");
        actionBtn.innerHTML = `<span>VER RESUMO</span> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        if (actionStepLabel) actionStepLabel.textContent = "10 de 10 passos concluídos";
        if (actionStepFill) actionStepFill.style.width = "100%";
      }
    } else {
      if (actionTitle && actionDesc && actionBtn) {
        actionTitle.textContent = currentMission.title;
        actionDesc.textContent = currentMission.desc;
        actionBtn.setAttribute('onclick', currentMission.action);
        actionBtn.innerHTML = `<span>IR PARA A ETAPA</span> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        
        if (actionStepLabel) {
          actionStepLabel.textContent = `Passo ${currentMission.step} de 10`;
        }
        if (actionStepFill) {
          actionStepFill.style.width = `${currentMission.step * 10}%`;
        }
      }
    }

    // ==========================================
    // 5. 3P PHASES DYNAMIC PROGRESS BARS & TAB METRICS
    // ==========================================
    let planejarProgress = this.app.conteudosController.getPhaseProgress('planejar') || 0;
    if (localStorage.getItem('reformas_3p_prioridades_definidas') === 'true') {
      planejarProgress = 100;
    }
    
    let prevenirProgress = this.app.conteudosController.getPhaseProgress('prevenir') || 0;
    if (localStorage.getItem('reformas_3p_fornecedor_aprovado_registrado') === 'true') {
      prevenirProgress = Math.max(prevenirProgress, 75);
    }
    
    let protegerProgress = this.app.conteudosController.getPhaseProgress('proteger') || 0;
    if (isConcluida) {
      protegerProgress = 100;
    } else if (hasPendencias) {
      protegerProgress = Math.max(protegerProgress, 66);
    } else if (hasGarantias) {
      protegerProgress = Math.max(protegerProgress, 33);
    }

    const p1PercentEl = document.getElementById('phase-p1-percent');
    const p1BarEl = document.getElementById('phase-p1-bar');
    const p2PercentEl = document.getElementById('phase-p2-percent');
    const p2BarEl = document.getElementById('phase-p2-bar');
    const p3PercentEl = document.getElementById('phase-p3-percent');
    const p3BarEl = document.getElementById('phase-p3-bar');

    if (p1PercentEl) p1PercentEl.textContent = `${planejarProgress.toFixed(0)}%`;
    if (p1BarEl) p1BarEl.style.width = `${planejarProgress}%`;
    if (p2PercentEl) p2PercentEl.textContent = `${prevenirProgress.toFixed(0)}%`;
    if (p2BarEl) p2BarEl.style.width = `${prevenirProgress}%`;
    if (p3PercentEl) p3PercentEl.textContent = `${protegerProgress.toFixed(0)}%`;
    if (p3BarEl) p3BarEl.style.width = `${protegerProgress}%`;

    // Phase Circles & Labels
    const planCircle = document.getElementById('planejar-phase-circle');
    const planPct = document.getElementById('planejar-phase-pct');
    if (planPct) planPct.textContent = `${planejarProgress.toFixed(0)}%`;
    if (planCircle) {
      const offset = 100 - planejarProgress;
      planCircle.style.strokeDashoffset = offset;
    }
    
    const prevCircle = document.getElementById('prevenir-phase-circle');
    const prevPct = document.getElementById('prevenir-phase-pct');
    if (prevPct) prevPct.textContent = `${prevenirProgress.toFixed(0)}%`;
    if (prevCircle) {
      const offset = 100 - prevenirProgress;
      prevCircle.style.strokeDashoffset = offset;
    }
    
    const protCircle = document.getElementById('proteger-phase-circle');
    const protPct = document.getElementById('proteger-phase-pct');
    if (protPct) protPct.textContent = `${protegerProgress.toFixed(0)}%`;
    if (protCircle) {
      const offset = 100 - protegerProgress;
      protCircle.style.strokeDashoffset = offset;
    }
    
    // Planejar tab values
    const p1TotalVerba = document.getElementById('planejar-total-verba');
    const p1MargemVerba = document.getElementById('planejar-margem-verba');
    
    if (p1TotalVerba) p1TotalVerba.textContent = this.formatCurrency(this.investment);
    if (p1MargemVerba) {
      p1MargemVerba.textContent = hasMargin 
        ? `${this.formatCurrency(marginAmount)} reservados para imprevistos`
        : `Margem de segurança não definida.`;
    }
    
    const p1MargemPct = document.getElementById('planejar-margem-pct');
    if (p1MargemPct) p1MargemPct.textContent = hasMargin ? `${marginPctVal}%` : "0%";
    
    const p1ProgressBar = document.getElementById('planejar-progress-bar');
    const p1UtilizadoLbl = document.getElementById('planejar-utilizado-lbl');
    const p1DisponivelLbl = document.getElementById('planejar-disponivel-lbl');
    
    const p1Pct = this.budget > 0 ? (totalPlanned / this.budget) * 100 : 0;
    if (p1ProgressBar) p1ProgressBar.style.width = `${Math.min(p1Pct, 100)}%`;
    if (p1UtilizadoLbl) p1UtilizadoLbl.textContent = `${this.formatCurrency(totalPlanned)} utilizado`;
    if (p1DisponivelLbl) {
      const avail = Math.max(0, this.budget - totalPlanned);
      const availPct = this.investment > 0 ? (avail / this.investment) * 100 : 0;
      p1DisponivelLbl.textContent = `${this.formatCurrency(avail)} disponível (${availPct.toFixed(0)}%)`;
    }
    
    this.loadPilarPriorities();
    
    // Prevenir tab values (3-column layout matching mockups)
    const p2Previsto = document.getElementById('prevenir-previsto');
    const p2Economia = document.getElementById('prevenir-economia');
    const p2Saldo = document.getElementById('prevenir-saldo');
    
    // Calculate Economy Potential dynamically (difference between max and min budget estimated or 12% standard)
    let economyTotal = 0;
    const quotesSavedStr = localStorage.getItem('reformas_3p_quotes_saved');
    if (quotesSavedStr) {
      try {
        const quotes = JSON.parse(quotesSavedStr);
        if (quotes.length > 1) {
          const prices = quotes.map(q => q.price);
          const maxP = Math.max(...prices);
          const minP = Math.min(...prices);
          economyTotal = maxP - minP; // difference represents potential savings
        }
      } catch (e) {}
    }
    if (economyTotal === 0 && totalPlanned > 0) {
      economyTotal = totalPlanned * 0.12; // fallback 12%
    }
    
    if (p2Previsto) p2Previsto.textContent = this.formatCurrency(totalPlanned);
    if (p2Economia) p2Economia.textContent = this.formatCurrency(economyTotal);
    if (p2Saldo) p2Saldo.textContent = this.formatCurrency(unpaidTotal);

    // ==========================================
    // 6. MOTOR DE ALERTAS - DETECT & COMPILE ACTIVE ALERTS
    // ==========================================
    let activeAlerts = [];
    
    if (!isConcluida) {
      // Alert 1 (Missions): Orçamento sem margem
      if (localStorage.getItem('reformas_3p_orcamento_definido') === 'true' && !hasMargin) {
        activeAlerts.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Orçamento sem margem de segurança',
          desc: 'Defina uma margem de segurança para cobrir imprevistos da obra.',
          actionText: 'Definir Margem',
          action: 'window.app.financeiroController.promptSetSafetyMargin()'
        });
      }
      
      // Alert 2 (Missions): Fornecedor acima do mercado (Mission 4)
      if (quotesSavedStr) {
        try {
          const quotes = JSON.parse(quotesSavedStr);
          if (quotes.length > 1) {
            const prices = quotes.map(q => q.price);
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            if (maxP > 1.2 * minP) {
              activeAlerts.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Fornecedor acima do mercado',
                desc: 'Há fornecedores comparados com preços significativamente superiores ao menor preço.',
                actionText: 'Comparar Preços',
                action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('comparar'); }, 150);"
              });
            }
          }
        } catch (e) {}
      }
      
      // Alert 3 (Missions): Compra acima do planejado (Mission 5)
      if (totalPlanned > 0 && totalRealSpent > totalPlanned) {
        activeAlerts.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Compra acima do planejado',
          desc: 'Seu gasto executado superou o total previsto para a obra.',
          actionText: 'Controlar Compras',
          action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('compras'); }, 150);"
        });
      }
      
      // Alert 4 (Missions): Approved suppliers lacking contracts/deadlines/warranties (Mission 6)
      const supsStr = localStorage.getItem('reformas_3p_suppliers_aprovados');
      if (supsStr) {
        try {
          const sups = JSON.parse(supsStr);
          if (sups.length > 0) {
            const missingContract = sups.some(s => s.contract === 'nao');
            const missingDeadline = sups.some(s => !s.deadline);
            const missingWarranty = sups.some(s => !s.warranty);
            
            if (missingContract) {
              activeAlerts.push({
                type: 'warning',
                icon: '🟠',
                title: 'Fornecedor sem contrato',
                desc: 'Formalize a contratação do fornecedor aprovado para evitar surpresas.',
                actionText: 'Ver Contratos',
                action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('fornecedores'); }, 150);"
              });
            }
            if (missingDeadline) {
              activeAlerts.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Sem prazo definido',
                desc: 'Existem prestadores de serviço ativos sem data de entrega estabelecida.',
                actionText: 'Ver Prazos',
                action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('fornecedores'); }, 150);"
              });
            }
            if (missingWarranty) {
              activeAlerts.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Sem garantia cadastrada',
                desc: 'Existem fornecedores aprovados sem termo de garantia registrado.',
                actionText: 'Ver Garantias',
                action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('fornecedores'); }, 150);"
              });
            }
          }
        } catch(e) {}
      }
      
      // Alert 5 (Engine 1): Executado > 90%
      if (spentPercent > 90) {
        activeAlerts.push({
          type: 'danger',
          icon: '🔴',
          title: 'Risco de estouro do orçamento',
          desc: `Você consumiu ${spentPercent.toFixed(0)}% do orçamento máximo da reforma.`,
          actionText: 'Ver Gastos',
          action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('pagamentos'); }, 150);"
        });
      } else if (spentPercent >= 70) {
        // Alerta Principal do Termômetro
        activeAlerts.push({
          type: 'warning',
          icon: '🟠',
          title: 'Alerta Financeiro',
          desc: `Sua reforma já consumiu ${spentPercent.toFixed(0)}% do orçamento previsto.`,
          actionText: 'Ver Termômetro',
          action: "window.app.switchTab('painel')"
        });
      }
      
      // Alert 6 (Engine 2): Mais de 3 pagamentos vencidos
      const todayStr = new Date().toISOString().split('T')[0];
      const overduePayments = this.expenses.filter(e => e.status === 'a_pay' || e.status === 'a_pagar').filter(e => e.date && e.date < todayStr);
      if (overduePayments.length > 3) {
        activeAlerts.push({
          type: 'warning',
          icon: '🟠',
          title: 'Pagamentos em atraso',
          desc: `Você possui ${overduePayments.length} pagamentos vencidos no canteiro de obras.`,
          actionText: 'Ir para Pagamentos',
          action: "window.app.switchTab('prevenir'); setTimeout(() => { window.app.openPrevenirDrawer('pagamentos'); }, 150);"
        });
      }
      
      // Alert 7 (Engine 4): Sem garantias cadastradas
      if (this.app.conteudosController.warranties.length === 0) {
        activeAlerts.push({
          type: 'warning',
          icon: '🟠',
          title: 'Cadastre garantias e documentos',
          desc: 'Adicione suas notas fiscais, contratos e prazos de garantia dos fornecedores.',
          actionText: 'Ir para Proteção',
          action: "window.app.switchTab('proteger'); setTimeout(() => { window.app.openProtegerDrawer('garantias'); }, 150);"
        });
      }
      
      // Alert 8 (Missions): Documentação incompleta (Mission 8)
      if (hasGarantias && this.app.conteudosController.warranties.length < 2) {
        activeAlerts.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Documentação incompleta',
          desc: 'Garantias cadastradas, mas é altamente recomendado anexar notas fiscais e contratos.',
          actionText: 'Resolver Anexos',
          action: "window.app.switchTab('proteger'); setTimeout(() => { window.app.openProtegerDrawer('garantias'); }, 150);"
        });
      }
      
      // Alert 9 (Engine 5 / Mission 9): Pendências abertas
      const openPends = this.app.conteudosController.pendencias.filter(p => p.status === 'pendente');
      if (openPends.length > 0) {
        activeAlerts.push({
          type: 'danger',
          icon: '🔴',
          title: 'Existem itens não concluídos',
          desc: `Existem ${openPends.length} pendências abertas precisando de correção antes do aceite final.`,
          actionText: 'Resolver Pendências',
          action: "window.app.switchTab('proteger'); setTimeout(() => { window.app.openProtegerDrawer('pendencias'); }, 150);"
        });
      }
      
      // Alert 10: Descompasso Física x Financeira (if enabled)
      if (isDescompassoEnabled) {
        if (diff > 15) {
          activeAlerts.unshift({
            type: 'danger',
            icon: '🔴',
            title: 'Risco de Prejuízo Alto! (Descompasso)',
            desc: `Seu avanço financeiro (${spentPercent.toFixed(0)}%) está muito à frente da obra física entregue (${physicalProgress.toFixed(0)}%). O descompasso é de ${diff.toFixed(0)}%. Pare imediatamente de adiantar dinheiro!`,
            actionText: 'Ver Detalhes',
            action: "window.app.switchTab('prevenir')"
          });
        } else if (diff > 5) {
          activeAlerts.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Aviso de Descompasso Ligeiro',
            desc: `Você pagou (${spentPercent.toFixed(0)}%) ligeiramente mais do que a obra andou (${physicalProgress.toFixed(0)}%). Desvio de ${diff.toFixed(0)}%. Acompanhe as próximas entregas.`,
            actionText: 'Ver Detalhes',
            action: "window.app.switchTab('prevenir')"
          });
        }
      }
    }
    
    // Render the Alerts Box on Dashboard
    const mainAlertBox = document.getElementById('dash-main-alert-box');
    if (mainAlertBox) {
      if (activeAlerts.length === 0 || isConcluida) {
        mainAlertBox.style.display = 'none';
      } else {
        mainAlertBox.style.display = 'block';
        mainAlertBox.style.padding = '16px';
        mainAlertBox.style.border = '1px solid rgba(255,255,255,0.08)';
        mainAlertBox.style.background = 'rgba(15, 18, 26, 0.45)';
        
        // Sort alerts: danger first, then warning
        activeAlerts.sort((a, b) => (a.type === 'danger' ? -1 : 1) - (b.type === 'danger' ? -1 : 1));
        
        const alertHtml = activeAlerts.map((alert, index) => {
          const isCritical = alert.type === 'danger';
          const borderColor = isCritical ? 'rgba(255, 69, 58, 0.3)' : 'rgba(255, 159, 10, 0.3)';
          const bgColor = isCritical ? 'rgba(255, 69, 58, 0.02)' : 'rgba(255, 159, 10, 0.02)';
          const iconBorder = isCritical ? 'rgba(255, 69, 58, 0.4)' : 'rgba(255, 159, 10, 0.4)';
          const iconBg = isCritical ? 'rgba(255, 69, 58, 0.08)' : 'rgba(255, 159, 10, 0.08)';
          const iconColor = isCritical ? '#ff453a' : '#ff9f0a';
          const tagText = isCritical ? 'ALERTA DE SEGURANÇA' : 'AVISO DE ATENÇÃO';
          
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; border-radius: 12px; border: 1px solid ${borderColor}; background: ${bgColor}; margin-bottom: ${index < activeAlerts.length - 1 ? '10px' : '0'}; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 240px;">
                <div style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid ${iconBorder}; background: ${iconBg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${iconColor}; font-size: 16px;">
                  ${alert.icon}
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-size: 8px; font-weight: 700; color: ${iconColor}; text-transform: uppercase; letter-spacing: 0.8px;">${tagText}</span>
                  <h4 style="font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700; color: #ffffff; margin: 0;">${alert.title}</h4>
                  <p style="font-size: 10px; color: #8c96ab; margin: 0; line-height: 1.3;">${alert.desc}</p>
                </div>
              </div>
              <button onclick="${alert.action}" class="btn-bounce" style="background: transparent; border: 1px solid ${iconColor}; border-radius: 8px; color: ${iconColor}; padding: 6px 12px; font-family: 'Sora', sans-serif; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.2s ease; margin-left: auto;">
                <span>${alert.actionText}</span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          `;
        }).join('');
        
        mainAlertBox.innerHTML = `
          <div style="margin-bottom: 12px; font-size: 10px; font-weight: 700; color: #ff9f0a; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <span>⚠️ ALERTAS INTELIGENTES DO MOTOR</span>
            <span style="background: rgba(255,159,10,0.15); padding: 2px 6px; border-radius: 10px; font-size: 8px; color: #ff9f0a; border: 1px solid rgba(255,159,10,0.25);">${activeAlerts.length}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${alertHtml}
          </div>
        `;
      }
    }

    // ==========================================
    // 7. COMPATIBILITY UPDATES FOR HIDDEN ELEMENTS
    // ==========================================
    const compPaid = document.getElementById('dash-metric-paid');
    const compPaidSub = document.getElementById('dash-metric-paid-sub');
    const compPaidBar = document.getElementById('dash-metric-paid-bar');
    const compSafety = document.getElementById('dash-metric-safety');
    const compSafetySub = document.getElementById('dash-metric-safety-sub');
    const compSafetyBar = document.getElementById('dash-metric-safety-bar');
    const compCrono = document.getElementById('dash-metric-crono');
    const compCronoSub = document.getElementById('dash-metric-crono-sub');
    const compCronoBar = document.getElementById('dash-metric-crono-bar');
    const compAlerts = document.getElementById('dash-intelligent-alerts');

    if (compPaid) compPaid.textContent = this.formatCurrency(paidTotal);
    if (compPaidSub) compPaidSub.textContent = `A PAGAR ${this.formatCurrency(unpaidTotal)}`;
    if (compPaidBar) {
      const paidPct = totalRealSpent > 0 ? (paidTotal / totalRealSpent) * 100 : 0;
      compPaidBar.style.width = `${Math.min(paidPct, 100)}%`;
    }

    if (compSafety) compSafety.textContent = this.formatCurrency(marginAmount);
    if (compSafetySub) compSafetySub.textContent = `DISPONÍVEL ${this.formatCurrency(this.budget)}`;
    if (compSafetyBar) compSafetyBar.style.width = `${hasMargin ? 100 : 0}%`;

    this.app.conteudosController.updateCronograma();
    const activeCronoEnd = document.getElementById('crono-display-enddate');
    if (compCrono && activeCronoEnd) {
      compCrono.textContent = activeCronoEnd.textContent || '--/--/----';
    }
    if (compCronoSub) compCronoSub.textContent = `CONCLUSÃO ${physicalProgress.toFixed(0)}%`;
    if (compCronoBar) compCronoBar.style.width = `${Math.min(physicalProgress, 100)}%`;
    
    // Update dynamic bell badge count
    const bellBadge = document.getElementById('dash-bell-badge');
    if (bellBadge) {
      bellBadge.textContent = activeAlerts.length;
      bellBadge.style.display = activeAlerts.length > 0 ? 'flex' : 'none';
    }
    
    // Render real transactions list
    this.renderExpensesList();
    
    // Redraw Chart
    this.drawChart();
    this.renderPriorityItems();
  }

  formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  savePriorityItems() {
    localStorage.setItem('reformas_3p_priority_items', JSON.stringify(this.priorityItems));
  }

  addPriorityItem() {
    const input = document.getElementById('planejar-priority-input') || document.getElementById('dash-priority-input');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    
    const newItem = {
      id: "prio-" + Date.now(),
      text: text,
      checked: false
    };
    
    this.priorityItems.push(newItem);
    this.savePriorityItems();
    if (input) input.value = '';
    this.renderPriorityItems();
    
    // Sync priority items with Supabase if the user has sync
    if (this.app.syncPriorityItemsToSupabase) {
      this.app.syncPriorityItemsToSupabase();
    }
  }

  togglePriorityItem(id) {
    const item = this.priorityItems.find(i => i.id === id);
    if (!item) return;
    item.checked = !item.checked;
    this.savePriorityItems();
    this.renderPriorityItems();
    
    if (this.app.syncPriorityItemsToSupabase) {
      this.app.syncPriorityItemsToSupabase();
    }
  }

  deletePriorityItem(id) {
    this.priorityItems = this.priorityItems.filter(i => i.id !== id);
    this.savePriorityItems();
    this.renderPriorityItems();
    
    if (this.app.syncPriorityItemsToSupabase) {
      this.app.syncPriorityItemsToSupabase();
    }
  }

  renderPriorityItems() {
    const container = document.getElementById('planejar-priority-list') || document.getElementById('dash-priority-list');
    if (!container) return;
    
    if (!this.priorityItems || this.priorityItems.length === 0) {
      container.innerHTML = `<span style="font-size: 10px; color: #8c96ab; font-style: italic; text-align: center; margin: 10px 0; display: block;">Nenhum item prioritário adicionado.</span>`;
      return;
    }
    
    container.innerHTML = this.priorityItems.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 6px 10px; transition: background 0.2s;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; margin: 0; font-size: 11px; color: ${item.checked ? '#8c96ab' : '#ffffff'}; text-decoration: ${item.checked ? 'line-through' : 'none'}; font-weight: 500;">
          <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="window.app.financeiroController.togglePriorityItem('${item.id}')" style="accent-color: var(--primary-orange); cursor: pointer;">
          ${item.text}
        </label>
        <button onclick="window.app.financeiroController.deletePriorityItem('${item.id}')" style="background: none; border: none; color: #ff453a; font-size: 10px; cursor: pointer; padding: 2px 4px; opacity: 0.6; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">✕</button>
      </div>
    `).join('');
  }

  addQuickPriority(text) {
    if (this.priorityItems.some(item => item.text.toLowerCase() === text.toLowerCase())) {
      alert(`O item "${text}" já está na sua lista de prioridades!`);
      return;
    }
    const newItem = {
      id: 'prio_' + Date.now(),
      text: text,
      checked: false
    };
    this.priorityItems.push(newItem);
    this.savePriorityItems();
    this.renderPriorityItems();
    if (this.app.syncPriorityItemsToSupabase) {
      this.app.syncPriorityItemsToSupabase();
    }
  }

  renderPrevenirTab() {
    this.renderOrcamentoBlindadoTable();
    this.renderContratacaoTable();
    this.renderComprasSemErroTable();
    this.renderFornecedoresTable();
    this.renderPagamentosTable();
    
    // Update Resumo Financeiro labels
    const totalPlanned = this.plannedItems.reduce((sum, item) => sum + item.amount, 0);
    const paidTotal = this.getPaidTotal();
    const unpaidTotal = this.getToPayTotal();
    
    let economyTotal = 0;
    if (this.plannedItems) {
      this.plannedItems.forEach(item => {
        const itemMax = item.cost_max || item.planned_cost || item.cost || 0;
        const itemMin = item.cost_min || item.min_cost || (itemMax * 0.88);
        economyTotal += Math.max(0, itemMax - itemMin);
      });
    }
    if (economyTotal === 0 && totalPlanned > 0) {
      economyTotal = totalPlanned * 0.12;
    }
    
    const p2Previsto = document.getElementById('prevenir-previsto');
    const p2Economia = document.getElementById('prevenir-economia');
    const p2Saldo = document.getElementById('prevenir-saldo');
    const p2Pagados = document.getElementById('prevenir-pagamentos-registrados');
    
    if (p2Previsto) p2Previsto.textContent = this.formatCurrency(totalPlanned);
    if (p2Economia) p2Economia.textContent = this.formatCurrency(economyTotal);
    if (p2Saldo) p2Saldo.textContent = this.formatCurrency(unpaidTotal);
    if (p2Pagados) p2Pagados.textContent = this.formatCurrency(paidTotal);
  }

  switchPrevenirStep(stepNum, scroll = false) {
    this.activePrevenirStep = stepNum;
    
    // Highlight timeline nodes
    for (let i = 1; i <= 3; i++) {
      const node = document.getElementById(`prevenir-node-${i}`);
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
    const fill = document.getElementById('prevenir-timeline-line-fill');
    if (fill) {
      const widthPct = (stepNum - 1) * 50; // 0%, 50%, 100%
      fill.style.width = `${widthPct}%`;
    }
    
    // Smooth scroll to the specific content section if requested by user click
    if (scroll) {
      const content = document.getElementById(`prevenir-step-content-${stepNum}`);
      if (content) {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  renderOrcamentoBlindadoTable() {
    const tbody = document.getElementById('prevenir-orcamento-table-body');
    if (!tbody) return;
    
    if (this.plannedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhum item planejado ainda. Adicione itens clicando em "Adicionar item".</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.plannedItems.map(item => {
      const typeLabel = item.category === 'material' ? '🧱 Material' : '👷 Serviço';
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.financeiroController.deletePlannedItem('${item.id}'); window.app.financeiroController.renderOrcamentoBlindadoTable();">✕</button>`;
      
      return `
        <tr>
          <td><strong>${item.description}</strong></td>
          <td>Geral</td>
          <td>1</td>
          <td style="color: #32d74b; font-weight: 700;">${this.formatCurrency(item.amount)}</td>
          <td>-</td>
          <td>-</td>
          <td>${typeLabel} ${deleteBtn}</td>
        </tr>
      `;
    }).join('');
    
    const totalEl = document.getElementById('prevenir-orcamento-total');
    if (totalEl) totalEl.textContent = this.formatCurrency(this.getPlannedTotal());
  }

  parseInputCurrency(valStr) {
    if (!valStr) return 0;
    if (typeof valStr === 'number') return valStr;
    let str = String(valStr).trim();
    if (!str) return 0;
    
    str = str.replace(/[R$\s]/gi, '');
    
    if (str.includes(',')) {
      str = str.replace(/\./g, '');
      str = str.replace(',', '.');
    }
    
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  }

  saveQuote() {
    const itemEl = document.getElementById('quote-item');
    const supplierEl = document.getElementById('quote-supplier');
    const valueEl = document.getElementById('quote-value');
    const deadlineEl = document.getElementById('quote-deadline');
    const paymentEl = document.getElementById('quote-payment');
    const attachmentEl = document.getElementById('quote-attachment');
    const obsEl = document.getElementById('quote-obs');

    const item = itemEl ? itemEl.value.trim() : '';
    const supplier = supplierEl ? supplierEl.value.trim() : '';
    const value = valueEl ? this.parseInputCurrency(valueEl.value) : 0;
    const deadline = deadlineEl ? deadlineEl.value.trim() : '';
    const payment = paymentEl ? paymentEl.value.trim() : '';
    const attachment = attachmentEl ? attachmentEl.value.trim() : '';
    const obs = obsEl ? obsEl.value.trim() : '';

    if (!item || !supplier || isNaN(value) || value <= 0) {
      alert("Por favor, preencha Item, Fornecedor e Valor de Cotação válidos.");
      return;
    }

    const newQuote = {
      id: 'quote-' + Date.now(),
      item: item,
      supplier: supplier,
      value: value,
      deadline: deadline || 'Não informado',
      payment: payment || 'À vista',
      attachment: attachment || '#',
      obs: obs || ''
    };

    this.quotes.push(newQuote);
    localStorage.setItem('reformas_3p_quotes', JSON.stringify(this.quotes));
    
    if (itemEl) itemEl.value = '';
    if (supplierEl) supplierEl.value = '';
    if (valueEl) valueEl.value = '';
    if (deadlineEl) deadlineEl.value = '';
    if (paymentEl) paymentEl.value = '';
    if (attachmentEl) attachmentEl.value = '';
    if (obsEl) obsEl.value = '';

    this.renderQuotesTable();
    this.updateDashboard();

    this.app.triggerPushNotification(
      "⚖️ COTAÇÃO SALVA",
      `Cotação de "${item}" para o fornecedor "${supplier}" salva com sucesso.`,
      "success"
    );

    if (this.app.syncProfileToSupabase) {
      this.app.syncProfileToSupabase();
    }
  }

  deleteQuote(id) {
    this.quotes = this.quotes.filter(q => q.id !== id);
    localStorage.setItem('reformas_3p_quotes', JSON.stringify(this.quotes));
    this.renderQuotesTable();
    this.updateDashboard();
  }

  renderQuotesTable() {
    const tbody = document.getElementById('prevenir-quotes-tbody');
    if (!tbody) return;

    if (this.quotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma cotação cadastrada. Preencha o formulário acima.</td></tr>`;
      
      const minEl = document.getElementById('quote-metric-min');
      const maxEl = document.getElementById('quote-metric-max');
      const economyEl = document.getElementById('quote-metric-economy');
      const diffPctEl = document.getElementById('quote-metric-diff-pct');
      
      if (minEl) minEl.textContent = 'R$ 0,00';
      if (maxEl) maxEl.textContent = 'R$ 0,00';
      if (economyEl) economyEl.textContent = 'R$ 0,00';
      if (diffPctEl) diffPctEl.textContent = '0%';
      return;
    }

    const values = this.quotes.map(q => q.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const economyVal = maxVal - minVal;
    const diffPctVal = minVal > 0 ? ((maxVal - minVal) / minVal) * 100 : 0;

    const minEl = document.getElementById('quote-metric-min');
    const maxEl = document.getElementById('quote-metric-max');
    const economyEl = document.getElementById('quote-metric-economy');
    const diffPctEl = document.getElementById('quote-metric-diff-pct');

    if (minEl) minEl.textContent = this.formatCurrency(minVal);
    if (maxEl) maxEl.textContent = this.formatCurrency(maxVal);
    if (economyEl) economyEl.textContent = this.formatCurrency(economyVal);
    if (diffPctEl) diffPctEl.textContent = `${diffPctVal.toFixed(0)}%`;

    tbody.innerHTML = this.quotes.map(q => {
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.financeiroController.deleteQuote('${q.id}')">✕</button>`;
      
      const docLink = q.attachment && q.attachment !== '#'
        ? `<a href="#" onclick="alert('Visualização do anexo: ${q.attachment}'); return false;" style="color: #0088ff; text-decoration: none; font-weight: 700;">PDF 📂</a>`
        : `<span style="color: #8c96ab; font-style: italic;">Sem anexo</span>`;

      return `
        <tr>
          <td data-label="Serviço"><strong>${q.item}</strong></td>
          <td data-label="Prestador">${q.supplier}</td>
          <td data-label="Valor" style="color: #32d74b; font-weight: 700;">${this.formatCurrency(q.value)}</td>
          <td data-label="Prazo">${q.deadline}</td>
          <td data-label="Forma Pgto">${q.payment}</td>
          <td data-label="Anotações">${docLink}</td>
          <td data-label="Excluir">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  }

  renderContratacaoTable() {
    const tbody = document.getElementById('prevenir-contratacao-table-body');
    if (!tbody) return;
    
    const savedQuotesStr = localStorage.getItem('reformas_3p_quotes_saved');
    const rawQuotesDataStr = localStorage.getItem('reformas_3p_raw_quotes_data');
    
    if (!savedQuotesStr) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma cotação realizada ainda. Use a fase Decidir para comparar fornecedores!</td></tr>`;
      return;
    }
    
    try {
      const suppliers = JSON.parse(savedQuotesStr);
      const rawData = rawQuotesDataStr ? JSON.parse(rawQuotesDataStr) : {};
      const serviceName = rawData.itemName || "Serviço Geral";
      
      tbody.innerHTML = suppliers.map((sup, index) => {
        const status = index === 0 
          ? '<span style="color: #32d74b; font-weight: 700;">Recomendado ⭐</span>' 
          : '<span style="color: #8c96ab;">Comparado</span>';
        
        let riskLabel = 'Baixo (0%)';
        let riskColor = '#32d74b';
        if (sup.risk === 15) {
          riskLabel = 'Médio (15%)';
          riskColor = '#ff9f0a';
        } else if (sup.risk === 40) {
          riskLabel = 'Alto (40%)';
          riskColor = '#ff453a';
        }
        
        return `
          <tr>
            <td><strong>${sup.name}</strong></td>
            <td>${serviceName}</td>
            <td style="color: #fff; font-weight: 700;">${this.formatCurrency(sup.price)}</td>
            <td>-</td>
            <td style="color: ${riskColor}; font-weight: 600;">${riskLabel}</td>
            <td>${status}</td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error("Error rendering contratação table:", e);
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ff453a; font-size: 11px;">Erro ao carregar cotações.</td></tr>`;
    }
  }

  renderComprasSemErroTable() {
    const tbody = document.getElementById('prevenir-compras-table-body');
    if (!tbody) return;
    
    if (this.expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma compra ou pagamento registrado ainda.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.expenses.map(exp => {
      let formattedDate = exp.date;
      try {
        const d = new Date(exp.date + 'T00:00:00');
        formattedDate = d.toLocaleDateString('pt-BR');
      } catch (e) {}
      
      const catLabels = {
        'material_basico': '🧱 Mat. Básico',
        'acabamento': '✨ Acabamento',
        'mao_de_obra': '👷 Mão de Obra',
        'outros': '📦 Outros',
        'material': '🧱 Mat. Básico'
      };
      const catLabel = catLabels[exp.category] || exp.category || '-';
      
      let statusBadge = '';
      if (exp.status === 'concluido' || exp.status === 'pago') {
        statusBadge = `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">Concluído</span>`;
      } else if (exp.status === 'em_andamento') {
        statusBadge = `<span class="stats-badge" style="background: rgba(0,136,255,0.1); color: #0088ff; border: 1px solid rgba(0,136,255,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">Em andamento</span>`;
      } else {
        statusBadge = `<span class="stats-badge" style="background: rgba(255,159,10,0.1); color: var(--color-warning); border: 1px solid rgba(255,159,10,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">Planejado</span>`;
      }
      
      const isDelivered = !!exp.delivered;
      const deliveryBadge = isDelivered
        ? `<span class="stats-badge" style="background: rgba(0,136,255,0.1); color: #0088ff; border: 1px solid rgba(0,136,255,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseDelivery('${exp.id}')">Recebido ✓</span>`
        : `<span class="stats-badge" style="background: rgba(255,255,255,0.05); color: #8c96ab; border: 1px solid rgba(255,255,255,0.1); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseDelivery('${exp.id}')">Pendente ⏱️</span>`;
        
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.financeiroController.deleteExpense('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">Excluir</button>`;
      
      const prevVal = exp.plannedVal || 0;
      const realVal = exp.amount || 0;

      return `
        <tr>
          <td data-label="Item / Descrição"><strong>${exp.description}</strong></td>
          <td data-label="Categoria">${catLabel}</td>
          <td data-label="Data Compra">${formattedDate}</td>
          <td data-label="Valor Previsto" style="color: #8c96ab;">${prevVal > 0 ? this.formatCurrency(prevVal) : '-'}</td>
          <td data-label="Valor Real" style="color: #32d74b; font-weight: 700;">${realVal > 0 ? this.formatCurrency(realVal) : '-'}</td>
          <td data-label="Pago">${statusBadge}</td>
          <td data-label="Entrega">${deliveryBadge}</td>
          <td data-label="Excluir">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
    
    // Update counters
    const countTotal = document.getElementById('compras-count-total');
    const countDelivered = document.getElementById('compras-count-delivered');
    const sumPaid = document.getElementById('compras-sum-paid');
    
    if (countTotal) countTotal.textContent = `${this.expenses.length} itens`;
    if (countDelivered) {
      const deliveredCount = this.expenses.filter(e => e.delivered).length;
      countDelivered.textContent = `${deliveredCount} itens`;
    }
    if (sumPaid) {
      const sumPaidVal = this.expenses
        .filter(e => e.status === 'concluido' || e.status === 'pago')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      sumPaid.textContent = this.formatCurrency(sumPaidVal);
    }
  }

  toggleExpenseDelivery(id) {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) return;
    exp.delivered = !exp.delivered;
    this.saveExpenses();
    this.renderComprasSemErroTable();
  }

  savePilarPriority(pilarId) {
    const statusEl = document.getElementById(`pilar-status-${pilarId}`);
    const obsEl = document.getElementById(`pilar-obs-${pilarId}`);
    if (!statusEl || !obsEl) return;
    
    const saved = localStorage.getItem('reformas_3p_pilar_priorities') || '{}';
    let data = {};
    try { data = JSON.parse(saved); } catch(e) {}
    
    data[pilarId] = {
      status: statusEl.value,
      obs: obsEl.value
    };
    
    localStorage.setItem('reformas_3p_pilar_priorities', JSON.stringify(data));
    localStorage.setItem('reformas_3p_prioridades_definidas', 'true');
    this.renderDashboardCentral();
  }

  loadPilarPriorities() {
    const saved = localStorage.getItem('reformas_3p_pilar_priorities');
    if (!saved) return;
    let data = {};
    try { data = JSON.parse(saved); } catch(e) {}
    
    ['eletrica', 'hidraulica', 'estrutural', 'acabamento'].forEach(pilarId => {
      const item = data[pilarId];
      if (!item) return;
      
      const statusEl = document.getElementById(`pilar-status-${pilarId}`);
      const obsEl = document.getElementById(`pilar-obs-${pilarId}`);
      
      if (statusEl) statusEl.value = item.status || 'ok';
      if (obsEl) obsEl.value = item.obs || '';
    });
  }

  saveSupplierAprovado() {
    const name = document.getElementById('sup-name')?.value.trim();
    const contact = document.getElementById('sup-contact')?.value.trim() || '-';
    const service = document.getElementById('sup-service')?.value.trim();
    const value = parseFloat(document.getElementById('sup-value')?.value) || 0;
    const deadline = document.getElementById('sup-deadline')?.value.trim() || 'N/A';
    const contract = document.getElementById('sup-contract')?.value;
    const rating = parseInt(document.getElementById('sup-rating')?.value) || 5;
    const status = document.getElementById('sup-status')?.value || 'ativo';
    const obs = document.getElementById('sup-obs')?.value.trim();
    
    if (!name || !service) {
      alert("Por favor, preencha o nome do fornecedor e a especialidade/serviço.");
      return;
    }
    
    const newSupplier = {
      id: 'sup-aprov-' + Date.now(),
      name,
      contact,
      service,
      value,
      deadline,
      contract,
      rating,
      status,
      obs
    };
    
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('reformas_3p_suppliers_aprovados') || '[]');
    } catch(e) {}
    
    list.push(newSupplier);
    localStorage.setItem('reformas_3p_suppliers_aprovados', JSON.stringify(list));
    localStorage.setItem('reformas_3p_fornecedor_aprovado_registrado', 'true');
    
    this.renderFornecedoresTable();
    this.renderDashboardCentral();
    this.app.triggerPushNotification("👷 FORNECEDOR REGISTRADO", `Fornecedor "${name}" registrado com sucesso.`, "success");
    
    // Clear inputs
    if (document.getElementById('sup-name')) document.getElementById('sup-name').value = '';
    if (document.getElementById('sup-contact')) document.getElementById('sup-contact').value = '';
    if (document.getElementById('sup-service')) document.getElementById('sup-service').value = '';
    if (document.getElementById('sup-value')) document.getElementById('sup-value').value = '';
    if (document.getElementById('sup-deadline')) document.getElementById('sup-deadline').value = '';
    if (document.getElementById('sup-obs')) document.getElementById('sup-obs').value = '';
  }

  deleteSupplierAprovado(id) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('reformas_3p_suppliers_aprovados') || '[]');
    } catch(e) {}
    
    list = list.filter(s => s.id !== id);
    localStorage.setItem('reformas_3p_suppliers_aprovados', JSON.stringify(list));
    if (list.length === 0) {
      localStorage.removeItem('reformas_3p_fornecedor_aprovado_registrado');
    }
    
    this.renderFornecedoresTable();
    this.renderDashboardCentral();
  }

  renderFornecedoresTable() {
    const tbody = document.getElementById('prevenir-suppliers-tbody');
    if (!tbody) return;
    
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('reformas_3p_suppliers_aprovados') || '[]');
    } catch(e) {}
    
    // Calculate metrics
    const activeCount = list.filter(s => s.status === 'ativo').length;
    const avgRating = list.length > 0 
      ? (list.reduce((sum, s) => sum + (parseInt(s.rating) || 5), 0) / list.length).toFixed(1)
      : '0.0';
      
    const activeEl = document.getElementById('sup-metric-active-count');
    const ratingEl = document.getElementById('sup-metric-avg-rating');
    if (activeEl) activeEl.textContent = `${activeCount} ativos`;
    if (ratingEl) ratingEl.textContent = `${avgRating} ★`;
    
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhum fornecedor aprovado registrado ainda.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = list.map(s => {
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.financeiroController.deleteSupplierAprovado('${s.id}')">✕</button>`;
      
      const ratingStars = '★'.repeat(parseInt(s.rating) || 5) + '☆'.repeat(5 - (parseInt(s.rating) || 5));
      const statusBadge = s.status === 'ativo'
        ? `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 2px 6px;">Ativo</span>`
        : `<span class="stats-badge" style="background: rgba(255,59,48,0.1); color: var(--color-danger); border: 1px solid rgba(255,59,48,0.2); font-size: 9px; padding: 2px 6px;">Inativo</span>`;
        
      return `
        <tr>
          <td data-label="Nome"><strong>${s.name}</strong></td>
          <td data-label="Contato">${s.contact || '-'}</td>
          <td data-label="Serviço">${s.service}</td>
          <td data-label="Valor total" style="color: #fff; font-weight: 700;">${s.value > 0 ? this.formatCurrency(s.value) : '-'}</td>
          <td data-label="Contrato?">${s.contract === 'sim' ? 'Sim ✓' : 'Não ❌'}</td>
          <td data-label="Nota 3P" style="color: #ff9f0a; font-size: 9px;">${ratingStars}</td>
          <td data-label="Status">${statusBadge}</td>
          <td data-label="Excluir">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  }

  renderPagamentosTable() {
    const tbody = document.getElementById('prevenir-pagamentos-tbody');
    if (!tbody) return;
    
    // Calculate metrics
    const totalPaidVal = this.getPaidTotal();
    const totalPendingVal = this.getToPayTotal();
    
    const paidEl = document.getElementById('pag-metric-total-paid');
    const pendingEl = document.getElementById('pag-metric-total-pending');
    if (paidEl) paidEl.textContent = this.formatCurrency(totalPaidVal);
    if (pendingEl) pendingEl.textContent = this.formatCurrency(totalPendingVal);
    
    if (this.expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma despesa ou pagamento registrado. Adicione gastos em 'Controlar Compras'.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.expenses.map(exp => {
      let formattedDate = exp.date;
      try {
        const d = new Date(exp.date + 'T00:00:00');
        formattedDate = d.toLocaleDateString('pt-BR');
      } catch (e) {}
      
      const isPaid = exp.status === 'pago' || exp.status === 'concluido';
      const statusBadge = isPaid
        ? `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 4px 8px; cursor: pointer; border-radius: 4px;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderPagamentosTable();">Pago ✓</span>`
        : `<span class="stats-badge" style="background: rgba(255,159,10,0.1); color: var(--color-warning); border: 1px solid rgba(255,159,10,0.2); font-size: 9px; padding: 4px 8px; cursor: pointer; border-radius: 4px;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderPagamentosTable();">A Pagar ⏱️</span>`;
      
      return `
        <tr>
          <td data-label="Descrição"><strong>${exp.description}</strong></td>
          <td data-label="Valor (R$)" style="color: #fff; font-weight: 700;">${this.formatCurrency(exp.amount)}</td>
          <td data-label="Data Lançamento">${formattedDate}</td>
          <td data-label="Status do Pagamento">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }
}
