<template>
  <div class="app">
    <!-- Hero Header -->
    <header>
      <div class="logo-section">
        <div class="logo-icon tolan-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Cute alien face -->
            <ellipse cx="24" cy="26" rx="18" ry="16" fill="url(#tolanGrad)"/>
            <!-- Big eyes -->
            <ellipse cx="17" cy="24" rx="5" ry="6" fill="#1a1a2e"/>
            <ellipse cx="31" cy="24" rx="5" ry="6" fill="#1a1a2e"/>
            <!-- Eye shine -->
            <circle cx="18.5" cy="22" r="2" fill="white"/>
            <circle cx="32.5" cy="22" r="2" fill="white"/>
            <!-- Smile -->
            <path d="M18 32 Q24 37 30 32" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- Antenna -->
            <path d="M24 10 L24 14" stroke="url(#tolanGrad)" stroke-width="3" stroke-linecap="round"/>
            <circle cx="24" cy="8" r="3" fill="#fcd34d"/>
            <defs>
              <linearGradient id="tolanGrad" x1="6" y1="10" x2="42" y2="42">
                <stop offset="0%" stop-color="#a3e635"/>
                <stop offset="100%" stop-color="#22d3ee"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="logo-text">
          <h1>Tolan Search Infrastructure</h1>
          <p class="tagline">Parallel vs Exa: Finding the Best Search for Your Alien Friend</p>
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
    <div class="info-banner tolan-banner" v-if="$route.path === '/'">
      <div class="info-content">
        <h2>Why This Matters for Tolan</h2>
        <div class="info-steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text">Users ask Tolan real questions</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">Tolan needs accurate, fast web search</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">Better search = Better friend 🛸</div>
          </div>
        </div>
      </div>
    </div>

    <main>
      <router-view />
    </main>

    <footer>
      <p>Demo for <span class="api-badge tolan">Tolan</span> comparing <span class="api-badge parallel">Parallel API</span> vs <span class="api-badge exa">Exa API (Current)</span> with <span class="api-badge judge">GPT-4o Judge</span></p>
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
  background: linear-gradient(135deg, #a3e635 0%, #22d3ee 50%, #fcd34d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tolan-logo {
  width: 56px;
  height: 56px;
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
  background: linear-gradient(135deg, rgba(163, 230, 53, 0.2), rgba(34, 211, 238, 0.2));
  border: 1px solid rgba(163, 230, 53, 0.3);
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

.info-banner.tolan-banner {
  background: linear-gradient(135deg, rgba(163, 230, 53, 0.1), rgba(34, 211, 238, 0.05));
  border: 1px solid rgba(163, 230, 53, 0.2);
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

.api-badge.tolan {
  background: linear-gradient(135deg, rgba(163, 230, 53, 0.2), rgba(34, 211, 238, 0.2));
  color: #a3e635;
  border: 1px solid rgba(163, 230, 53, 0.3);
}
</style>
