import { CoffeePlatformerEngine } from './game/engine.js';
import { PRODUCTS } from './data/products.js';
import { sound } from './audio/soundManager.js';

const canvas = document.getElementById('game-canvas');
const hudHearts = document.getElementById('hud-hearts');
const hudCaffeine = document.getElementById('hud-caffeine');
const hudBiome = document.getElementById('hud-biome');
const hudBeans = document.getElementById('hud-beans');
const hudScore = document.getElementById('hud-score');
const hudTimer = document.getElementById('hud-timer');
const hudProductsCount = document.getElementById('hud-products-count');
const hudLevelBadge = document.getElementById('hud-level-badge');
const levelSelectBtn = document.getElementById('level-select-btn');
const hudGemsRow = document.getElementById('hud-gems-row');
const hudGems = document.getElementById('hud-gems');

// Modals
const productModal = document.getElementById('product-modal');
const vaultModal = document.getElementById('vault-modal');
const victoryModal = document.getElementById('victory-modal');
const vaultGrid = document.getElementById('vault-grid');
const victoryBadge = document.getElementById('victory-badge');
const victoryTitle = document.getElementById('victory-title');
const victoryDesc = document.getElementById('victory-desc');
const victoryNextBtn = document.getElementById('victory-next-btn');

const touchShotBtn = document.getElementById('touch-shot-btn');
const hintShot = document.getElementById('hint-shot');

const engine = new CoffeePlatformerEngine(canvas, {
  onHudUpdate: (state) => {
    // Render Hearts & Weapon Badge
    let heartsHtml = '';
    for (let i = 0; i < state.maxHp; i++) {
      heartsHtml += `<span class="heart ${i < state.hp ? 'active' : ''}">❤</span>`;
    }
    if (state.shieldActive) {
      heartsHtml += `<span class="heart active" title="Nitro Foam Shield Active" style="color:#f472b6">🛡</span>`;
    }
    if (state.hasBeanGun) {
      if (state.weaponType === 'golden_deagle') {
        heartsHtml += `<span class="heart active" title="Golden Desert Eagle .50 Equipped" style="color:#facc15; text-shadow: 0 0 10px rgba(250, 204, 21, 0.9)">🦅</span>`;
      } else {
        heartsHtml += `<span class="heart active" title="Black Glock 16mm Equipped" style="color:#fde047; text-shadow: 0 0 8px rgba(253, 224, 71, 0.8)">🔫</span>`;
      }
    }
    hudHearts.innerHTML = heartsHtml;

    hudCaffeine.style.width = `${state.caffeine}%`;
    hudBiome.textContent = `★ ${state.biome}`;
    hudBeans.textContent = state.beans;
    hudScore.textContent = String(state.score).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    hudProductsCount.textContent = `${state.discoveredCount} / ${state.totalProducts}`;

    // Update Level Indicator Badge & Switcher Button
    if (hudLevelBadge) {
      hudLevelBadge.textContent = state.level === 2 ? 'LVL 2: GROTTO' : 'LVL 1: ESPRESSO';
    }
    if (levelSelectBtn) {
      if (state.level === 2) {
        levelSelectBtn.classList.add('lvl2');
      } else {
        levelSelectBtn.classList.remove('lvl2');
      }
    }

    // Sugar Gems counter for Level 2
    if (hudGemsRow && hudGems) {
      if (state.level === 2) {
        hudGemsRow.style.display = 'flex';
        hudGems.textContent = state.gems;
      } else {
        hudGemsRow.style.display = 'none';
      }
    }

    // Weapon Action Buttons & Controls Bar Hints
    if (touchShotBtn && state.hasBeanGun) {
      if (state.weaponType === 'golden_deagle') {
        touchShotBtn.innerHTML = '🦅 Deagle .50';
        touchShotBtn.style.background = 'linear-gradient(135deg, #ca8a04, #78350f)';
        touchShotBtn.style.borderColor = '#facc15';
        touchShotBtn.style.color = '#fef08a';
      } else {
        touchShotBtn.innerHTML = '🔫 Glock 16mm';
        touchShotBtn.style.background = 'linear-gradient(135deg, #27272a, #09090b)';
        touchShotBtn.style.borderColor = '#71717a';
        touchShotBtn.style.color = '#fff';
      }
    }
    if (hintShot && state.hasBeanGun) {
      if (state.weaponType === 'golden_deagle') {
        hintShot.innerHTML = '<kbd>X</kbd> / <kbd>Click</kbd> Golden Deagle .50 🦅';
        hintShot.style.color = '#facc15';
      } else {
        hintShot.innerHTML = '<kbd>X</kbd> / <kbd>Click</kbd> Glock 16mm 🔫';
        hintShot.style.color = '#fde047';
      }
    }
  },
  onProductDiscovered: (product) => {
    showProductShowcaseModal(product);
  },
  onVictory: (stats) => {
    showVictoryModal(stats);
  }
});

