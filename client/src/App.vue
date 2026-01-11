<template>
  <div class="app">
    <!-- Hero Header -->
    <header>
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#grad1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#grad2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#grad1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="22">
                <stop offset="0%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#60a5fa"/>
              </linearGradient>
              <linearGradient id="grad2" x1="2" y1="17" x2="22" y2="22">
                <stop offset="0%" stop-color="#f472b6"/>
                <stop offset="100%" stop-color="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="logo-text">
          <h1>Search API Showdown</h1>
          <p class="tagline">Compare Parallel vs OpenAI vs Exa with AI-Powered Judging</p>
        </div>
      </div>

      <nav>
        <router-link to="/" class="nav-link">
          <span class="nav-icon">⚡</span>
          Single Query
        </router-link>
        <router-link to="/suite" class="nav-link">
          <span class="nav-icon">📊</span>
          Test Suite
        </router-link>
        <router-link to="/settings" class="nav-link">
          <span class="nav-icon">⚙️</span>
          Settings
        </router-link>
      </nav>
    </header>

    <!-- Info Banner -->
    <div class="info-banner" v-if="$route.path === '/'">
      <div class="info-content">
        <h2>How It Works</h2>
        <div class="info-steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text">Enter a search query to compare</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">All three APIs return their results</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">GPT-4o judges quality & relevance</div>
          </div>
        </div>
      </div>
    </div>

    <main>
      <router-view />
    </main>

    <footer>
      <p>Powered by <span class="api-badge parallel">Parallel API</span>, <span class="api-badge openai">OpenAI Web Search</span>, and <span class="api-badge exa">Exa API</span> with <span class="api-badge judge">GPT-4o Judge</span></p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 32px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.2));
  border: 1px solid rgba(167, 139, 250, 0.3);
  color: #fff;
}

.nav-icon {
  font-size: 16px;
}

.info-banner {
  margin-bottom: 24px;
  padding: 24px 32px;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(96, 165, 250, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 16px;
}

.info-content h2 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
}

.info-steps {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.step-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
}

.step-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.step-arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 20px;
}

main {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 28px;
}

footer {
  margin-top: 24px;
  padding: 16px;
  text-align: center;
}

footer p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.api-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
}

.api-badge.parallel {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.api-badge.exa {
  background: rgba(236, 72, 153, 0.2);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.api-badge.openai {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.api-badge.judge {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
</style>
