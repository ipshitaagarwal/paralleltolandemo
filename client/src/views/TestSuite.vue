<template>
  <div class="test-suite">
    <!-- Loading State for Shared Results -->
    <div v-if="loadingShared" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading shared results...</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="suite-header">
        <div class="header-info">
          <h2>{{ isSharedView ? 'Shared Test Results' : 'Test Suite Runner' }}</h2>
          <p>{{ isSharedView ? 'View test suite comparison results' : 'Generate AI-powered test queries and compare all three APIs at scale' }}</p>
        </div>
        <router-link v-if="isSharedView" to="/suite" class="btn-new-suite">
          <span>🚀</span> Run Your Own Suite
        </router-link>
      </div>

      <!-- Controls (only show if not in shared view) -->
      <div v-if="!isSharedView" class="controls-panel">
      <div class="generate-section">
        <div class="control-group topic-group">
          <label>Topic / Use Case (optional)</label>
          <input
            v-model="topic"
            type="text"
            placeholder="e.g. developer docs lookup, AI research papers, startup news..."
            :disabled="generating || running"
            class="topic-input"
          />
        </div>
        <div class="control-group">
          <label>Count</label>
          <select v-model="queryCount" :disabled="generating || running">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="20">20</option>
          </select>
        </div>
        <button @click="generateQueries" :disabled="generating || running" class="btn-generate">
          <span v-if="generating" class="spinner"></span>
          <span v-else class="btn-icon">🎲</span>
          {{ generating ? 'Generating...' : 'Generate' }}
        </button>
      </div>

      <div class="divider"></div>

      <div class="run-section">
        <button
          @click="runSuite"
          :disabled="running || queries.length === 0"
          class="btn-run"
        >
          <span v-if="running" class="spinner"></span>
          <span v-else class="btn-icon">🚀</span>
          {{ running ? `Running ${progress}/${queries.length}...` : 'Run All Queries' }}
        </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-banner">
        <span>⚠️</span> {{ error }}
      </div>

      <!-- Queries List -->
      <div v-if="queries.length > 0" class="queries-section">
        <div class="section-header">
          <h3>Test Queries</h3>
          <span class="query-count">{{ queries.length }} queries</span>
        </div>

        <div class="queries-grid">
          <div v-for="(q, i) in queries" :key="i" class="query-item" :class="{ readonly: isSharedView }">
            <span class="query-num">{{ i + 1 }}</span>
            <input v-model="queries[i]" :disabled="running || isSharedView" :readonly="isSharedView" class="query-input" />
            <button v-if="!isSharedView" @click="removeQuery(i)" :disabled="running" class="btn-remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <button v-if="!isSharedView" @click="addQuery" :disabled="running" class="btn-add">
          <span>+</span> Add Query
        </button>
      </div>

      <!-- Results -->
      <div v-if="results" class="results-section">
        <!-- Share Bar -->
        <div class="share-bar">
          <div class="share-info" v-if="isSharedView">
            <span class="share-icon">🔗</span>
            <span>Shared Results</span>
            <span class="share-date" v-if="sharedData?.createdAt">{{ formatDate(sharedData.createdAt) }}</span>
          </div>
          <div class="share-actions">
            <button v-if="!shareUrl && !isSharedView" @click="shareResults" :disabled="sharing" class="btn-share">
              <span v-if="sharing" class="spinner small"></span>
              <span v-else class="btn-icon">🔗</span>
              {{ sharing ? 'Creating link...' : 'Share Results' }}
            </button>
            <div v-if="shareUrl" class="share-link-container">
              <input type="text" :value="shareUrl" readonly class="share-link-input" ref="shareLinkInput" />
              <button @click="copyShareLink" class="btn-copy" :class="{ copied }">
                {{ copied ? '✓ Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>

      <!-- Summary Cards -->
      <div class="summary-panel">
        <h3>Results Summary</h3>

        <div class="summary-cards">
          <div class="summary-card parallel">
            <div class="card-value">{{ results.summary.parallelWins }}</div>
            <div class="card-label">Parallel Wins</div>
            <div class="card-bar">
              <div class="bar-fill" :style="{ width: parallelWinPercent + '%' }"></div>
            </div>
          </div>

          <div class="summary-card openai">
            <div class="card-value">{{ results.summary.openaiWins }}</div>
            <div class="card-label">OpenAI Wins</div>
            <div class="card-bar">
              <div class="bar-fill openai" :style="{ width: openaiWinPercent + '%' }"></div>
            </div>
          </div>

          <div class="summary-card exa">
            <div class="card-value">{{ results.summary.exaWins }}</div>
            <div class="card-label">Exa Wins</div>
            <div class="card-bar">
              <div class="bar-fill exa" :style="{ width: exaWinPercent + '%' }"></div>
            </div>
          </div>

          <div class="summary-card tie">
            <div class="card-value">{{ results.summary.ties }}</div>
            <div class="card-label">Ties</div>
            <div class="card-bar">
              <div class="bar-fill tie" :style="{ width: tiePercent + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="avg-scores">
          <div class="avg-score parallel">
            <span class="avg-label">⚡ Parallel Avg</span>
            <div class="avg-values">
              <span title="Latency Score">⏱️ {{ avgScores.parallel.latency.toFixed(1) }}</span>
              <span title="Cost Score">💰 {{ avgScores.parallel.cost.toFixed(1) }}</span>
              <span title="Accuracy Score">🎯 {{ avgScores.parallel.accuracy.toFixed(1) }}</span>
            </div>
          </div>
          <div class="avg-score openai">
            <span class="avg-label">🌐 OpenAI Avg</span>
            <div class="avg-values">
              <span title="Latency Score">⏱️ {{ avgScores.openai.latency.toFixed(1) }}</span>
              <span title="Cost Score">💰 {{ avgScores.openai.cost.toFixed(1) }}</span>
              <span title="Accuracy Score">🎯 {{ avgScores.openai.accuracy.toFixed(1) }}</span>
            </div>
          </div>
          <div class="avg-score exa">
            <span class="avg-label">✨ Exa Avg</span>
            <div class="avg-values">
              <span title="Latency Score">⏱️ {{ avgScores.exa.latency.toFixed(1) }}</span>
              <span title="Cost Score">💰 {{ avgScores.exa.cost.toFixed(1) }}</span>
              <span title="Accuracy Score">🎯 {{ avgScores.exa.accuracy.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <!-- Metrics Legend -->
        <div class="metrics-legend">
          <span class="legend-item"><b>Scoring:</b> Latency 25% + Cost 25% + Accuracy 50%</span>
        </div>
      </div>

      <!-- Results Table -->
      <div class="results-table-container">
        <h3>Detailed Results</h3>
        <p class="table-hint">Click on a row to see reasoning</p>

        <div class="table-wrapper">
          <table class="results-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-query">Query</th>
                <th class="col-score">Parallel</th>
                <th class="col-score">OpenAI</th>
                <th class="col-score">Exa</th>
                <th class="col-winner">Winner</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(r, i) in results.results" :key="i">
                <tr :class="['result-row', r.winner, { expanded: expandedRow === i }]" @click="toggleRow(i)">
                  <td class="col-num">{{ i + 1 }}</td>
                  <td class="col-query">
                    <span class="query-text">{{ r.query }}</span>
                  </td>
                  <td v-if="r.error" colspan="4" class="error-cell">{{ r.error }}</td>
                  <template v-else>
                    <td class="col-score">
                      <div class="score-cell parallel">
                        <span class="score-breakdown">{{ r.parallel.scores.latencyScore || 0 }} / {{ r.parallel.scores.costScore || 0 }} / {{ r.parallel.scores.accuracy || 0 }}</span>
                        <span class="score-total">{{ r.parallel.scores.total || 0 }}</span>
                      </div>
                    </td>
                    <td class="col-score">
                      <div class="score-cell openai">
                        <span class="score-breakdown">{{ r.openai.scores.latencyScore || 0 }} / {{ r.openai.scores.costScore || 0 }} / {{ r.openai.scores.accuracy || 0 }}</span>
                        <span class="score-total">{{ r.openai.scores.total || 0 }}</span>
                      </div>
                    </td>
                    <td class="col-score">
                      <div class="score-cell exa">
                        <span class="score-breakdown">{{ r.exa.scores.latencyScore || 0 }} / {{ r.exa.scores.costScore || 0 }} / {{ r.exa.scores.accuracy || 0 }}</span>
                        <span class="score-total">{{ r.exa.scores.total || 0 }}</span>
                      </div>
                    </td>
                    <td class="col-winner">
                      <span class="winner-badge" :class="r.winner">
                        <span v-if="r.winner === 'parallel'">⚡</span>
                        <span v-else-if="r.winner === 'openai'">🌐</span>
                        <span v-else-if="r.winner === 'exa'">✨</span>
                        <span v-else>🤝</span>
                        {{ r.winner }}
                      </span>
                    </td>
                  </template>
                </tr>
                <!-- Expanded Reasoning Row -->
                <tr v-if="expandedRow === i && !r.error" class="reasoning-row">
                  <td colspan="6">
                    <div class="reasoning-content">
                      <div class="reasoning-grid">
                        <div class="reasoning-card parallel">
                          <div class="reasoning-header">
                            <span class="api-name">⚡ Parallel</span>
                            <span class="metrics-detail">{{ r.parallel.scores.latency || 0 }}ms · ${{ (r.parallel.scores.cost || 0).toFixed(4) }}</span>
                          </div>
                          <p class="reasoning-text">{{ r.parallel.scores.reasoning || 'No reasoning available' }}</p>
                        </div>
                        <div class="reasoning-card openai">
                          <div class="reasoning-header">
                            <span class="api-name">🌐 OpenAI</span>
                            <span class="metrics-detail">{{ r.openai.scores.latency || 0 }}ms · ${{ (r.openai.scores.cost || 0).toFixed(4) }}</span>
                          </div>
                          <p class="reasoning-text">{{ r.openai.scores.reasoning || 'No reasoning available' }}</p>
                        </div>
                        <div class="reasoning-card exa">
                          <div class="reasoning-header">
                            <span class="api-name">✨ Exa</span>
                            <span class="metrics-detail">{{ r.exa.scores.latency || 0 }}ms · ${{ (r.exa.scores.cost || 0).toFixed(4) }}</span>
                          </div>
                          <p class="reasoning-text">{{ r.exa.scores.reasoning || 'No reasoning available' }}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

      <!-- Empty State (only show if not in shared view) -->
      <div v-else-if="queries.length === 0 && !isSharedView" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No Test Suite Yet</h3>
        <p>Generate a test suite to compare API performance across multiple queries.</p>
        <div class="empty-features">
          <div class="feature">
            <span class="feature-icon">🎲</span>
            <span>AI-generated diverse queries</span>
          </div>
          <div class="feature">
            <span class="feature-icon">⚖️</span>
            <span>Side-by-side comparison</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📈</span>
            <span>Aggregate statistics</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      queryCount: 10,
      topic: '',
      queries: [],
      results: null,
      generating: false,
      running: false,
      progress: 0,
      currentQuery: '',
      liveResults: [],
      error: null,
      expandedRow: null,
      // Share functionality
      sharing: false,
      shareUrl: null,
      copied: false,
      sharedData: null,
      loadingShared: false
    }
  },
  async mounted() {
    if (this.id) {
      await this.loadSharedResults()
    }
  },
  watch: {
    id: {
      immediate: false,
      async handler(newId) {
        if (newId) {
          await this.loadSharedResults()
        } else {
          this.sharedData = null
          this.results = null
          this.queries = []
          this.shareUrl = null
        }
      }
    }
  },
  computed: {
    isSharedView() {
      return !!this.id
    },
    parallelWinPercent() {
      if (!this.results) return 0
      return (this.results.summary.parallelWins / this.results.summary.total) * 100
    },
    openaiWinPercent() {
      if (!this.results) return 0
      return (this.results.summary.openaiWins / this.results.summary.total) * 100
    },
    exaWinPercent() {
      if (!this.results) return 0
      return (this.results.summary.exaWins / this.results.summary.total) * 100
    },
    tiePercent() {
      if (!this.results) return 0
      return (this.results.summary.ties / this.results.summary.total) * 100
    },
    avgScores() {
      if (!this.results || !this.results.results.length) {
        return {
          parallel: { latency: 0, cost: 0, accuracy: 0 },
          openai: { latency: 0, cost: 0, accuracy: 0 },
          exa: { latency: 0, cost: 0, accuracy: 0 }
        }
      }

      const validResults = this.results.results.filter(r => !r.error)
      if (!validResults.length) {
        return {
          parallel: { latency: 0, cost: 0, accuracy: 0 },
          openai: { latency: 0, cost: 0, accuracy: 0 },
          exa: { latency: 0, cost: 0, accuracy: 0 }
        }
      }

      const sum = {
        parallel: { latency: 0, cost: 0, accuracy: 0 },
        openai: { latency: 0, cost: 0, accuracy: 0 },
        exa: { latency: 0, cost: 0, accuracy: 0 }
      }

      validResults.forEach(r => {
        sum.parallel.latency += r.parallel.scores.latencyScore || 0
        sum.parallel.cost += r.parallel.scores.costScore || 0
        sum.parallel.accuracy += r.parallel.scores.accuracy || 0
        sum.openai.latency += r.openai.scores.latencyScore || 0
        sum.openai.cost += r.openai.scores.costScore || 0
        sum.openai.accuracy += r.openai.scores.accuracy || 0
        sum.exa.latency += r.exa.scores.latencyScore || 0
        sum.exa.cost += r.exa.scores.costScore || 0
        sum.exa.accuracy += r.exa.scores.accuracy || 0
      })

      const count = validResults.length
      return {
        parallel: {
          latency: sum.parallel.latency / count,
          cost: sum.parallel.cost / count,
          accuracy: sum.parallel.accuracy / count
        },
        openai: {
          latency: sum.openai.latency / count,
          cost: sum.openai.cost / count,
          accuracy: sum.openai.accuracy / count
        },
        exa: {
          latency: sum.exa.latency / count,
          cost: sum.exa.cost / count,
          accuracy: sum.exa.accuracy / count
        }
      }
    }
  },
  methods: {
    async generateQueries() {
      this.generating = true
      this.error = null

      try {
        const res = await fetch('/api/suite/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: this.queryCount, topic: this.topic || null })
        })

        if (!res.ok) throw new Error('Failed to generate queries')
        const data = await res.json()
        this.queries = data.queries
        this.results = null
      } catch (err) {
        this.error = err.message
      } finally {
        this.generating = false
      }
    },
    async runSuite() {
      if (this.queries.length === 0) return

      this.running = true
      this.progress = 0
      this.error = null
      this.currentQuery = ''
      this.liveResults = []

      try {
        const res = await fetch('/api/suite/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queries: this.queries })
        })

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'progress') {
                  this.progress = data.current
                  this.currentQuery = data.query
                } else if (data.type === 'result') {
                  this.liveResults.push(data.result)
                } else if (data.type === 'complete') {
                  this.results = data
                } else if (data.type === 'error') {
                  this.error = data.message
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }
      } catch (err) {
        this.error = err.message
      } finally {
        this.running = false
        this.currentQuery = ''
      }
    },
    addQuery() {
      this.queries.push('')
    },
    removeQuery(index) {
      this.queries.splice(index, 1)
    },
    toggleRow(index) {
      this.expandedRow = this.expandedRow === index ? null : index
    },
    getTotal(scores) {
      return scores.total || 0
    },
    async loadSharedResults() {
      if (!this.id) return

      this.loadingShared = true
      this.error = null

      try {
        const res = await fetch(`/api/suite/results/${this.id}`)
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Shared results not found. The link may have expired or be invalid.')
          }
          throw new Error('Failed to load shared results')
        }

        const data = await res.json()
        this.sharedData = data
        this.results = { results: data.results, summary: data.summary }
        this.queries = data.queries || []
        this.topic = data.topic || ''
      } catch (err) {
        this.error = err.message
      } finally {
        this.loadingShared = false
      }
    },
    async shareResults() {
      if (!this.results) return

      this.sharing = true
      this.error = null

      try {
        const res = await fetch('/api/suite/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            results: this.results.results,
            summary: this.results.summary,
            queries: this.queries,
            topic: this.topic || null
          })
        })

        if (!res.ok) throw new Error('Failed to save results')

        const data = await res.json()
        this.shareUrl = window.location.origin + data.url
      } catch (err) {
        this.error = err.message
      } finally {
        this.sharing = false
      }
    },
    async copyShareLink() {
      if (!this.shareUrl) return

      try {
        await navigator.clipboard.writeText(this.shareUrl)
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 2000)
      } catch (err) {
        // Fallback for older browsers
        this.$refs.shareLinkInput.select()
        document.execCommand('copy')
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 2000)
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.suite-header {
  margin-bottom: 28px;
}