function showProductShowcaseModal(product) {
  engine.paused = true;
  document.getElementById('modal-product-badge').textContent = product.badge || 'NEW PRODUCT DISCOVERED!';
  document.getElementById('modal-product-origin').textContent = `${product.origin} • ${product.roastLevel}`;
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-tagline').textContent = product.tagline;
  document.getElementById('modal-product-desc').textContent = product.description;
  document.getElementById('modal-pack-category').textContent = product.category;

  const packEl = document.getElementById('modal-pack-color');
  packEl.style.background = `linear-gradient(135deg, ${product.color}, #291105)`;
  packEl.style.borderColor = product.accentColor;

  const notesContainer = document.getElementById('modal-tasting-notes');
  notesContainer.innerHTML = product.tastingNotes
    .map((n) => `<span class="tasting-pill">${n}</span>`)
    .join('');

  document.getElementById('modal-powerup-title').textContent = product.powerupTitle;
  document.getElementById('modal-powerup-desc').textContent = product.powerupDescription;
  document.getElementById('modal-product-price').textContent = product.price;
  document.getElementById('modal-product-weight').textContent = product.weight;

  const shopLink = document.getElementById('modal-shop-link');
  shopLink.href = product.shopUrl;
  shopLink.onclick = (e) => {
    e.preventDefault();
    shopLink.textContent = '✓ Added Sample to Tasting Cart!';
    setTimeout(() => {
      shopLink.textContent = 'Reserve Bag in Shop';
    }, 2000);
  };

  productModal.classList.remove('hidden');
}

