// ==========================================================================
// SUPABASE MODULE - PERSISTÊNCIA REAL DE DADOS NA NUVEM
// Reformas Sem Erro (Método 3P)
// ==========================================================================
// INSTRUÇÕES DE CONFIGURAÇÃO:
// 1. Acesse https://supabase.com e crie um projeto gratuito
// 2. No painel do projeto, vá em "Settings" > "API"
// 3. Copie a "Project URL" e a "anon public" key
// 4. Cole os valores nas constantes abaixo
// ==========================================================================

const SUPABASE_URL = 'https://xmawxxuuzcoyrwvbctke.supabase.co'; // ✅ Projeto: reformas-sem-erro
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtYXd4eHV1emNveXJ3dmJjdGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzI5MzEsImV4cCI6MjA5NTg0ODkzMX0.L09Fpcw6schzHvu8zifmL9dMalYfPaJupQBRYDNMJfw'; // ✅ anon key

// ==========================================================================
// SCHEMA SQL PARA EXECUTAR NO SUPABASE SQL EDITOR
// ==========================================================================
/*
-- 1. Tabela de dados da reforma por usuário
CREATE TABLE IF NOT EXISTS obras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  user_name TEXT,
  user_picture TEXT,
  reforma_type TEXT DEFAULT 'casa_toda',
  selected_environments JSONB DEFAULT '["cozinha","banheiro","sala","quarto","area_externa"]',
  investment NUMERIC DEFAULT 50000,
  budget NUMERIC DEFAULT 45000,
  pref_notifications BOOLEAN DEFAULT true,
  pref_descompasso BOOLEAN DEFAULT true,
  pref_overruns BOOLEAN DEFAULT true,
  user_tier TEXT DEFAULT 'free',
  unlocked_rooms JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de despesas reais
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'pago',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de itens planejados
CREATE TABLE IF NOT EXISTS planned_items (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de progresso dos checklists
CREATE TABLE IF NOT EXISTS tasks_progress (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  task_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, task_id)
);

-- Habilitar Row Level Security (segurança por usuário)
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso estritas baseadas no e-mail autenticado via Google JWT no Supabase Auth
CREATE POLICY "RLS Obras por Email" ON obras FOR ALL 
  USING (auth.jwt() ->> 'email' = user_email) 
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "RLS Expenses por Email" ON expenses FOR ALL 
  USING (auth.jwt() ->> 'email' = user_email) 
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "RLS Planned por Email" ON planned_items FOR ALL 
  USING (auth.jwt() ->> 'email' = user_email) 
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "RLS Tasks por Email" ON tasks_progress FOR ALL 
  USING (auth.jwt() ->> 'email' = user_email) 
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- ==========================================================================
-- SCHEMA PARA ARMAZENAMENTO DE FOTOS (SUPABASE STORAGE BUCKET: obra-photos)
-- ==========================================================================
-- 1. Criar o bucket público no painel ou via SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('obra-photos', 'obra-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de segurança do Bucket
CREATE POLICY "Leitura pública de fotos de obra" ON storage.objects
  FOR SELECT USING (bucket_id = 'obra-photos');

CREATE POLICY "Inserção de fotos pelo próprio dono" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'obra-photos' 
    AND (storage.foldername(name))[1] = auth.jwt() ->> 'email'
  );

CREATE POLICY "Exclusão de fotos pelo próprio dono" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'obra-photos' 
    AND (storage.foldername(name))[1] = auth.jwt() ->> 'email'
  );
*/