.suite-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.suite-header p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
}

/* Controls Panel */
.controls-panel {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  margin-bottom: 28px;
}

.generate-section {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

.control-group select {
  padding: 10px 14px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  outline: none;
}

.control-group select:focus {
  border-color: rgba(167, 139, 250, 0.5);
}

.control-group select option {
  background: #1a1a2e;
}

.topic-group {
  flex: 1;
  min-width: 250px;
}

.topic-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  outline: none;
}

.topic-input:focus {
  border-color: rgba(167, 139, 250, 0.5);
}

.topic-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn-generate,
.btn-run {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-generate {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1));
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.btn-generate:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.2));
}

.btn-run {
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  color: white;
}

.btn-run:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

.btn-generate:disabled,
.btn-run:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

.run-section {
  margin-left: auto;
}

/* Error */
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

/* Queries Section */
.queries-section {
  margin-bottom: 28px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.query-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.queries-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}

.query-num {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  min-width: 24px;
}

.query-input {
  flex: 1;
  padding: 8px 0;
  font-size: 14px;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
}

.btn-remove {
  padding: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* Results Summary */
.summary-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.summary-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.summary-card.parallel {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05));
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.summary-card.openai {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.summary-card.exa {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(244, 114, 182, 0.05));
  border: 1px solid rgba(244, 114, 182, 0.2);
}