function renderVaultCatalog() {
  vaultGrid.innerHTML = PRODUCTS.map((prod) => {
    const isUnlocked = engine.discoveredProducts.has(prod.id);
    return `
      <div class="vault-item-card ${isUnlocked ? 'unlocked' : ''}">
        <div>
          <span class="vault-status-pill ${isUnlocked ? 'unlocked' : 'locked'}">
            ${isUnlocked ? '✓ DISCOVERED & ACTIVE' : '🔒 HIDDEN IN WORLD'}
          </span>
          <h3 style="margin-top:8px">${prod.name}</h3>
          <p style="font-size:11.5px; color:#cbb7a4; margin:4px 0 8px">${prod.tagline}</p>
          <div class="vault-power">⚡ ${prod.powerupTitle}</div>
          <p style="font-size:11px; color:#b8a28e; margin-top:3px">${prod.powerupDescription}</p>
        </div>
        <div class="vault-price-row">
          <strong style="color:#fef08a; font-size:15px">${prod.price}</strong>
          <button class="vault-card-btn" data-product-id="${prod.id}">
            ${isUnlocked ? 'Inspect Card' : 'Instant Test Unlock'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  vaultGrid.querySelectorAll('.vault-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-product-id');
      const prod = PRODUCTS.find((p) => p.id === prodId);
      if (prod) {
        sound.playProductUnlock();
        engine.unlockProductPowerup(prod);
        // Also mark corresponding world node collected
        const node = engine.level.productNodes.find((n) => n.productId === prod.id);
        if (node) node.collected = true;
        vaultModal.classList.add('hidden');
        showProductShowcaseModal(prod);
      }
    });
  });
}

function showVictoryModal(stats) {
  engine.paused = true;
  const mins = String(Math.floor(stats.time / 60)).padStart(2, '0');
  const secs = String(stats.time % 60).padStart(2, '0');

  if (stats.level === 1) {
    if (victoryBadge) victoryBadge.textContent = '☕ LEVEL 1 CLEARED! ☕';
    if (victoryTitle) victoryTitle.textContent = 'You Reached the Golden Roastery Sanctuary!';
    if (victoryDesc) victoryDesc.textContent = 'Your espresso journey has unlocked the subterranean Neon Mocha Grotto & Caramel Caldera!';
    if (victoryNextBtn) {
      victoryNextBtn.style.display = 'inline-block';
      victoryNextBtn.textContent = 'Proceed to Level 2: Neon Grotto ➔';
    }
  } else {
    if (victoryBadge) victoryBadge.textContent = '🏆 MASTER BARISTA CHAMPION 🏆';
    if (victoryTitle) victoryTitle.textContent = 'You Conquered the Frothy Caramel Caldera!';
    if (victoryDesc) victoryDesc.textContent = 'You have mastered both coffee realms with legendary roasted agility and firepower!';
    if (victoryNextBtn) {
      victoryNextBtn.style.display = 'inline-block';
      victoryNextBtn.textContent = 'Replay Level 1 ↺';
    }
  }

  let extraStats = '';
  if (stats.level === 2) {
    extraStats = `
      <div class="stat-box">
        <strong>${stats.gems}</strong>
        <span>SUGAR GEMS</span>
      </div>
      <div class="stat-box">
        <strong>${stats.pods}</strong>
        <span>CACAO PODS</span>
      </div>
    `;
  }

  document.getElementById('victory-stats').innerHTML = `
    <div class="stat-box">
      <strong>${stats.score.toLocaleString()}</strong>
      <span>FINAL SCORE</span>
    </div>
    <div class="stat-box">
      <strong>${stats.beans}</strong>
      <span>GOLDEN BEANS</span>
    </div>
    ${extraStats}
    <div class="stat-box">
      <strong>${stats.discoveredCount} / ${PRODUCTS.length}</strong>
      <span>PRODUCTS (${mins}:${secs})</span>
    </div>
  `;
  victoryModal.classList.remove('hidden');
}

// Level Switcher Quick Action
if (levelSelectBtn) {
  levelSelectBtn.addEventListener('click', () => {
    const nextLvl = engine.currentLevel === 1 ? 2 : 1;
    engine.loadLevel(nextLvl);
  });
}

// Modal Buttons
document.getElementById('modal-continue-btn').addEventListener('click', () => {
  productModal.classList.add('hidden');
  engine.paused = false;
});

document.getElementById('open-vault-btn').addEventListener('click', () => {
  engine.paused = true;
  renderVaultCatalog();
  vaultModal.classList.remove('hidden');
});

document.getElementById('close-vault-btn').addEventListener('click', () => {
  vaultModal.classList.add('hidden');
  engine.paused = false;
});

document.getElementById('victory-vault-btn').addEventListener('click', () => {
  victoryModal.classList.add('hidden');
  renderVaultCatalog();
  vaultModal.classList.remove('hidden');
});

if (victoryNextBtn) {
  victoryNextBtn.addEventListener('click', () => {
    victoryModal.classList.add('hidden');
    if (engine.currentLevel === 1) {
      engine.loadLevel(2);
    } else {
      engine.loadLevel(1);
    }
  });
}

document.getElementById('victory-replay-btn').addEventListener('click', () => {
  victoryModal.classList.add('hidden');
  engine.victoryTriggered = false;
  engine.resetLevel();
  engine.paused = false;
});

document.getElementById('mute-btn').addEventListener('click', (e) => {
  const muted = sound.toggleMute();
  e.currentTarget.textContent = muted ? '🔇' : '🔊';
});

document.getElementById('restart-btn').addEventListener('click', () => {
  engine.victoryTriggered = false;
  engine.resetLevel();
});

// Fullscreen Toggle Button & 'F' Keyboard Shortcut
const fullscreenBtn = document.getElementById('fullscreen-btn');
const gameCabinet = document.querySelector('.game-cabinet');

function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const req =
      gameCabinet.requestFullscreen ||
      gameCabinet.webkitRequestFullscreen ||
      document.documentElement.requestFullscreen;
    if (req) {
      req.call(gameCabinet).catch(() => {});
    }
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) {
      exit.call(document).catch(() => {});
    }
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyF' && !engine.paused) {
    toggleFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  const isFs = Boolean(document.fullscreenElement);
  fullscreenBtn.textContent = isFs ? '🗗' : '⛶';
  setTimeout(() => engine.handleResize(), 60);
});

// Touch Controls Binding
document.querySelectorAll('.touch-btn[data-key]').forEach((btn) => {
  const key = btn.getAttribute('data-key');
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    engine.keys.add(key);
  });
  btn.addEventListener('pointerup', () => engine.keys.delete(key));
  btn.addEventListener('pointerleave', () => engine.keys.delete(key));
});

document.querySelectorAll('.touch-btn[data-tap]').forEach((btn) => {
  const code = btn.getAttribute('data-tap');
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    engine.handleKeyPress(code);
  });
});

// Main 60FPS Game Loop
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  engine.update(dt);
  engine.render();

  // Update HUD Timer
  const totalSec = Math.floor(engine.elapsedSeconds);
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  hudTimer.textContent = `${mins}:${secs}`;

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
