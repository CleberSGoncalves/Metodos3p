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
  init() {
    console.log("Initializing FinancialController...");
    
    // Load Investment & Budget
    const savedInvestment = localStorage.getItem('reformas_3p_investment');
    if (savedInvestment) {
      this.investment = parseFloat(savedInvestment);
      this.budget = this.investment * 0.90;
    } else {
      const savedBudget = localStorage.getItem('reformas_3p_budget');
      if (savedBudget) {
        this.budget = parseFloat(savedBudget);
        this.investment = this.budget / 0.90;
      } else {
        this.investment = 50000;
        this.budget = 45000;
      }
      localStorage.setItem('reformas_3p_investment', this.investment.toString());
      localStorage.setItem('reformas_3p_budget', this.budget.toString());
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
  addExpense(description, category, amount, date) {
    const statusEl = document.getElementById('exp-status');
    const statusVal = statusEl ? statusEl.value : 'pago';
    
    const newExpense = {
      id: "exp-" + Date.now(),
      description: description || "Gasto Geral",
      category: category,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0],
      status: statusVal
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
      newExpense.status === 'pago' ? "💰 DESPESA REGISTRADA" : "🗓️ COMPROMISSO AGENDADO",
      `"${newExpense.description}" de ${this.formatCurrency(newExpense.amount)} foi adicionado com sucesso.`,
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
    
    exp.status = exp.status === 'pago' ? 'a_pagar' : 'pago';
    this.saveExpenses();
    this.updateDashboard();
    this.app.updateProfileStats();
    
    // Sincronizar com Supabase em background
    if (this.app.syncExpensesToSupabase) {
      this.app.syncExpensesToSupabase();
    }
    
    this.app.triggerPushNotification(
      exp.status === 'pago' ? "✅ GASTO PAGO" : "🗓️ VOLTOU PARA A PAGAR",
      `O status de "${exp.description}" foi alterado para ${exp.status === 'pago' ? 'Pago' : 'A Pagar'}.`,
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
    const totalSpentPercent = (totalSpent / this.budget) * 100;
    
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
    const spentPercent = (totalRealSpent / this.budget) * 100;
    
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
    if (pBarPhysical) pBarPhysical.style.width = `${physicalProgress.toFixed(0)}%`;
    if (pPercentPhysical) pPercentPhysical.textContent = `${physicalProgress.toFixed(0)}%`;
    
    if (syncAlert && syncMsg) {
      const diff = spentPercent - physicalProgress;
      
      if (diff > 15) {
        syncAlert.className = "progress-warning-alert danger";
        syncAlert.querySelector('.alert-icon').textContent = "🚨";
        syncMsg.innerHTML = `<strong>Risco de Prejuízo Alto!</strong> Seu avanço financeiro (${spentPercent.toFixed(0)}%) está muito à frente da obra física entregue (${physicalProgress.toFixed(0)}%). O descompasso é de <b>${diff.toFixed(0)}%</b>. Pare imediatamente de adiantar dinheiro ao pedreiro!`;
      } else if (diff > 5) {
        syncAlert.className = "progress-warning-alert warn";
        syncAlert.querySelector('.alert-icon').textContent = "⚠️";
        syncMsg.innerHTML = `<strong>Aviso de Atenção!</strong> Você pagou (${spentPercent.toFixed(0)}%) ligeiramente mais do que a obra andou (${physicalProgress.toFixed(0)}%). O descompasso é de <b>${diff.toFixed(0)}%</b>. Acompanhe as próximas entregas.`;
      } else {
        syncAlert.className = "progress-warning-alert safe";
        syncAlert.querySelector('.alert-icon').textContent = "✅";
        syncMsg.innerHTML = `<strong>Tudo sob controle!</strong> Seu avanço financeiro (${spentPercent.toFixed(0)}%) está perfeitamente alinhado com o progresso físico da sua obra (${physicalProgress.toFixed(0)}%).`;
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
    const spentPercent = (totalRealSpent / this.budget) * 100 || 0;
    const physicalProgress = this.app.conteudosController.getOverallPhysicalProgress() || 0;
    const diff = spentPercent - physicalProgress;
    const paidTotal = this.getPaidTotal();
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
    
    let statusText = "NO CONTROLE";
    let statusColor = "#32d74b";
    
    if (!isDescompassoEnabled) {
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
    } else if (diff > 15) {
      statusText = "RISCO";
      statusColor = "#ff453a";
      if (statusTitle) statusTitle.textContent = "RISCO";
      if (statusTitle) statusTitle.style.color = "#ff453a";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(255, 69, 58, 0.4)";
        statusCard.style.boxShadow = "0 8px 32px rgba(255, 69, 58, 0.06)";
      }
      if (statusDesc) statusDesc.textContent = "Gasto financeiro muito acima do avanço físico!";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        statusIconContainer.style.background = "rgba(255, 69, 58, 0.12)";
        statusIconContainer.style.borderColor = "#ff453a";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #ff453a; display: inline-block;"></span> RISCO`;
      }
    } else if (diff > 5 || totalRealSpent > this.budget) {
      statusText = "ATENÇÃO";
      statusColor = "#ff9f0a";
      if (statusTitle) statusTitle.textContent = "ATENÇÃO";
      if (statusTitle) statusTitle.style.color = "#ff9f0a";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(255, 159, 10, 0.4)";
        statusCard.style.boxShadow = "0 8px 32px rgba(255, 159, 10, 0.06)";
      }
      if (statusDesc) statusDesc.textContent = "Pequeno descompasso identificado na obra.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        statusIconContainer.style.background = "rgba(255, 159, 10, 0.12)";
        statusIconContainer.style.borderColor = "#ff9f0a";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #ff9f0a; display: inline-block;"></span> ATENÇÃO`;
      }
    } else {
      statusText = "NO CONTROLE";
      statusColor = "#32d74b";
      if (statusTitle) statusTitle.textContent = "NO CONTROLE";
      if (statusTitle) statusTitle.style.color = "#32d74b";
      if (statusCard) {
        statusCard.style.borderColor = "rgba(50, 215, 75, 0.25)";
        statusCard.style.boxShadow = "0 8px 32px rgba(50, 215, 75, 0.05)";
      }
      if (statusDesc) statusDesc.textContent = "Tudo dentro do planejado.";
      if (statusIconContainer) {
        statusIconContainer.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#32d74b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        statusIconContainer.style.background = "rgba(50, 215, 75, 0.12)";
        statusIconContainer.style.borderColor = "#32d74b";
      }
      if (statusPill) {
        statusPill.innerHTML = `<span class="pill-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #32d74b; display: inline-block;"></span> NO CONTROLE`;
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
    
    if (metricBudget) {
      metricBudget.textContent = this.formatCurrency(this.budget);
    }
    if (metricExecuted) {
      metricExecuted.textContent = this.formatCurrency(totalRealSpent);
    }
    if (metricExecutedPct) {
      metricExecutedPct.textContent = `${spentPercent.toFixed(1)}% do total`;
    }
    if (metricToPay) {
      metricToPay.textContent = this.formatCurrency(unpaidTotal);
    }
    if (metricToPayPct) {
      const topayPct = this.budget > 0 ? (unpaidTotal / this.budget) * 100 : 0;
      metricToPayPct.textContent = `${topayPct.toFixed(1)}% do total`;
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
    // 4. DYNAMIC RECOMMENDED ACTION CARD
    // ==========================================
    const actionTitle = document.getElementById('dash-action-title');
    const actionDesc = document.getElementById('dash-action-desc');
    const actionBtn = document.getElementById('dash-action-btn');
    const hasFinishedSetup = localStorage.getItem('reformas_3p_onboarding_finished') === 'true';

    if (actionTitle && actionDesc && actionBtn) {
      if (!hasFinishedSetup || this.investment <= 0) {
        actionTitle.textContent = "Estipular verba da reforma";
        actionDesc.textContent = "Insira seu investimento total disponível e defina sua margem de segurança de 10%.";
        actionBtn.setAttribute('onclick', "window.app.switchTab('orcamento'); window.app.financeiroController.switchSubTab('projeto');");
      } else if (totalPlanned === 0) {
        actionTitle.textContent = "Planejar orçamento detalhado";
        actionDesc.textContent = "Cadastre materiais e mão de obra no Passo 2 do Planejamento para blindar seu orçamento.";
        actionBtn.setAttribute('onclick', "window.app.switchTab('orcamento'); window.app.financeiroController.switchSubTab('detalhado');");
      } else if (this.expenses.length === 0) {
        actionTitle.textContent = "Lançar seu primeiro gasto real";
        actionDesc.textContent = "Registre o sinal ou materiais já pagos no Passo 3 do Financeiro para gerenciar o caixa.";
        actionBtn.setAttribute('onclick', "window.app.switchTab('orcamento'); window.app.financeiroController.switchSubTab('pagamentos');");
      } else if (physicalProgress < 100) {
        actionTitle.textContent = "Aplicar Checklists por Ambiente";
        actionDesc.textContent = "Conclua e confira os checklists técnicos para prevenir retrabalhos hidráulicos e elétricos.";
        actionBtn.setAttribute('onclick', "window.app.switchTab('central'); window.app.switchCentralSection('checklists');");
      } else {
        actionTitle.textContent = "Revisar Manuais e Guias 3P";
        actionDesc.textContent = "Acesse a Biblioteca Offline para garantir a conformidade final da sua entrega de chaves.";
        actionBtn.setAttribute('onclick', "window.app.switchTab('central'); window.app.switchCentralSection('biblioteca');");
      }
    }


    // ==========================================
    // 5. 3P PHASES DYNAMIC PROGRESS BARS & TAB METRICS
    // ==========================================
    const planejarProgress = this.app.conteudosController.getPhaseProgress('planejar') || 0;
    const prevenirProgress = this.app.conteudosController.getPhaseProgress('prevenir') || 0;
    const protegerProgress = this.app.conteudosController.getPhaseProgress('proteger') || 0;

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
    const p1DisponivelVerba = document.getElementById('planejar-disponivel-verba');
    const p1PrevistoVerba = document.getElementById('planejar-previsto-verba');
    const p1PrevistoVerbaPct = document.getElementById('planejar-previsto-verba-pct');
    
    if (p1TotalVerba) p1TotalVerba.textContent = this.formatCurrency(this.investment);
    if (p1MargemVerba) p1MargemVerba.textContent = this.formatCurrency(this.investment * 0.1);
    if (p1DisponivelVerba) p1DisponivelVerba.textContent = this.formatCurrency(this.budget);
    if (p1PrevistoVerba) p1PrevistoVerba.textContent = this.formatCurrency(totalPlanned);
    if (p1PrevistoVerbaPct) {
      const pctMax = this.investment > 0 ? (totalPlanned / this.investment) * 100 : 0;
      p1PrevistoVerbaPct.textContent = `${pctMax.toFixed(0)}% do máximo`;
    }
    
    // Prevenir tab values
    const p2Disponivel = document.getElementById('prevenir-disponivel');
    const p2Previsto = document.getElementById('prevenir-previsto');
    const p2PrevistoPct = document.getElementById('prevenir-previsto-pct');
    const p2Pago = document.getElementById('prevenir-pago');
    const p2PagoPct = document.getElementById('prevenir-pago-pct');
    const p2Saldo = document.getElementById('prevenir-saldo');
    const p2SaldoPct = document.getElementById('prevenir-saldo-pct');
    
    if (p2Disponivel) p2Disponivel.textContent = this.formatCurrency(this.budget);
    if (p2Previsto) p2Previsto.textContent = this.formatCurrency(totalPlanned);
    if (p2PrevistoPct) {
      const pctDisp = this.budget > 0 ? (totalPlanned / this.budget) * 100 : 0;
      p2PrevistoPct.textContent = `${pctDisp.toFixed(0)}% do disponível`;
    }
    if (p2Pago) p2Pago.textContent = this.formatCurrency(paidTotal);
    if (p2PagoPct) {
      const pctPago = totalPlanned > 0 ? (paidTotal / totalPlanned) * 100 : 0;
      p2PagoPct.textContent = `${pctPago.toFixed(0)}% do previsto`;
    }
    if (p2Saldo) p2Saldo.textContent = this.formatCurrency(unpaidTotal);
    if (p2SaldoPct) {
      const pctSaldo = totalPlanned > 0 ? (unpaidTotal / totalPlanned) * 100 : 0;
      p2SaldoPct.textContent = `${pctSaldo.toFixed(0)}% do previsto`;
    }

    // ==========================================
    // 6. MAIN DYNAMIC ALERT BOX (DESCOMPASSO)
    // ==========================================
    const mainAlertBox = document.getElementById('dash-main-alert-box');
    const alertTitle = document.getElementById('dash-alert-title');
    const alertDesc = document.getElementById('dash-alert-desc');
    let bellWarningsCount = 0;

    if (mainAlertBox) {
      if (isDescompassoEnabled && diff > 15) {
        mainAlertBox.style.display = 'flex';
        bellWarningsCount++;
        if (alertTitle) alertTitle.textContent = "Avanço físico muito abaixo do esperado";
        if (alertDesc) {
          alertDesc.innerHTML = `Você pagou <strong style="color: #ffffff;">${spentPercent.toFixed(0)}%</strong> da reforma, mas a conclusão física é de apenas <strong style="color: #ffffff;">${physicalProgress.toFixed(0)}%</strong>. Desvio crítico de <span style="color: #ff453a; font-weight: 700;">${diff.toFixed(0)}%</span>!`;
        }
      } else if (isDescompassoEnabled && diff > 5) {
        mainAlertBox.style.display = 'flex';
        bellWarningsCount++;
        if (alertTitle) alertTitle.textContent = "Descompasso leve identificado";
        if (alertDesc) {
          alertDesc.innerHTML = `Você pagou <strong style="color: #ffffff;">${spentPercent.toFixed(0)}%</strong> da reforma, mas a conclusão física é de <strong style="color: #ffffff;">${physicalProgress.toFixed(0)}%</strong>. Monitore as entregas físicas.`;
        }
      } else if (isDescompassoEnabled && totalRealSpent > this.budget) {
        mainAlertBox.style.display = 'flex';
        bellWarningsCount++;
        if (alertTitle) alertTitle.textContent = "Limite máximo do orçamento excedido";
        if (alertDesc) {
          alertDesc.innerHTML = `Suas despesas ultrapassaram o teto máximo estipulado de <strong style="color: #ffffff;">${this.formatCurrency(this.budget)}</strong> em <span style="color: #ff453a; font-weight: 700;">${this.formatCurrency(totalRealSpent - this.budget)}</span>.`;
        }
      } else {
        mainAlertBox.style.display = 'none';
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

    const safetyMargin = this.investment * 0.10;
    const consumedMargin = Math.max(0, totalRealSpent - this.budget);
    const availableMargin = Math.max(0, safetyMargin - consumedMargin);
    const marginPercent = safetyMargin > 0 ? (availableMargin / safetyMargin) * 100 : 100;
    if (compSafety) compSafety.textContent = this.formatCurrency(safetyMargin);
    if (compSafetySub) compSafetySub.textContent = `DISPONÍVEL ${this.formatCurrency(availableMargin)} (${marginPercent.toFixed(0)}%)`;
    if (compSafetyBar) compSafetyBar.style.width = `${Math.min(marginPercent, 100)}%`;

    this.app.conteudosController.updateCronograma();
    const activeCronoEnd = document.getElementById('crono-display-enddate');
    if (compCrono && activeCronoEnd) {
      compCrono.textContent = activeCronoEnd.textContent || '--/--/----';
    }
    if (compCronoSub) compCronoSub.textContent = `CONCLUSÃO ${physicalProgress.toFixed(0)}%`;
    if (compCronoBar) compCronoBar.style.width = `${Math.min(physicalProgress, 100)}%`;

    // Warnings counts
    if (totalRealSpent > this.budget) bellWarningsCount++;
    if (this.expenses.length > 0 && totalRealSpent > totalPlanned) bellWarningsCount++;
    
    // Scan risks
    const activeEnvs = this.app.selectedEnvironments || [];
    const tasksProgress = this.app.conteudosController.tasksProgress || {};
    const criticalRisks = this.app.conteudosController.criticalRisks || [];
    const activeRisks = criticalRisks.filter(risk => activeEnvs.includes(risk.env) && !tasksProgress[risk.id]);
    const isRisksEnabled = localStorage.getItem('reformas_3p_pref_overruns') !== 'false';
    if (isRisksEnabled && activeRisks.length > 0) {
      bellWarningsCount += activeRisks.length;
    }
    
    // Update dynamic bell badge count
    const bellBadge = document.getElementById('dash-bell-badge');
    if (bellBadge) {
      bellBadge.textContent = bellWarningsCount;
      bellBadge.style.display = bellWarningsCount > 0 ? 'flex' : 'none';
    }
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #8c96ab; font-size: 11px;">Nenhuma compra ou pagamento registrado ainda.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = this.expenses.map(exp => {
      let formattedDate = exp.date;
      try {
        const d = new Date(exp.date + 'T00:00:00');
        formattedDate = d.toLocaleDateString('pt-BR');
      } catch (e) {}
      
      const isPaid = exp.status === 'pago';
      const statusBadge = isPaid
        ? `<span class="stats-badge" style="background: rgba(38,208,124,0.1); color: var(--color-success); border: 1px solid rgba(38,208,124,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">Pago</span>`
        : `<span class="stats-badge" style="background: rgba(255,159,10,0.1); color: var(--color-warning); border: 1px solid rgba(255,159,10,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseStatus('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">A Pagar</span>`;
      
      const isDelivered = !!exp.delivered;
      const deliveryBadge = isDelivered
        ? `<span class="stats-badge" style="background: rgba(0,136,255,0.1); color: #0088ff; border: 1px solid rgba(0,136,255,0.2); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseDelivery('${exp.id}')">Recebido ✓</span>`
        : `<span class="stats-badge" style="background: rgba(255,255,255,0.05); color: #8c96ab; border: 1px solid rgba(255,255,255,0.1); font-size: 9px; padding: 2px 6px; cursor: pointer;" onclick="window.app.financeiroController.toggleExpenseDelivery('${exp.id}')">Pendente ⏱️</span>`;
        
      const deleteBtn = `<button class="btn btn-secondary btn-mini" style="padding: 2px 6px; color: var(--color-danger); border: none; background: rgba(255, 59, 48, 0.05); cursor: pointer;" onclick="window.app.financeiroController.deleteExpense('${exp.id}'); window.app.financeiroController.renderComprasSemErroTable();">Excluir</button>`;
      
      return `
        <tr>
          <td><strong>${exp.description}</strong></td>
          <td>-</td>
          <td>${formattedDate}</td>
          <td style="color: #fff; font-weight: 700;">${this.formatCurrency(exp.amount)}</td>
          <td>${statusBadge}</td>
          <td>${deliveryBadge}</td>
          <td>${deleteBtn}</td>
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
    if (sumPaid) sumPaid.textContent = this.formatCurrency(this.getPaidTotal());
  }

  toggleExpenseDelivery(id) {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) return;
    exp.delivered = !exp.delivered;
    this.saveExpenses();
    this.renderComprasSemErroTable();
  }
}
