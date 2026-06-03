class ChatController {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.isThinking = false;
    this.history = [];
    
    // Nando's Personality
    this.systemInstruction = `Você é o Nando, um experiente, carismático e direto consultor de obras da Método 3P (Planejar, Prevenir, Proteger). 
Seu papel é ajudar pessoas leigas que estão fazendo reformas a não cometerem erros caros, evitar dores de cabeça com pedreiros e garantir a qualidade da obra.
Sua linguagem é amigável, profissional mas como um colega de confiança no canteiro de obras. 
Responda de forma concisa, evite respostas longas demais. Formate bem usando tópicos quando necessário.`;

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

    // Send initial greeting if empty
    if (this.history.length === 0) {
      this.addMessageToUI('nando', 'Opa, tudo bem? Sou o Nando, seu consultor da Método 3P! Qual é a sua dúvida sobre a obra hoje?');
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.chatEl.classList.add('active');
      this.fabEl.classList.add('hidden');
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
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

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
      // Chama o backend seguro na Netlify
      // Se estiver local, pega a mesma URL relativa. Em dev, a Netlify CLI roteia via /_api ou via proxy para o :9999
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: this.history,
          systemInstruction: this.systemInstruction
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
}