// ==========================================================================
// CLIENTE SUPABASE (via REST API direta - sem instalação de npm)
// ==========================================================================
class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.isConfigured = (
      this.url !== 'COLE_AQUI_SUA_PROJECT_URL' &&
      this.key !== 'COLE_AQUI_SUA_ANON_KEY' &&
      this.url.startsWith('https://')
    );
    
    this.accessToken = localStorage.getItem('reformas_3p_supabase_token') || null;
    
    if (!this.isConfigured) {
      console.warn('⚠️ Supabase não configurado. Usando localStorage como fallback. Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/supabase.js');
    } else {
      console.log('✅ Supabase configurado e conectado!');
    }
  }

  // Cabeçalhos padrão para todas as requisições
  _headers() {
    const authHeader = this.accessToken ? `Bearer ${this.accessToken}` : `Bearer ${this.key}`;
    return {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': authHeader,
      'Prefer': 'return=representation'
    };
  }

  // Requisição GET genérica com fallback para token expirado
  async _get(table, params = '') {
    if (!this.isConfigured) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
        method: 'GET',
        headers: this._headers()
      });
      if (res.status === 401 && this.accessToken) {
        console.warn("Token Supabase expirado (401). Removendo token e tentando novamente com a anon key...");
        this.logout();
        const retryRes = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
          method: 'GET',
          headers: this._headers()
        });
        if (!retryRes.ok) throw new Error(`GET ${table} failed after token refresh fallback: ${retryRes.status}`);
        return await retryRes.json();
      }
      if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`Supabase GET error on ${table}:`, e);
      return null;
    }
  }

  // Requisição POST (insert/upsert) com fallback para token expirado
  async _upsert(table, data) {
    if (!this.isConfigured) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...this._headers(), 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(data)
      });
      if (res.status === 401 && this.accessToken) {
        console.warn("Token Supabase expirado (401) no UPSERT. Removendo token e tentando novamente...");
        this.logout();
        const retryRes = await fetch(`${this.url}/rest/v1/${table}`, {
          method: 'POST',
          headers: { ...this._headers(), 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(data)
        });
        if (!retryRes.ok) throw new Error(`UPSERT ${table} failed after token fallback: ${retryRes.status}`);
        return await retryRes.json();
      }
      if (!res.ok) throw new Error(`UPSERT ${table} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`Supabase UPSERT error on ${table}:`, e);
      return null;
    }
  }

  // Requisição DELETE com fallback para token expirado
  async _delete(table, filter) {
    if (!this.isConfigured) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
        method: 'DELETE',
        headers: this._headers()
      });
      if (res.status === 401 && this.accessToken) {
        console.warn("Token Supabase expirado (401) no DELETE. Removendo token e tentando novamente...");
        this.logout();
        const retryRes = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
          method: 'DELETE',
          headers: this._headers()
        });
        if (!retryRes.ok) throw new Error(`DELETE ${table} failed after token fallback: ${retryRes.status}`);
        return true;
      }
      if (!res.ok) throw new Error(`DELETE ${table} failed: ${res.status}`);
      return true;
    } catch (e) {
      console.error(`Supabase DELETE error on ${table}:`, e);
      return null;
    }
  }

  // Autenticação Real via Google ID Token no Supabase Auth
  async loginWithGoogleIdToken(idToken) {
    if (!this.isConfigured) return null;
    try {
      console.log("Realizando login no Supabase Auth...");
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=id_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key
        },
        body: JSON.stringify({
          provider: 'google',
          id_token: idToken
        })
      });
      if (!res.ok) throw new Error(`Supabase Auth failed: ${res.status}`);
      const data = await res.json();
      if (data.access_token) {
        this.accessToken = data.access_token;
        localStorage.setItem('reformas_3p_supabase_token', data.access_token);
        console.log("Login no Supabase Auth realizado com sucesso!");
        return data.user;
      }
      return null;
    } catch (e) {
      console.error("Erro no Supabase Auth:", e);
      return null;
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('reformas_3p_supabase_token');
  }

  // ==========================================================================
  // OBRA / PERFIL DO USUÁRIO
  // ==========================================================================
  async saveObraProfile(userEmail, data) {
    return await this._upsert('obras', { user_email: userEmail, ...data, updated_at: new Date().toISOString() });
  }

  async loadObraProfile(userEmail) {
    const results = await this._get('obras', `user_email=eq.${encodeURIComponent(userEmail)}&limit=1`);
    return results && results.length > 0 ? results[0] : null;
  }

  async loadAllObras() {
    return await this._get('obras', 'order=created_at.desc');
  }

  // ==========================================================================
  // DESPESAS REAIS
  // ==========================================================================
  async saveExpenses(userEmail, expenses) {
    if (!this.isConfigured) return false;
    
    // Deletar todos os existentes e inserir novos (operação batch simples)
    await this._delete('expenses', `user_email=eq.${encodeURIComponent(userEmail)}`);
    
    if (expenses.length === 0) return true;
    
    const rows = expenses.map(e => ({ ...e, user_email: userEmail }));
    return await this._upsert('expenses', rows);
  }

  async loadExpenses(userEmail) {
    const results = await this._get('expenses', `user_email=eq.${encodeURIComponent(userEmail)}&order=created_at.desc`);
    if (!results) return null;
    // Remover campo user_email dos resultados
    return results.map(({ user_email, ...rest }) => rest);
  }

  // ==========================================================================
  // ITENS PLANEJADOS
  // ==========================================================================
  async savePlannedItems(userEmail, items) {
    if (!this.isConfigured) return false;
    
    await this._delete('planned_items', `user_email=eq.${encodeURIComponent(userEmail)}`);
    
    if (items.length === 0) return true;
    
    const rows = items.map(i => ({ ...i, user_email: userEmail }));
    return await this._upsert('planned_items', rows);
  }

  async loadPlannedItems(userEmail) {
    const results = await this._get('planned_items', `user_email=eq.${encodeURIComponent(userEmail)}&order=created_at.desc`);
    if (!results) return null;
    return results.map(({ user_email, ...rest }) => rest);
  }

  // ==========================================================================
  // PROGRESSO DOS CHECKLISTS (TASKS)
  // ==========================================================================
  async saveTaskProgress(userEmail, taskId, completed) {
    if (!this.isConfigured) return false;
    return await this._upsert('tasks_progress', {
      user_email: userEmail,
      task_id: taskId,
      completed: completed,
      updated_at: new Date().toISOString()
    });
  }

  async loadAllTasksProgress(userEmail) {
    const results = await this._get('tasks_progress', `user_email=eq.${encodeURIComponent(userEmail)}`);
    if (!results) return null;
    
    const progressMap = {};
    results.forEach(row => {
      if (row.completed) progressMap[row.task_id] = true;
    });
    return progressMap;
  }
}

// Instância global do cliente Supabase
const supabaseDB = new SupabaseClient();
