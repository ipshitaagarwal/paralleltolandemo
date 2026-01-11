<template>
  <div class="single-query">
    <!-- Search Input -->
    <div class="search-section">
      <div class="search-box">
        <div class="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          v-model="query"
          type="text"
          placeholder="Enter a search query to compare APIs..."
          @keyup.enter="runSearch"
          :disabled="loading"
        />
        <button @click="runSearch" :disabled="loading || !query.trim()" class="search-btn">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Compare</span>
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Results Container -->
    <div v-if="results" class="results-container">
      <!-- Query Header with Judge Button -->
      <div class="query-header">
        <div class="query-info">
          <span class="query-label">Query</span>
          <h2>"{{ searchedQuery }}"</h2>
        </div>
        <button @click="runJudge" :disabled="judging" class="judge-btn">
          <span v-if="judging" class="spinner small"></span>
          <span v-else class="judge-icon">🧠</span>
          {{ judging ? 'Analyzing...' : judgment ? 'Re-Judge with GPT-4o' : 'Judge with GPT-4o' }}
        </button>
      </div>

      <!-- Judgment Panel -->
      <div v-if="judgment" class="judgment-panel">
        <div class="judgment-header">
          <h3>AI Judgment</h3>
          <div class="winner-badge" :class="judgment.winner">
            <span class="trophy" v-if="judgment.winner !== 'tie'">🏆</span>
            {{ judgment.winner === 'tie' ? 'It\'s a Tie!' : judgment.winner.charAt(0).toUpperCase() + judgment.winner.slice(1) + ' Wins' }}
          </div>
        </div>

        <div class="scoring-formula">
          <b>Scoring:</b> Latency 25% + Cost 25% + Accuracy 50%
        </div>

        <div class="scores-grid three-col">
          <div class="score-card parallel" :class="{ winner: judgment.winner === 'parallel' }">
            <div class="score-header">
              <span class="api-icon">⚡</span>
              <span class="api-name">Parallel</span>
              <span class="total-score">{{ judgment.parallel.total }}/10</span>
            </div>
            <div class="metrics-raw">
              <span>{{ judgment.parallel.latency }}ms</span>
              <span>${{ judgment.parallel.cost.toFixed(4) }}</span>
            </div>
            <div class="score-bars">
              <div class="score-row">
                <span class="score-label">⏱️ Latency</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill" :style="{ width: (judgment.parallel.latencyScore * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.parallel.latencyScore }}</span>
              </div>
              <div class="score-row">
                <span class="score-label">💰 Cost</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill" :style="{ width: (judgment.parallel.costScore * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.parallel.costScore }}</span>
              </div>
              <div class="score-row">
                <span class="score-label">🎯 Accuracy</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill" :style="{ width: (judgment.parallel.accuracy * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.parallel.accuracy }}</span>
              </div>
            </div>
            <p class="reasoning">{{ judgment.parallel.reasoning }}</p>
          </div>

          <div class="score-card openai" :class="{ winner: judgment.winner === 'openai' }">
            <div class="score-header">
              <span class="api-icon">🌐</span>
              <span class="api-name">OpenAI</span>
              <span class="total-score">{{ judgment.openai.total }}/10</span>
            </div>
            <div class="metrics-raw">
              <span>{{ judgment.openai.latency }}ms</span>
              <span>${{ judgment.openai.cost.toFixed(4) }}</span>
            </div>
            <div class="score-bars">
              <div class="score-row">
                <span class="score-label">⏱️ Latency</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill openai" :style="{ width: (judgment.openai.latencyScore * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.openai.latencyScore }}</span>
              </div>
              <div class="score-row">
                <span class="score-label">💰 Cost</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill openai" :style="{ width: (judgment.openai.costScore * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.openai.costScore }}</span>
              </div>
              <div class="score-row">
                <span class="score-label">🎯 Accuracy</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill openai" :style="{ width: (judgment.openai.accuracy * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.openai.accuracy }}</span>
              </div>
            </div>
            <p class="reasoning">{{ judgment.openai.reasoning }}</p>
          </div>

          <div class="score-card exa" :class="{ winner: judgment.winner === 'exa' }">
            <div class="score-header">
              <span class="api-icon">✨</span>
              <span class="api-name">Exa</span>
              <span class="total-score">{{ judgment.exa.total }}/10</span>
            </div>
            <div class="metrics-raw">
              <span>{{ judgment.exa.latency }}ms</span>
              <span>${{ judgment.exa.cost.toFixed(4) }}</span>
            </div>
            <div class="score-bars">
              <div class="score-row">
                <span class="score-label">⏱️ Latency</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill exa" :style="{ width: (judgment.exa.latencyScore * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.exa.latencyScore }}</span>
              </div>
              <div class="score-row">
                <span class="score-label">💰 Cost</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill exa" :style="{ width: (judgment.exa.costScore * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.exa.costScore }}</span>
              </div>
              <div class="score-row">
                <span class="score-label">🎯 Accuracy</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill exa" :style="{ width: (judgment.exa.accuracy * 10) + '%' }"></div>
                </div>
                <span class="score-value">{{ judgment.exa.accuracy }}</span>
              </div>
            </div>
            <p class="reasoning">{{ judgment.exa.reasoning }}</p>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="results-grid three-col">
        <!-- Parallel Results Column -->
        <div class="result-column">
          <div class="column-header parallel">
            <div class="api-info">
              <span class="api-badge">⚡ PARALLEL</span>
              <span class="result-count">{{ results.parallel.results.length }} results</span>
            </div>
            <div class="endpoint-info">
              <code>POST api.parallel.ai/v1beta/search</code>
            </div>
          </div>

          <div v-if="results.parallel.error" class="api-error">
            <span>⚠️</span> {{ results.parallel.error }}
          </div>

          <div v-else class="result-list">
            <div v-for="(result, i) in results.parallel.results.slice(0, 5)" :key="i" class="result-item">
              <div class="result-rank">#{{ i + 1 }}</div>
              <div class="result-content">
                <a :href="result.url" target="_blank" class="result-title">
                  {{ result.title || 'Untitled' }}
                </a>
                <div class="result-url" :title="result.url">{{ result.url }}</div>
                <p class="result-excerpt">{{ truncate(result.excerpt, 150) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Exa Results Column -->
        <div class="result-column">
          <div class="column-header exa">
            <div class="api-info">
              <span class="api-badge">✨ EXA</span>
              <span class="result-count">{{ results.exa.results.length }} results</span>
            </div>
            <div class="endpoint-info">
              <code>POST api.exa.ai/search</code>
            </div>
          </div>

          <div v-if="results.exa.error" class="api-error">
            <span>⚠️</span> {{ results.exa.error }}
          </div>

          <div v-else class="result-list">
            <div v-for="(result, i) in results.exa.results.slice(0, 5)" :key="i" class="result-item">
              <div class="result-rank">#{{ i + 1 }}</div>
              <div class="result-content">
                <a :href="result.url" target="_blank" class="result-title">
                  {{ result.title || 'Untitled' }}
                </a>
                <div class="result-url" :title="result.url">{{ result.url }}</div>
                <p class="result-excerpt">{{ truncate(result.excerpt, 150) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- OpenAI Results Column -->
        <div class="result-column">
          <div class="column-header openai">
            <div class="api-info">
              <span class="api-badge">🌐 OPENAI</span>
              <span class="result-count">{{ results.openai.results.length }} results</span>
            </div>
            <div class="endpoint-info">
              <code>web_search_preview tool</code>
            </div>
          </div>

          <div v-if="results.openai.error" class="api-error">
            <span>⚠️</span> {{ results.openai.error }}
          </div>

          <div v-else class="result-list">
            <div v-for="(result, i) in results.openai.results.slice(0, 5)" :key="i" class="result-item">
              <div class="result-rank">#{{ i + 1 }}</div>
              <div class="result-content">
                <a :href="result.url" target="_blank" class="result-title">
                  {{ result.title || 'Untitled' }}
                </a>
                <div class="result-url" :title="result.url">{{ result.url }}</div>
                <p class="result-excerpt">{{ truncate(result.excerpt, 150) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>Ready to Compare</h3>
      <p>Enter a search query to compare all three search APIs.</p>
      <div class="api-cards three-col">
        <div class="api-card parallel">
          <span class="card-icon">⚡</span>
          <h4>Parallel API</h4>
          <code>api.parallel.ai</code>
          <p>Semantic search with objectives</p>
        </div>
        <div class="api-card exa">
          <span class="card-icon">✨</span>
          <h4>Exa API</h4>
          <code>api.exa.ai</code>
          <p>Neural search engine</p>
        </div>
        <div class="api-card openai">
          <span class="card-icon">🌐</span>
          <h4>OpenAI Search</h4>
          <code>web_search_preview</code>
          <p>GPT-4o with web access</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
      searchedQuery: '',
      results: null,
      judgment: null,
      loading: false,
      judging: false,
      error: null
    }
  },
  computed: {},
  methods: {
    async runSearch() {
      if (!this.query.trim()) return

      this.loading = true
      this.error = null
      this.results = null
      this.judgment = null
      this.searchedQuery = this.query

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: this.query, numResults: 10 })
        })

        if (!res.ok) throw new Error('Search failed')
        this.results = await res.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async runJudge() {
      if (!this.results) return

      this.judging = true

      try {
        const res = await fetch('/api/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: this.searchedQuery,
            parallelResults: this.results.parallel,
            exaResults: this.results.exa,
            openaiResults: this.results.openai
          })
        })

        if (!res.ok) throw new Error('Judging failed')
        this.judgment = await res.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.judging = false
      }
    },
    truncate(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
/* Search Section */
.search-section {
  margin-bottom: 28px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 6px 6px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: rgba(167, 139, 250, 0.5);
  box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.1);
}

