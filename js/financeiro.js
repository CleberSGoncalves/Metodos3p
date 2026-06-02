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

    // 1. Orçamento espelhado updates
    const dashControlAvailable = document.getElementById('dash-control-available');
    const dashControlSafety = document.getElementById('dash-control-safety');
    const dashControlMaximum = document.getElementById('dash-control-maximum');
    const dashBudgetProgressBar = document.getElementById('dash-budget-progress-bar');
    const dashProgressPercent = document.getElementById('dash-progress-percent');
    const dashProgressFill = document.getElementById('dash-progress-fill');

    // New Centro de Controle Dynamic Rows
    const dashControlPaid = document.getElementById('dash-control-paid');
    const dashControlRemaining = document.getElementById('dash-control-remaining');
    const dashFinancialProgressPct = document.getElementById('dash-financial-progress-pct');
    const dashFinancialProgressBar = document.getElementById('dash-financial-progress-bar');

    const paidTotal = this.getPaidTotal();
    const unpaidTotal = this.getToPayTotal();
    const remainingToPay = totalPlanned + unpaidTotal;

    if (dashControlAvailable) dashControlAvailable.textContent = this.formatCurrency(this.budget);
    if (dashControlSafety) dashControlSafety.textContent = this.formatCurrency(this.investment * 0.10);
    if (dashControlMaximum) dashControlMaximum.textContent = this.formatCurrency(this.investment);
    
    if (dashControlPaid) dashControlPaid.textContent = this.formatCurrency(paidTotal);
    if (dashControlRemaining) dashControlRemaining.textContent = this.formatCurrency(remainingToPay);
    
    const financialProgressPct = this.investment > 0 ? (paidTotal / this.investment) * 100 : 0;
    if (dashFinancialProgressPct) dashFinancialProgressPct.textContent = `${financialProgressPct.toFixed(0)}%`;
    if (dashFinancialProgressBar) {
      dashFinancialProgressBar.style.width = `${Math.min(financialProgressPct, 100)}%`;
    }
    
    if (dashProgressPercent) dashProgressPercent.textContent = `${spentPercent.toFixed(0)}%`;
    if (dashProgressFill) {
      dashProgressFill.style.width = `${Math.min(spentPercent, 100)}%`;
      if (totalRealSpent > this.budget) {
        dashProgressFill.style.background = "var(--color-danger)";
      } else {
        dashProgressFill.style.background = "linear-gradient(to right, #32d74b 0%, #ff9f0a 60%, #ff453a 100%)";
      }
    }

    const dashBudgetMax = document.getElementById('dash-budget-max');
    const dashBudgetSpent = document.getElementById('dash-budget-spent');
    const dashTotalPlanned = document.getElementById('dash-total-planned');
    const dashBudgetMargin = document.getElementById('dash-budget-margin');

    if (dashBudgetMax) dashBudgetMax.textContent = this.formatCurrency(this.budget);
    if (dashBudgetSpent) {
      dashBudgetSpent.textContent = this.formatCurrency(totalRealSpent);
      if (totalRealSpent > this.budget) {
        dashBudgetSpent.style.color = "var(--color-danger)";
      } else {
        dashBudgetSpent.style.color = "var(--primary-orange)";
      }
    }
    if (dashTotalPlanned) dashTotalPlanned.textContent = this.formatCurrency(totalPlanned);
    if (dashBudgetMargin) dashBudgetMargin.textContent = this.formatCurrency(this.investment * 0.10);
    if (dashBudgetProgressBar) {
      dashBudgetProgressBar.style.width = `${Math.min(spentPercent, 100)}%`;
      if (totalRealSpent > this.budget) {
        dashBudgetProgressBar.style.background = "var(--color-danger)";
      } else {
        dashBudgetProgressBar.style.background = "var(--primary-gradient)";
      }
    }

    // 2. Descompasso updates (respeitando configurações)
    const dashPBarFinance = document.getElementById('dash-p-bar-finance');
    const dashPPercentFinance = document.getElementById('dash-p-percent-finance');
    const dashPBarPhysical = document.getElementById('dash-p-bar-physical');
    const dashPPercentPhysical = document.getElementById('dash-p-percent-physical');
    const dashDescompassoBadge = document.getElementById('dash-descompasso-badge');

    if (dashPBarFinance) dashPBarFinance.style.width = `${Math.min(spentPercent, 100)}%`;
    if (dashPPercentFinance) dashPPercentFinance.textContent = `${spentPercent.toFixed(0)}%`;
    if (dashPBarPhysical) dashPBarPhysical.style.width = `${physicalProgress.toFixed(0)}%`;
    if (dashPPercentPhysical) dashPPercentPhysical.textContent = `${physicalProgress.toFixed(0)}%`;

    const isDescompassoEnabled = localStorage.getItem('reformas_3p_pref_descompasso') !== 'false';
    if (dashDescompassoBadge) {
      if (isDescompassoEnabled) {
        if (diff > 15) {
          dashDescompassoBadge.textContent = "🚨 Perigo de Prejuízo!";
          dashDescompassoBadge.className = "stats-badge danger";
        } else if (diff > 5) {
          dashDescompassoBadge.textContent = "⚠️ Atenção / Desvio";
          dashDescompassoBadge.className = "stats-badge warn";
        } else {
          dashDescompassoBadge.textContent = "✅ Sob Controle";
          dashDescompassoBadge.className = "stats-badge";
        }
      } else {
        dashDescompassoBadge.textContent = "Monitoramento Inativo";
        dashDescompassoBadge.className = "stats-badge muted";
        dashDescompassoBadge.style.background = "rgba(255,255,255,0.05)";
        dashDescompassoBadge.style.color = "var(--text-muted)";
      }
    }

    // 3. Cronograma updates (mirrored Passo 4)
    const dashCronoEnd = document.getElementById('dash-crono-end');
    const dashCronoDays = document.getElementById('dash-crono-days');
    
    // Ensure cronograma is computed to read the latest predicted date
    this.app.conteudosController.updateCronograma();
    const activeCronoEnd = document.getElementById('crono-display-enddate');
    const activeCronoDays = document.getElementById('crono-display-duration');
    
    if (dashCronoEnd) {
      dashCronoEnd.textContent = activeCronoEnd ? activeCronoEnd.textContent : "Defina a data inicial";
    }
    if (dashCronoDays) {
      dashCronoDays.textContent = activeCronoDays ? activeCronoDays.textContent : "0 dias";
    }

    // 4. Cotações updates (mirrored Passo 5)
    const s1Price = parseFloat(document.getElementById('quote-s1-price')?.value) || 0;
    const s1Risk = parseInt(document.getElementById('quote-s1-risk')?.value) || 0;
    const s1Name = document.getElementById('quote-s1-name')?.value || "Fornecedor A";
    const s2Price = parseFloat(document.getElementById('quote-s2-price')?.value) || 0;
    const s2Risk = parseInt(document.getElementById('quote-s2-risk')?.value) || 0;
    const s2Name = document.getElementById('quote-s2-name')?.value || "Fornecedor B";
    const s3Price = parseFloat(document.getElementById('quote-s3-price')?.value) || 0;
    const s3Risk = parseInt(document.getElementById('quote-s3-risk')?.value) || 0;
    const s3Name = document.getElementById('quote-s3-name')?.value || "Fornecedor C";
    
    const suppliers = [];
    if (s1Price > 0) suppliers.push({ name: s1Name, price: s1Price, risk: s1Risk });
    if (s2Price > 0) suppliers.push({ name: s2Name, price: s2Price, risk: s2Risk });
    if (s3Price > 0) suppliers.push({ name: s3Name, price: s3Price, risk: s3Risk });
    
    let quoteText = "Nenhuma cotação cadastrada";
    if (suppliers.length > 0) {
      suppliers.forEach(s => s.adjustedCost = s.price * (1 + s.risk / 100));
      suppliers.sort((a, b) => a.adjustedCost - b.adjustedCost);
      const recom = suppliers[0];
      quoteText = `🏆 ${recom.name} (${this.formatCurrency(recom.price)})`;
    }
    const dashQuotesRecom = document.getElementById('dash-quotes-recom');
    if (dashQuotesRecom) {
      dashQuotesRecom.textContent = quoteText;
      if (suppliers.length > 0) {
        dashQuotesRecom.style.color = "var(--color-success)";
      } else {
        dashQuotesRecom.style.color = "var(--text-secondary)";
      }
    }

    // 4.5. Alertas Inteligentes do Painel de Controle (Método 3P)
    const alertsContainer = document.getElementById('dash-intelligent-alerts');
    if (alertsContainer) {
      let alertsHtml = '';

      // Alert A: Orçamento Máximo
      if (totalRealSpent <= this.budget) {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(50, 215, 75, 0.1); color: #32d74b; font-size: 11px; font-weight: bold; flex-shrink: 0;">✓</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ffffff;">Orçamento sob controle</span>
              <span style="font-size: 10px; color: #8c96ab;">${this.formatCurrency(this.budget - totalRealSpent)} ainda disponíveis no teto de 90%.</span>
            </div>
          </div>
        `;
      } else {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 69, 58, 0.1); color: #ff453a; font-size: 11px; font-weight: bold; flex-shrink: 0;">🚨</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ff453a;">Limite do orçamento excedido!</span>
              <span style="font-size: 10px; color: #8c96ab;">Estourou em ${this.formatCurrency(totalRealSpent - this.budget)}! Use a margem de segurança de 10%.</span>
            </div>
          </div>
        `;
      }

      // Alert B: Organização de Pagamentos vs Planejamento
      if (this.expenses.length === 0) {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); color: #8c96ab; font-size: 11px; font-weight: bold; flex-shrink: 0;">🗓️</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ffffff;">Nenhum pagamento real</span>
              <span style="font-size: 10px; color: #8c96ab;">Registre despesas no Passo 3 para monitorar o caixa real.</span>
            </div>
          </div>
        `;
      } else if (totalPlanned > 0 && totalRealSpent > totalPlanned) {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 159, 10, 0.1); color: #ff9f0a; font-size: 11px; font-weight: bold; flex-shrink: 0;">⚠️</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ff9f0a;">Atenção com próximas despesas</span>
              <span style="font-size: 10px; color: #8c96ab;">Gasto real superou o planejado inicialmente em ${this.formatCurrency(totalRealSpent - totalPlanned)}.</span>
            </div>
          </div>
        `;
      } else {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(50, 215, 75, 0.1); color: #32d74b; font-size: 11px; font-weight: bold; flex-shrink: 0;">✓</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ffffff;">Pagamentos organizados</span>
              <span style="font-size: 10px; color: #8c96ab;">${this.expenses.length} lançamentos efetuados dentro do limite do projeto.</span>
            </div>
          </div>
        `;
      }

      // Alert C: Descompasso Física-Financeiro (Avanço físico vs financeiro)
      const isDescompassoEnabled = localStorage.getItem('reformas_3p_pref_descompasso') !== 'false';
      if (!isDescompassoEnabled) {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); color: #8c96ab; font-size: 11px; font-weight: bold; flex-shrink: 0;">⏸</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Descompasso desativado</span>
              <span style="font-size: 10px; color: #8c96ab;">Ative a análise física-financeira nas preferências do perfil.</span>
            </div>
          </div>
        `;
      } else if (diff > 15) {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 69, 58, 0.1); color: #ff453a; font-size: 11px; font-weight: bold; flex-shrink: 0;">🚨</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ff453a;">Risco de Prejuízo Alto!</span>
              <span style="font-size: 10px; color: #8c96ab;">Gasto (${spentPercent.toFixed(0)}%) muito à frente da obra física entregue (${physicalProgress.toFixed(0)}%). Desvio de ${diff.toFixed(0)}%!</span>
            </div>
          </div>
        `;
      } else if (diff > 5) {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 159, 10, 0.1); color: #ff9f0a; font-size: 11px; font-weight: bold; flex-shrink: 0;">⚠️</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ff9f0a;">Atenção: Descompasso leve</span>
              <span style="font-size: 10px; color: #8c96ab;">Desvio de ${diff.toFixed(0)}% entre avanço financeiro e físico. Monitore as entregas.</span>
            </div>
          </div>
        `;
      } else {
        alertsHtml += `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(50, 215, 75, 0.1); color: #32d74b; font-size: 11px; font-weight: bold; flex-shrink: 0;">✓</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 600; color: #ffffff;">Tudo sob controle!</span>
              <span style="font-size: 10px; color: #8c96ab;">Avanço financeiro (${spentPercent.toFixed(0)}%) alinhado ao físico (${physicalProgress.toFixed(0)}%).</span>
            </div>
          </div>
        `;
      }

      // Alert D: Alertas de Categoria e Risco de Cronograma
      const categories = ['material', 'mao_de_obra', 'acabamento', 'decoracao', 'emergencias'];
      const categoryNames = {
        material: "Materiais Básicos",
        mao_de_obra: "Mão de Obra",
        acabamento: "Acabamentos",
        decoracao: "Decoração",
        emergencias: "Emergências/Contingência"
      };
      
      categories.forEach(cat => {
        const sum = this.getCategorySum(cat);
        const limit = this.categoryBudgets[cat] || 0;
        if (limit > 0) {
          const pct = (sum / limit) * 100;
          if (pct >= 90) {
            const isOverflow = pct >= 100;
            const statusColor = isOverflow ? "#ff453a" : "#ff9f0a";
            const icon = isOverflow ? "🚨" : "⚠️";
            const title = isOverflow ? `Estouro em ${categoryNames[cat]}!` : `Limite em ${categoryNames[cat]} quase atingido`;
            
            alertsHtml += `
              <div style="display: flex; align-items: center; gap: 10px; border-left: 3px solid ${statusColor}; padding-left: 8px; margin-top: 4px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 159, 10, 0.05); color: ${statusColor}; font-size: 12px; font-weight: bold; flex-shrink: 0;">${icon}</div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; font-weight: 600; color: ${statusColor};">${title}</span>
                  <span style="font-size: 10px; color: #8c96ab; line-height: 1.3;">Gasto: ${this.formatCurrency(sum)} (${pct.toFixed(0)}% de ${this.formatCurrency(limit)}). Risco de falta de fluxo de caixa, o que causará atraso sequencial nas fases do seu <b>Cronograma</b> (Passo 4).</span>
                </div>
              </div>
            `;
          }
        }
      });

      alertsContainer.innerHTML = alertsHtml;
    }

    // 5. Escaneamento de Riscos (mirrored original tab-riscos alerts, respeitando preferências)
    const activeEnvs = this.app.selectedEnvironments;
    const tasksProgress = this.app.conteudosController.tasksProgress || {};
    const criticalRisks = this.app.conteudosController.criticalRisks || [];
    const activeRisks = criticalRisks.filter(risk => activeEnvs.includes(risk.env) && !tasksProgress[risk.id]);
    
    const risksBadgeEl = document.getElementById('dash-risks-badge');
    const risksHeadlineEl = document.getElementById('dash-risks-headline');
    const isRisksEnabled = localStorage.getItem('reformas_3p_pref_overruns') !== 'false';

    if (risksBadgeEl) {
      if (isRisksEnabled) {
        risksBadgeEl.textContent = `${activeRisks.length} ${activeRisks.length === 1 ? 'Risco' : 'Riscos'}`;
        if (activeRisks.length > 0) {
          risksBadgeEl.className = "stats-badge danger";
          if (risksHeadlineEl) {
            risksHeadlineEl.innerHTML = `⚠️ <b>Risco Crítico:</b> ${activeRisks[0].title} pendente! ${activeRisks[0].consequence}`;
          }
        } else {
          risksBadgeEl.className = "stats-badge safe";
          if (risksHeadlineEl) {
            risksHeadlineEl.textContent = "Sua obra está protegida! Nenhuma tarefa crítica de segurança está pendente nos checklists.";
          }
        }
      } else {
        risksBadgeEl.textContent = "Desativado";
        risksBadgeEl.className = "stats-badge muted";
        risksBadgeEl.style.background = "rgba(255,255,255,0.05)";
        risksBadgeEl.style.color = "var(--text-muted)";
        if (risksHeadlineEl) {
          risksHeadlineEl.textContent = "Os alertas de risco foram desativados nas configurações do perfil.";
        }
      }
    }

    // 6. Progresso Físico por Ambientes
    const dashOverallPhysicalPercent = document.getElementById('dash-overall-physical-percent');
    if (dashOverallPhysicalPercent) {
      dashOverallPhysicalPercent.textContent = `${physicalProgress.toFixed(0)}%`;
    }

    const envListEl = document.getElementById('dash-environments-progress-list');
    if (envListEl) {
      const allEnvIds = ['cozinha', 'banheiro', 'sala', 'quarto', 'area_externa'];
      
      envListEl.innerHTML = allEnvIds.map(envId => {
        if (!activeEnvs.includes(envId)) return '';
        const envData = METODO_3P_DATABASE.checklists[envId];
        const progress = this.app.conteudosController.getEnvironmentProgress(envId);
        const isLocked = this.app.paywallController.isEnvironmentLocked(envId);
        const lockText = isLocked ? ' 🔒' : '';
        
        return `
          <div style="margin-bottom: 2px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
              <span style="font-weight: 500;">${envData.emoji} ${envData.name}${lockText}</span>
              <span style="font-weight: 700; color: var(--color-success);">${progress.toFixed(0)}%</span>
            </div>
            <div class="progress-bar-container mini" style="height: 4px; background: rgba(255,255,255,0.05); margin-bottom: 4px;">
              <div class="progress-bar" style="width: ${progress}%; background: var(--color-success); height: 100%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  savePriorityItems() {
    localStorage.setItem('reformas_3p_priority_items', JSON.stringify(this.priorityItems));
  }

  addPriorityItem() {
    const input = document.getElementById('dash-priority-input');
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
    const container = document.getElementById('dash-priority-list');
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
}
