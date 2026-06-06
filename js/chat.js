class ChatController {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.isThinking = false;
    this.history = [];
    
    // Nando's Personality and System Instruction base
    this.systemInstruction = `Você é o Nando, um experiente, carismático e direto consultor de obras da Método 3P (Planejar, Prevenir, Proteger). 
Seu papel é ajudar pessoas leigas que estão fazendo reformas a não cometerem erros caros, evitar dores de cabeça com pedreiros e garantir a qualidade da obra.
Sua linguagem é amigável, profissional mas como um colega de confiança no canteiro de obras. 
Responda de forma concisa, evite respostas longas demais. Formate bem usando tópicos quando necessário.

IMPORTANTE SOBRE O NOME DO USUÁRIO:
- Dirija-se SEMPRE ao usuário utilizando o nome fornecido no campo "Nome do Usuário" nas especificações de contexto abaixo.
- NUNCA assuma que o usuário se chama Cleber a menos que "Nome do Usuário" seja explicitamente "Cleber". Se o campo indicar "Sueli", chame-a de Sueli; se for "Cliente", chame de Cliente.

SOBRE COBRANÇA E DESBLOQUEIO DE AMBIENTES/PROTOCOLOS (MUITO IMPORTANTE):
- A Método 3P possui um modelo de cobrança oficial via Hotmart. NÃO existe desbloqueio gratuito de ambientes.
- Desbloquear 1 ambiente individual (Cozinha, Banheiro, Sala, Quarto ou Área Externa) com seus checklists e protocolos: R$ 97,00 (acesso vitalício offline para aquele cômodo).
- Desbloquear a Casa Completa (todos os 5 cômodos + biblioteca com todos os PDFs): R$ 297,00.
- O pagamento é seguro e processado via Hotmart (Pix, cartão, etc.).
- Se o usuário perguntar sobre preços, cobrança ou como liberar, confirme e detalhe estes valores exatos (R$ 97 por cômodo, R$ 297 a casa toda) e envie o atalho para desbloqueio: [Liberar no App](app://paywall) ou [Liberar Cômodo](app://paywall/cozinha).
- Checkout Hotmart oficial:
  - Casa Completa (R$ 297): https://pay.hotmart.com/F97813608C?checkoutMode=10
  - Cozinha (R$ 97): https://pay.hotmart.com/G102751519S
  - Banheiro (R$ 97): https://pay.hotmart.com/K102759780J
  - Quarto (R$ 97): https://pay.hotmart.com/N102760096U
  - Sala (R$ 97): https://pay.hotmart.com/X102759897L
  - Área Externa (R$ 97): https://pay.hotmart.com/Q102750818X
  
DIRECIONAMENTO E LINKS INTERNOS DO APLICATIVO:
Quando o usuário perguntar onde fica alguma coisa, como fazer um lançamento ou quiser ver um ambiente, você deve enviar um link inteligente no formato Markdown [Texto do Link](app://caminho). Isso irá levá-lo diretamente para a área solicitada:
- Dashboard principal: [Painel Principal](app://painel)
- Fase 1 • Planejar: [Fase Planejar](app://planejar)
- Fase 2 • Prevenir (Orçamentos, Cotações e Compras): [Fase Prevenir](app://prevenir)
- Fase 3 • Proteger (Checklist Final, Garantias e Relatório): [Fase Proteger](app://proteger)
- Fase • Decidir (Central de Apoio com Protocolos e Biblioteca): [Fase Decidir](app://decidir)
- Sub-abas da Fase Decidir:
  - Protocolos de Decisão/Dilemas por Ambiente: [Dilemas e Protocolos](app://decidir/dilemas)
  - Biblioteca de Guias e Estratégias (PDFs): [Biblioteca de Guias](app://decidir/biblioteca)
- Abrir diretamente o formulário de lançamento de despesa: [Lançar Nova Despesa](app://despesas)
- Ver os checklists/protocolos de um ambiente específico na Fase Planejar:
  - Cozinha: [Planejar Cozinha](app://planejar/cozinha)
  - Banheiro: [Planejar Banheiro](app://planejar/banheiro)
  - Sala: [Planejar Sala](app://planejar/sala)
  - Quarto: [Planejar Quarto](app://planejar/quarto)
  - Área Externa: [Planejar Área Externa](app://planejar/area_externa)
- Ver as decisões/dilemas de um ambiente específico na Fase Decidir (Dilemas):
  - Cozinha: [Decidir Cozinha](app://decidir/cozinha)
  - Banheiro: [Decidir Banheiro](app://decidir/banheiro)
  - Sala: [Decidir Sala](app://decidir/sala)
  - Quarto: [Decidir Quarto](app://decidir/quarto)
  - Área Externa: [Decidir Área Externa](app://decidir/area_externa)
- Abrir meu Perfil / Configurações / Upgrade: [Meu Perfil](app://profile)`;

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initUI());
    } else {
      this.initUI();
    }
  }

  initUI() {
    this.fabEl = document.getElementById('nando-fab');
    this.chatEl = document.getElementById('nando-chat-window');
    this.messagesEl = document.getElementById('nando-messages');
    this.inputEl = document.getElementById('nando-input');
    this.sendBtn = document.getElementById('nando-send-btn');
    this.closeBtn = document.getElementById('nando-close-btn');

    if (!this.fabEl || !this.chatEl) return;

    this.fabEl.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.toggleChat());
    
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.chatEl.classList.add('active');
      this.fabEl.classList.add('hidden');
      
      // Send initial greeting dynamically when first opened, using the latest resolved name!
      if (this.history.length === 0 && this.messagesEl.children.length === 0) {
        const userName = (this.app && this.app.name) ? this.app.name : "Cleber";
        this.addMessageToUI('nando', `Opa ${userName}, tudo bem? Sou o Nando, seu consultor da Método 3P! Qual é a sua dúvida sobre a obra hoje?`);
      }
      
      setTimeout(() => this.inputEl.focus(), 300);
      this.scrollToBottom();
    } else {
      this.chatEl.classList.remove('active');
      this.fabEl.classList.remove('hidden');
    }
  }

  addMessageToUI(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `nando-msg ${sender === 'nando' ? 'msg-bot' : 'msg-user'}`;
    
    // Parse very basic markdown for bold
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Parse app:// links -> replace [Text](app://path) with a link
    const appLinkRegex = /\[([^\]]+)\]\((app:\/\/[^\s)]+)\)/g;
    formattedText = formattedText.replace(appLinkRegex, (match, linkText, appUrl) => {
      return `<a href="#" class="nando-app-link" data-action="${appUrl}">${linkText}</a>`;
    });

    formattedText = formattedText.replace(/\n/g, '<br>');

    if (sender === 'nando') {
      msgDiv.innerHTML = `
        <div class="nando-avatar">
          <img src="nando.png" alt="Nando">
        </div>
        <div class="nando-bubble">${formattedText}</div>
      `;
    } else {
      msgDiv.innerHTML = `<div class="nando-bubble">${formattedText}</div>`;
    }

    // Attach click listeners to any app links inside this message
    msgDiv.querySelectorAll('.nando-app-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const action = link.getAttribute('data-action');
        this.handleAppLink(action);
      });
    });

    this.messagesEl.appendChild(msgDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messagesEl) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }

  showTyping() {
    this.isThinking = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'nando-msg msg-bot typing-indicator-wrap';
    typingDiv.id = 'nando-typing';
    typingDiv.innerHTML = `
      <div class="nando-avatar">
        <img src="nando.png" alt="Nando">
      </div>
      <div class="nando-bubble typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    this.messagesEl.appendChild(typingDiv);
    this.scrollToBottom();
  }

  removeTyping() {
    this.isThinking = false;
    const el = document.getElementById('nando-typing');
    if (el) el.remove();
  }

  async sendMessage() {
    if (this.isThinking) return;
    
    const text = this.inputEl.value.trim();
    if (!text) return;

    // UI Updates
    this.inputEl.value = '';
    this.addMessageToUI('user', text);
    this.showTyping();

    // Add to history for API
    this.history.push({ role: 'user', parts: [{ text }] });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: this.history,
          systemInstruction: this.systemInstruction + "\n\n" + this.getCurrentRenovationContext()
        })
      });

      const data = await response.json();
      this.removeTyping();

      if (!response.ok) {
        let errorMsg = 'Erro desconhecido ao falar com o Nando';
        if (data.error) {
          errorMsg = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
        }
        throw new Error(errorMsg);
      }

      const botText = data.text;
      
      // Add to history
      this.history.push({ role: 'model', parts: [{ text: botText }] });
      this.addMessageToUI('nando', botText);

    } catch (error) {
      this.removeTyping();
      this.addMessageToUI('nando', `*(Problema de conexão: ${error.message})* Tente novamente daqui a pouco!`);
      // Remove failed message from history
      this.history.pop();
    }
  }

  // FAQ chips quick action trigger
  askQuestion(questionText) {
    if (this.isThinking) return;
    this.inputEl.value = questionText;
    this.sendMessage();
  }

  // Handler for deep links inside Nando's answers
  handleAppLink(url) {
    console.log("Chat app link triggered:", url);
    if (!url.startsWith("app://")) return;
    
    const path = url.replace("app://", "").split("/");
    const primary = path[0];
    const secondary = path[1] || null;
    
    try {
      if (primary === "painel") {
        this.app.switchTab('painel');
      } else if (primary === "planejar") {
        this.app.switchTab('planejar');
        if (secondary) {
          this.app.conteudosController.selectPlanejarEnvironment(secondary);
        }
      } else if (primary === "prevenir") {
        this.app.switchTab('prevenir');
        if (secondary) {
          const stepMap = { 'orcamento': 1, 'contratacao': 2, 'compras': 3 };
          this.app.financeiroController.switchPrevenirStep(stepMap[secondary] || 1);
        }
      } else if (primary === "proteger") {
        this.app.switchTab('proteger');
        if (secondary) {
          const stepMap = { 'checklist': 1, 'garantias': 2, 'relatorio': 3 };
          this.app.conteudosController.switchProtegerStep(stepMap[secondary] || 1);
        }
      } else if (primary === "decidir") {
        this.app.switchTab('decidir');
        if (secondary) {
          if (secondary === 'biblioteca' || secondary === 'guias') {
            this.app.decisoesController.switchDecidirSubTab('biblioteca');
          } else if (secondary === 'dilemas') {
            this.app.decisoesController.switchDecidirSubTab('dilemas');
          } else {
            // Environment ID
            this.app.decisoesController.switchDecidirSubTab('dilemas');
            this.app.decisoesController.openEnvironmentProtocol(secondary);
          }
        }
      } else if (primary === "orcamento") {
        this.app.switchTab('prevenir');
        this.app.financeiroController.switchPrevenirStep(1);
      } else if (primary === "cronograma") {
        this.app.switchTab('planejar');
      } else if (primary === "cotacoes") {
        this.app.switchTab('prevenir');
        this.app.financeiroController.switchPrevenirStep(2);
      } else if (primary === "profile") {
        this.app.openProfileDrawer();
      } else if (primary === "despesas") {
        this.app.openExpenseDrawer();
      } else if (primary === "paywall") {
        if (secondary) {
          this.app.paywallController.triggerEnvironmentPurchase(secondary);
        } else {
          this.app.openProfileDrawer();
        }
      } else if (primary === "central") {
        this.app.switchTab('planejar');
      } else if (primary === "checklists" && secondary) {
        this.app.switchTab('planejar');
        this.app.conteudosController.selectPlanejarEnvironment(secondary);
      } else if (primary === "decisoes" && secondary) {
        this.app.switchTab('decidir');
        this.app.decisoesController.switchDecidirSubTab('dilemas');
        this.app.decisoesController.selectDecidirEnvironment(secondary);
      }
      
      // Auto-minimize chat window to let user see where they navigated
      this.toggleChat();
    } catch (err) {
      console.error("Error executing chat navigation link:", err);
    }
  }

  // Generates system instruction with current live state details
  getCurrentRenovationContext() {
    const app = this.app;
    if (!app) return "";

    const name = app.name || "Usuário";
    const userTier = (app.paywallController && app.paywallController.userTier) || "free";
    const unlockedRooms = (app.paywallController && app.paywallController.unlockedRooms) || [];
    
    // Financial Data
    const finance = app.financeiroController;
    let financialSummary = "Dados Financeiros indisponíveis.";
    let detailedExpensesText = "Nenhuma despesa lançada ainda.";
    let detailedPlannedText = "Nenhuma previsão lançada ainda.";

    if (finance) {
      const investment = finance.investment || 0;
      const budget = finance.budget || 0;
      const totalSpent = finance.getTotalSpent ? finance.getTotalSpent() : 0;
      const totalPaid = finance.getPaidTotal ? finance.getPaidTotal() : 0;
      const totalToPay = finance.getToPayTotal ? finance.getToPayTotal() : 0;
      const plannedTotal = finance.getPlannedTotal ? finance.getPlannedTotal() : 0;
      const budgetPercent = budget > 0 ? ((totalSpent / budget) * 100).toFixed(0) : 0;
      
      financialSummary = `
- Limite de Investimento Total: R$ ${investment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
- Teto de Gastos Planejado (90% do Investimento): R$ ${budget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
- Total Planejado (Previsões): R$ ${plannedTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
- Total Gasto Realizado (Pago + A Pagar): R$ ${totalSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${budgetPercent}% do teto)
  - Despesas Já Pagas: R$ ${totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
  - Despesas A Pagar: R$ ${totalToPay.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
- Detalhamento por Categoria (Gasto vs Limite):
  - Material Básico: R$ ${(finance.getCategorySum ? finance.getCategorySum('material') : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (Teto: R$ ${(finance.categoryBudgets?.material || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
  - Mão de Obra: R$ ${(finance.getCategorySum ? finance.getCategorySum('mao_de_obra') : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (Teto: R$ ${(finance.categoryBudgets?.mao_de_obra || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
  - Acabamento: R$ ${(finance.getCategorySum ? finance.getCategorySum('acabamento') : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (Teto: R$ ${(finance.categoryBudgets?.acabamento || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
  - Decoração: R$ ${(finance.getCategorySum ? finance.getCategorySum('decoracao') : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (Teto: R$ ${(finance.categoryBudgets?.decoracao || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
  - Extras/Emergências: R$ ${(finance.getCategorySum ? finance.getCategorySum('emergencias') : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} (Teto: R$ ${(finance.categoryBudgets?.emergencias || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;

      if (finance.expenses && finance.expenses.length > 0) {
        detailedExpensesText = finance.expenses.map(e => {
          const statusText = e.status === 'pago' ? 'Pago' : 'A Pagar';
          return `- ${e.description}: R$ ${e.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} [Status: ${statusText}, Categoria: ${e.category}, Data: ${e.date}]`;
        }).join("\n");
      }

      if (finance.plannedItems && finance.plannedItems.length > 0) {
        detailedPlannedText = finance.plannedItems.map(p => {
          return `- ${p.description}: R$ ${p.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} [Categoria: ${p.category}]`;
        }).join("\n");
      }
    }

    // Physical Progress / Checklist Data
    const conteudos = app.conteudosController;
    let physicalSummary = "Dados de checklists indisponíveis.";
    let completedTasksText = "Nenhuma tarefa concluída ainda nos checklists.";
    let pendingTasksText = "Todas as tarefas foram concluídas ou nenhum ambiente está ativo.";

    if (conteudos) {
      const overallProgress = conteudos.getOverallPhysicalProgress ? conteudos.getOverallPhysicalProgress() : 0;
      
      const envsProgress = (app.selectedEnvironments || []).map(envId => {
        const progress = conteudos.getEnvironmentProgress ? conteudos.getEnvironmentProgress(envId) : 0;
        const nameMap = {
          cozinha: "Cozinha",
          banheiro: "Banheiro",
          sala: "Sala",
          quarto: "Quarto",
          area_externa: "Área Externa"
        };
        const isLocked = app.paywallController ? app.paywallController.isEnvironmentLocked(envId) : true;
        return `  - ${nameMap[envId] || envId}: ${progress.toFixed(0)}% concluído (${isLocked ? 'Bloqueado no Free (R$ 97)' : 'Desbloqueado'})`;
      }).join("\n");

      physicalSummary = `
- Progresso Físico Geral da Obra: ${overallProgress.toFixed(0)}% concluído
- Progresso por Ambiente:
${envsProgress}`;

      // Detailed checklists mapping
      if (typeof METODO_3P_DATABASE !== 'undefined' && conteudos.tasksProgress) {
        const completedTasksList = [];
        const pendingTasksList = [];

        Object.keys(METODO_3P_DATABASE.checklists).forEach(envId => {
          const isActive = app.selectedEnvironments && app.selectedEnvironments.includes(envId);
          const env = METODO_3P_DATABASE.checklists[envId];
          const envName = env.name;
          
          ['planejar', 'prevenir', 'proteger'].forEach(phase => {
            const tasks = env[phase] || [];
            tasks.forEach(t => {
              const isDone = !!conteudos.tasksProgress[t.id];
              if (isDone) {
                completedTasksList.push(`- [Concluída] ${envName} (${phase.toUpperCase()}): ${t.title}`);
              } else if (isActive) {
                pendingTasksList.push(`- [Pendente] ${envName} (${phase.toUpperCase()}): ${t.title} - ${t.desc}`);
              }
            });
          });
        });

        if (completedTasksList.length > 0) {
          completedTasksText = completedTasksList.join("\n");
        }
        if (pendingTasksList.length > 0) {
          pendingTasksText = pendingTasksList.join("\n");
        }
      }
    }

    // Progress Synchronization Alert (Descompasso)
    let syncAlertSummary = "";
    if (finance && conteudos) {
      const totalSpent = finance.getTotalSpent ? finance.getTotalSpent() : 0;
      const budget = finance.budget || 0;
      const spentPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;
      const physicalProgress = conteudos.getOverallPhysicalProgress ? conteudos.getOverallPhysicalProgress() : 0;
      const diff = spentPercent - physicalProgress;
      
      if (diff > 15) {
        syncAlertSummary = `*ALERTA DE DESCOMPASSO CRÍTICO:* O avanço financeiro (${spentPercent.toFixed(0)}%) está muito à frente da obra física entregue (${physicalProgress.toFixed(0)}%). Há um descompasso financeiro-físico de ${diff.toFixed(0)}%. Risco alto de prejuízo ou de o pedreiro abandonar a obra pós-pagamento! O usuário deve parar de adiantar dinheiro imediatamente.`;
      } else if (diff > 5) {
        syncAlertSummary = `*ALERTA DE DESCOMPASSO MODERADO:* O avanço financeiro (${spentPercent.toFixed(0)}%) está ligeiramente à frente da obra física (${physicalProgress.toFixed(0)}%). Descompasso de ${diff.toFixed(0)}%. Recomenda-se cautela com novos adiantamentos.`;
      } else {
        syncAlertSummary = `*STATUS DO ALINHAMENTO:* Avanço financeiro (${spentPercent.toFixed(0)}%) está perfeitamente alinhado ou atrás do avanço físico (${physicalProgress.toFixed(0)}%). Situação saudável e segura.`;
      }
    }

    return `
DADOS ATUAIS DA REFORMA DE ${name.toUpperCase()} (UTILIZE ESSES DADOS PARA INFORMAR O USUÁRIO CASO ELE PERGUNTE SOBRE GASTOS, ORÇAMENTO, CRONOGRAMA, DESCOMPASSO OU ANDAMENTO DE AMBIENTES):
- Nome do Usuário: ${name}
- Tipo de Reforma: ${app.reformaType === 'casa_toda' ? 'Casa Toda' : 'Ambiente Único'}
- Tier da Conta: ${userTier === 'full_house' ? 'Casa Completa (Premium)' : userTier === 'one_room' ? '1 Cômodo Liberado' : 'Gratuito (Free Tier)'}
- Cômodos Liberados no Tier 1 Cômodo: ${unlockedRooms.join(", ") || 'Nenhum'}

--- DADOS FINANCEIROS GERAIS ---
${financialSummary}

--- LISTA DE DESPESAS LANÇADAS NO APP (REALIZADO) ---
${detailedExpensesText}

--- LISTA DE PREVISÕES ORÇAMENTÁRIAS (PLANEJADO) ---
${detailedPlannedText}

--- PROGRESSO DOS CHECKLISTS (MÉTODO 3P) ---
${physicalSummary}

--- TAREFAS JÁ CONCLUÍDAS ---
${completedTasksText}

--- TAREFAS PENDENTES DA REFORMA (CHECKLISTS TÉCNICOS) ---
${pendingTasksText}

--- ANÁLISE DE ALINHAMENTO E DESCOMPASSO ---
${syncAlertSummary}
`;
  }
}
