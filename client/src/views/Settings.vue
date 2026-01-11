<template>
  <div class="settings">
    <div class="settings-header">
      <h2>API Configuration</h2>
      <p>Configure endpoints and parameters for each search API</p>
    </div>

    <div class="settings-grid">
      <!-- Parallel API Settings -->
      <div class="settings-card parallel">
        <div class="card-header">
          <span class="api-icon">⚡</span>
          <h3>Parallel API</h3>
          <span class="status-badge" :class="{ active: parallelEnabled }">
            {{ parallelEnabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>

        <div class="setting-group">
          <label>API Endpoint</label>
          <div class="input-with-icon">
            <code class="method-badge">POST</code>
            <input v-model="parallelEndpoint" type="text" placeholder="https://api.parallel.ai/v1beta/search" />
          </div>
        </div>

        <div class="setting-group">
          <label>Max Results</label>
          <input v-model.number="parallelMaxResults" type="number" min="1" max="50" />
        </div>

        <div class="setting-group">
          <label>Max Chars Per Excerpt</label>
          <input v-model.number="parallelMaxChars" type="number" min="100" max="20000" />
        </div>

        <div class="setting-group toggle-group">
          <label>Enable Parallel API</label>
          <button class="toggle-btn" :class="{ active: parallelEnabled }" @click="parallelEnabled = !parallelEnabled">
            <span class="toggle-indicator"></span>
          </button>
        </div>

        <div class="api-docs">
          <a href="https://docs.parallel.ai" target="_blank">
            📚 View Documentation
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Exa API Settings -->
      <div class="settings-card exa">
        <div class="card-header">
          <span class="api-icon">✨</span>
          <h3>Exa API</h3>
          <span class="status-badge" :class="{ active: exaEnabled }">
            {{ exaEnabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>

        <div class="setting-group">
          <label>API Endpoint</label>
          <div class="input-with-icon">
            <code class="method-badge">POST</code>
            <input v-model="exaEndpoint" type="text" placeholder="https://api.exa.ai/search" />
          </div>
        </div>

        <div class="setting-group">
          <label>Num Results</label>
          <input v-model.number="exaNumResults" type="number" min="1" max="100" />
        </div>

        <div class="setting-group">
          <label>Search Type</label>
          <select v-model="exaSearchType">
            <option value="auto">Auto (Recommended)</option>
            <option value="neural">Neural</option>
            <option value="keyword">Keyword</option>
          </select>
        </div>

        <div class="setting-group toggle-group">
          <label>Enable Exa API</label>
          <button class="toggle-btn" :class="{ active: exaEnabled }" @click="exaEnabled = !exaEnabled">
            <span class="toggle-indicator"></span>
          </button>
        </div>

        <div class="api-docs">
          <a href="https://docs.exa.ai" target="_blank">
            📚 View Documentation
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Judge Settings -->
    <div class="settings-card judge full-width">
      <div class="card-header">
        <span class="api-icon">🧠</span>
        <h3>LLM Judge (OpenAI)</h3>
        <span class="status-badge active">GPT-4o</span>
      </div>

      <div class="judge-grid">
        <div class="setting-group">
          <label>Model</label>
          <select v-model="judgeModel">
            <option value="gpt-4o">GPT-4o (Recommended)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
          </select>
        </div>

        <div class="setting-group">
          <label>Temperature</label>
          <div class="slider-group">
            <input type="range" v-model.number="judgeTemperature" min="0" max="1" step="0.1" />
            <span class="slider-value">{{ judgeTemperature }}</span>
          </div>
        </div>
      </div>

      <div class="criteria-section">
        <h4>Evaluation Criteria</h4>
        <div class="criteria-grid">
          <div class="criteria-item">
            <span class="criteria-icon">🎯</span>
            <div class="criteria-info">
              <strong>Relevance</strong>
              <span>How well results match query intent</span>
            </div>
          </div>
          <div class="criteria-item">
            <span class="criteria-icon">⭐</span>
            <div class="criteria-info">
              <strong>Quality</strong>
              <span>Authority and usefulness of sources</span>
            </div>
          </div>
          <div class="criteria-item">
            <span class="criteria-icon">🕐</span>
            <div class="criteria-info">
              <strong>Freshness</strong>
              <span>How current the results are</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-actions">
      <button class="btn-reset" @click="resetDefaults">Reset to Defaults</button>
      <button class="btn-save" @click="saveSettings">Save Settings</button>
    </div>

    <div v-if="saved" class="save-toast">
      ✓ Settings saved successfully
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Parallel settings
      parallelEndpoint: 'https://api.parallel.ai/v1beta/search',
      parallelMaxResults: 10,
      parallelMaxChars: 5000,
      parallelEnabled: true,

      // Exa settings
      exaEndpoint: 'https://api.exa.ai/search',
      exaNumResults: 10,
      exaSearchType: 'auto',
      exaEnabled: true,

      // Judge settings
      judgeModel: 'gpt-4o',
      judgeTemperature: 0.3,

      saved: false
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    loadSettings() {
      const saved = localStorage.getItem('apiSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        Object.assign(this, settings)
      }
    },
    saveSettings() {
      const settings = {
        parallelEndpoint: this.parallelEndpoint,
        parallelMaxResults: this.parallelMaxResults,
        parallelMaxChars: this.parallelMaxChars,
        parallelEnabled: this.parallelEnabled,
        exaEndpoint: this.exaEndpoint,
        exaNumResults: this.exaNumResults,
        exaSearchType: this.exaSearchType,
        exaEnabled: this.exaEnabled,
        judgeModel: this.judgeModel,
        judgeTemperature: this.judgeTemperature
      }
      localStorage.setItem('apiSettings', JSON.stringify(settings))
      this.saved = true
      setTimeout(() => { this.saved = false }, 2000)
    },
    resetDefaults() {
      this.parallelEndpoint = 'https://api.parallel.ai/v1beta/search'
      this.parallelMaxResults = 10
      this.parallelMaxChars = 5000
      this.parallelEnabled = true
      this.exaEndpoint = 'https://api.exa.ai/search'
      this.exaNumResults = 10
      this.exaSearchType = 'auto'
      this.exaEnabled = true
      this.judgeModel = 'gpt-4o'
      this.judgeTemperature = 0.3
    }
  }
}
</script>

<style scoped>
.settings-header {
  margin-bottom: 32px;
}

.settings-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.settings-header p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.settings-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.settings-card.parallel {
  border-color: rgba(96, 165, 250, 0.2);
}

.settings-card.exa {
  border-color: rgba(244, 114, 182, 0.2);
}

.settings-card.judge {
  border-color: rgba(16, 185, 129, 0.2);
}

.settings-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.api-icon {
  font-size: 24px;
}

.card-header h3 {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.status-badge {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.setting-group input[type="text"],
.setting-group input[type="number"],
.setting-group select {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  outline: none;
  transition: all 0.2s ease;
}

.setting-group input:focus,
.setting-group select:focus {
  border-color: rgba(167, 139, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
}

.setting-group select {
  cursor: pointer;
}

.setting-group select option {
  background: #1a1a2e;
  color: #fff;
}

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-with-icon input {
  flex: 1;
}

.method-badge {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, monospace;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-group label {
  margin-bottom: 0;
}

.toggle-btn {
  position: relative;
  width: 50px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
}

.toggle-indicator {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-btn.active .toggle-indicator {
  left: 25px;
}

.api-docs {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.api-docs a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.api-docs a:hover {
  color: #a78bfa;
}

.judge-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.slider-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider-group input[type="range"] {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  -webkit-appearance: none;
}

.slider-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #fff;
}

.criteria-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.criteria-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.criteria-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.criteria-icon {
  font-size: 20px;
}

.criteria-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.criteria-info strong {
  font-size: 14px;
  color: #fff;
}

.criteria-info span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.btn-reset {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-save {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

.save-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 24px;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  font-weight: 600;
  border-radius: 10px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