.summary-card.tie {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.card-value {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 4px;
}

.summary-card.parallel .card-value {
  color: #60a5fa;
}

.summary-card.openai .card-value {
  color: #34d399;
}

.summary-card.exa .card-value {
  color: #f472b6;
}

.summary-card.tie .card-value {
  color: #fbbf24;
}

.card-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.card-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.bar-fill.openai {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.bar-fill.exa {
  background: linear-gradient(90deg, #f472b6, #a78bfa);
}

.bar-fill.tie {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.avg-scores {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.avg-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

.avg-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.avg-values {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* Results Table */
.results-table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
}

.results-table-container h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.table-wrapper {
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.results-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.col-num {
  width: 50px;
}

.col-query {
  min-width: 200px;
}

.col-score {
  width: 150px;
}

.col-winner {
  width: 100px;
}

.result-row.parallel {
  background: rgba(96, 165, 250, 0.03);
}

.result-row.openai {
  background: rgba(16, 185, 129, 0.03);
}

.result-row.exa {
  background: rgba(244, 114, 182, 0.03);
}

.query-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-breakdown {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.score-total {
  font-size: 16px;
  font-weight: 700;
}

.score-cell.parallel .score-total {
  color: #60a5fa;
}

.score-cell.openai .score-total {
  color: #34d399;
}

.score-cell.exa .score-total {
  color: #f472b6;
}

.winner-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  text-transform: capitalize;
}

.winner-badge.parallel {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.winner-badge.openai {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.winner-badge.exa {
  background: rgba(244, 114, 182, 0.2);
  color: #f472b6;
}

.winner-badge.tie {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.error-cell {
  color: #f87171;
  font-size: 13px;
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
  margin-bottom: 32px;
}

.empty-features {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.feature-icon {
  font-size: 18px;
}

/* Metrics Legend */
.metrics-legend {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  text-align: center;
}

.legend-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.legend-item b {
  color: rgba(255, 255, 255, 0.7);
}

/* Table hint */
.table-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
}

/* Expandable rows */
.result-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.result-row:hover {
  background: rgba(255, 255, 255, 0.03) !important;
}

.result-row.expanded {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* Reasoning row */
.reasoning-row {
  background: rgba(0, 0, 0, 0.2);
}

.reasoning-row td {
  padding: 0 !important;
}

.reasoning-content {
  padding: 16px;
}

.reasoning-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.reasoning-card {
  padding: 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.reasoning-card.parallel {
  border-color: rgba(96, 165, 250, 0.2);
}

.reasoning-card.openai {
  border-color: rgba(16, 185, 129, 0.2);
}

.reasoning-card.exa {
  border-color: rgba(244, 114, 182, 0.2);
}

.reasoning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reasoning-header .api-name {
  font-weight: 600;
  font-size: 13px;
  color: #fff;
}

.metrics-detail {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', Monaco, monospace;
}

.reasoning-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
}

/* Share Bar */
.share-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
}

.share-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.share-icon {
  font-size: 18px;
}

.share-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  font-weight: 400;
}

.share-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-share {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-share:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.2));
  transform: translateY(-1px);
}

.btn-share:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.share-link-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.share-link-input {
  width: 280px;
  padding: 8px 12px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  outline: none;
}

.share-link-input:focus {
  border-color: rgba(139, 92, 246, 0.4);
}

.btn-copy {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-copy:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-copy.copied {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.spinner.small {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(167, 139, 250, 0.2);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-state p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

/* New Suite Button */
.btn-new-suite {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  border: none;
  border-radius: 10px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-new-suite:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

/* Shared view header styling */
.suite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Readonly query items */
.query-item.readonly {
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.04);
}

.query-item.readonly .query-input {
  cursor: default;
  color: rgba(255, 255, 255, 0.7);
}
</style>