.search-icon {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  padding: 14px 0;
  font-size: 16px;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 14px;
  height: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #fca5a5;
  margin-bottom: 20px;
}

/* Query Header */
.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.query-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.query-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
}

.query-info h2 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.judge-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1));
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.judge-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(52, 211, 153, 0.2));
  transform: translateY(-1px);
}

.judge-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.judge-icon {
  font-size: 16px;
}

/* Judgment Panel */
.judgment-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 28px;
}

.judgment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.judgment-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.winner-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.winner-badge.parallel {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.winner-badge.exa {
  background: rgba(244, 114, 182, 0.2);
  color: #f472b6;
  border: 1px solid rgba(244, 114, 182, 0.3);
}

.winner-badge.tie {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.winner-badge.openai {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.scoring-formula {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.scoring-formula b {
  color: rgba(255, 255, 255, 0.7);
}

.metrics-raw {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', Monaco, monospace;
  margin-bottom: 12px;
}

.scores-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.score-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.score-card.parallel.winner {
  background: rgba(96, 165, 250, 0.08);
  border-color: rgba(96, 165, 250, 0.3);
}

.score-card.exa.winner {
  background: rgba(244, 114, 182, 0.08);
  border-color: rgba(244, 114, 182, 0.3);
}

.score-card.openai.winner {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.score-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.api-icon {
  font-size: 18px;
}

.api-name {
  font-weight: 600;
  color: #fff;
  flex: 1;
}

.total-score {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.score-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-label {
  width: 80px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.score-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.score-bar-fill.exa {
  background: linear-gradient(90deg, #f472b6, #a78bfa);
}

.score-bar-fill.openai {
  background: linear-gradient(90deg, #34d399, #60a5fa);
}

.score-value {
  width: 24px;
  text-align: right;
  font-weight: 600;
  color: #fff;
}

.reasoning {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  line-height: 1.5;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.results-grid.three-col {
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.scores-grid.three-col {
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.result-column {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for text overflow */
}

.column-header {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.column-header.parallel {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05));
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.column-header.exa {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(244, 114, 182, 0.05));
  border: 1px solid rgba(244, 114, 182, 0.2);
}

.column-header.openai {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.api-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.api-badge {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.column-header.parallel .api-badge {
  color: #60a5fa;
}

.column-header.exa .api-badge {
  color: #f472b6;
}

.column-header.openai .api-badge {
  color: #34d399;
}

.result-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.endpoint-info code {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', Monaco, monospace;
}

.api-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  color: #fbbf24;
  font-size: 14px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.result-rank {
  font-weight: 700;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 28px;
}

.result-content {
  flex: 1;
  min-width: 0; /* Important for text overflow */
  overflow: hidden;
}

.result-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #60a5fa;
  text-decoration: none;
  margin-bottom: 4px;
  word-break: break-word;
}

.result-title:hover {
  text-decoration: underline;
}

.external-icon {
  flex-shrink: 0;
  opacity: 0.5;
}

.result-url {
  font-size: 12px;
  color: rgba(16, 185, 129, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.result-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}

.result-excerpt {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.empty-state > p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 40px;
}

.api-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.api-cards.three-col {
  grid-template-columns: 1fr 1fr 1fr;
  max-width: 900px;
}

.api-card {
  padding: 24px;
  border-radius: 14px;
  text-align: left;
}

.api-card.parallel {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(96, 165, 250, 0.02));
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.api-card.exa {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.1), rgba(244, 114, 182, 0.02));
  border: 1px solid rgba(244, 114, 182, 0.2);
}

.api-card.openai {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.card-icon {
  font-size: 28px;
  margin-bottom: 12px;
  display: block;
}

.api-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.api-card code {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 10px;
  font-family: 'SF Mono', Monaco, monospace;
}

.api-card p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}
</style>
