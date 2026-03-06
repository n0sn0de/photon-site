/**
 * PHOTON Site — Live Chain Data & Interactions
 * Pulls from NosNode LCD endpoints (our own infra, no rate limits)
 */

const LCD = 'https://atomone-lcd.nosnode.com';
const PHOTON_MAX_SUPPLY = 1_000_000_000; // 1B PHOTON
const REFRESH_INTERVAL = 30_000; // 30 seconds

// State
let chainData = {
    photonSupply: null,
    atoneSupply: null,
    conversionRate: null,
    bondedTokens: null,
    notBondedTokens: null,
    activeValidators: null,
    lastUpdated: null,
};

let priceData = {
    atoneUsd: null,
    photonUsd: null,
    photon24hChange: null,
    photonMcap: null,
    lastFetched: null,
};

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const PRICE_REFRESH = 60_000; // 60 seconds (CoinGecko rate limits)

// ===== Data Fetching =====

async function fetchJSON(path) {
    const res = await fetch(`${LCD}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function fetchChainData() {
    try {
        const [supplyRes, poolRes, rateRes, validatorRes] = await Promise.allSettled([
            fetchJSON('/cosmos/bank/v1beta1/supply?pagination.limit=20'),
            fetchJSON('/cosmos/staking/v1beta1/pool'),
            fetchJSON('/atomone/photon/v1/conversion_rate'),
            fetchJSON('/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.count_total=true&pagination.limit=1'),
        ]);

        // Parse supply
        if (supplyRes.status === 'fulfilled') {
            const supplies = supplyRes.value.supply || [];
            
            // Find uatone
            const uatone = supplies.find(s => s.denom === 'uatone');
            if (uatone) chainData.atoneSupply = BigInt(uatone.amount);
            
            // Find uphoton — might be in first page or need pagination
            const uphoton = supplies.find(s => s.denom === 'uphoton');
            if (uphoton) {
                chainData.photonSupply = BigInt(uphoton.amount);
            } else {
                // Photon might be on next page — fetch with pagination key
                const nextKey = supplyRes.value.pagination?.next_key;
                if (nextKey) {
                    try {
                        const page2 = await fetchJSON(`/cosmos/bank/v1beta1/supply?pagination.key=${encodeURIComponent(nextKey)}&pagination.limit=10`);
                        const uphoton2 = (page2.supply || []).find(s => s.denom === 'uphoton');
                        if (uphoton2) chainData.photonSupply = BigInt(uphoton2.amount);
                    } catch (e) { /* ignore pagination errors */ }
                }
            }
        }

        // Parse staking pool
        if (poolRes.status === 'fulfilled') {
            const pool = poolRes.value.pool;
            chainData.bondedTokens = BigInt(pool.bonded_tokens);
            chainData.notBondedTokens = BigInt(pool.not_bonded_tokens);
        }

        // Parse conversion rate
        if (rateRes.status === 'fulfilled') {
            chainData.conversionRate = parseFloat(rateRes.value.conversion_rate);
        }

        // Parse validators
        if (validatorRes.status === 'fulfilled') {
            chainData.activeValidators = parseInt(validatorRes.value.pagination?.total || '0');
        }

        chainData.lastUpdated = new Date();
        updateUI();
    } catch (err) {
        console.error('Failed to fetch chain data:', err);
    }
}

// ===== Formatting =====

function formatNumber(n, decimals = 0) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function formatBigToken(uAmount, decimals = 2) {
    if (uAmount === null || uAmount === undefined) return '—';
    // uAmount is in micro units (1e6)
    const whole = Number(uAmount / 1_000_000n);
    return formatNumber(whole, decimals);
}

function formatCompact(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

// ===== UI Updates =====

function updateUI() {
    const { photonSupply, atoneSupply, conversionRate, bondedTokens, notBondedTokens, activeValidators, lastUpdated } = chainData;

    // Hero stats
    if (photonSupply !== null) {
        const photonWhole = Number(photonSupply / 1_000_000n);
        document.getElementById('stat-supply').textContent = formatCompact(photonWhole);
        document.getElementById('stat-remaining').textContent = formatCompact(PHOTON_MAX_SUPPLY - photonWhole);
    }
    if (conversionRate !== null) {
        document.getElementById('stat-rate').textContent = conversionRate.toFixed(4) + ':1';
    }

    // Data cards
    if (photonSupply !== null) {
        const photonWhole = Number(photonSupply / 1_000_000n);
        document.getElementById('card-photon-supply').textContent = formatNumber(photonWhole);
        
        const pct = (photonWhole / PHOTON_MAX_SUPPLY * 100);
        document.getElementById('photon-pct').textContent = pct.toFixed(2) + '%';
        
        // Animate progress bar
        requestAnimationFrame(() => {
            document.getElementById('photon-progress').style.width = pct + '%';
        });
    }

    if (atoneSupply !== null) {
        document.getElementById('card-atone-supply').textContent = formatBigToken(atoneSupply);
    }

    if (conversionRate !== null) {
        document.getElementById('card-conversion-rate').textContent = conversionRate.toFixed(6);
        document.getElementById('calc-rate-display').textContent = conversionRate.toFixed(4);
    }

    // Calculate ATONE burned (rough estimate from genesis supply vs current + photon minted)
    // Since we know the initial ATONE supply was ~96,997,800 and inflation has been running,
    // we can't easily calculate exact burned amount without genesis data.
    // Instead, show estimated based on photon supply and average conversion rate
    if (photonSupply !== null && conversionRate !== null) {
        // Rough estimate: photon_minted / avg_rate (use current rate as approximation)
        const photonWhole = Number(photonSupply / 1_000_000n);
        const estimatedBurned = Math.round(photonWhole / conversionRate);
        document.getElementById('card-atone-burned').textContent = '~' + formatNumber(estimatedBurned);
    }

    if (bondedTokens !== null) {
        document.getElementById('card-bonded').textContent = formatBigToken(bondedTokens);
        if (atoneSupply !== null) {
            const bondedPct = (Number(bondedTokens) / Number(atoneSupply) * 100).toFixed(1);
            document.getElementById('card-bonded-pct').textContent = bondedPct + '% of total supply staked';
        }
    }

    if (activeValidators !== null) {
        document.getElementById('card-validators').textContent = activeValidators.toString();
    }

    // Last updated
    if (lastUpdated) {
        document.getElementById('last-updated').textContent = 
            'Updated ' + lastUpdated.toLocaleTimeString();
    }

    // Update calculator if input has value
    updateCalculator();
}

// ===== Calculator =====

function updateCalculator() {
    const input = document.getElementById('calc-atone');
    const resultEl = document.getElementById('calc-result');
    const atoneAmount = parseFloat(input.value);

    if (!atoneAmount || atoneAmount <= 0 || chainData.conversionRate === null) {
        resultEl.textContent = '—';
        return;
    }

    const photonAmount = atoneAmount * chainData.conversionRate;
    resultEl.textContent = formatNumber(photonAmount, 4) + ' PHOTON';
}

// ===== Price Data & Arbitrage =====

async function fetchPriceData() {
    try {
        const res = await fetch(`${COINGECKO_API}/simple/price?ids=atomone,photon-2&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.atomone) {
            priceData.atoneUsd = data.atomone.usd;
        }
        if (data['photon-2']) {
            priceData.photonUsd = data['photon-2'].usd;
            priceData.photon24hChange = data['photon-2'].usd_24h_change;
            priceData.photonMcap = data['photon-2'].usd_market_cap;
        }
        priceData.lastFetched = new Date();
        updateArbitrage();
    } catch (err) {
        console.error('Price fetch failed:', err);
    }
}

function updateArbitrage() {
    const { atoneUsd, photonUsd, photon24hChange, photonMcap } = priceData;
    const { conversionRate } = chainData;
    
    if (atoneUsd === null || conversionRate === null) return;
    
    // Mint cost per PHOTON = ATONE price / conversion rate
    const mintCost = atoneUsd / conversionRate;
    const buyCost = photonUsd;
    
    // Update UI
    document.getElementById('arb-mint-price').textContent = '$' + mintCost.toFixed(6);
    document.getElementById('arb-atone-price').textContent = '$' + atoneUsd.toFixed(4);
    document.getElementById('arb-conv-rate').textContent = conversionRate.toFixed(4) + ' PHOTON/ATONE';
    
    if (buyCost !== null) {
        document.getElementById('arb-buy-price').textContent = '$' + buyCost.toFixed(6);
        document.getElementById('arb-photon-price').textContent = '$' + buyCost.toFixed(6);
        
        if (photon24hChange !== null) {
            const changeEl = document.getElementById('arb-24h-change');
            const sign = photon24hChange >= 0 ? '+' : '';
            changeEl.textContent = sign + photon24hChange.toFixed(2) + '%';
            changeEl.style.color = photon24hChange >= 0 ? '#4ade80' : '#f87171';
        }
        
        if (photonMcap !== null && photonMcap > 0) {
            document.getElementById('arb-mcap').textContent = '$' + formatCompact(photonMcap);
        }
        
        // Calculate difference
        const diff = ((mintCost - buyCost) / buyCost * 100);
        const absDiff = Math.abs(diff).toFixed(1);
        
        const signalEl = document.getElementById('arb-signal');
        const iconEl = document.getElementById('arb-signal-icon');
        const actionEl = document.getElementById('arb-signal-action');
        const reasonEl = document.getElementById('arb-signal-reason');
        const diffBadge = document.getElementById('arb-diff-badge');
        
        if (mintCost < buyCost) {
            // Minting is cheaper
            signalEl.className = 'arb-signal mint-cheaper';
            iconEl.textContent = '🔥';
            actionEl.textContent = 'MINT IS CHEAPER';
            reasonEl.textContent = `Minting saves ${absDiff}% vs buying on Osmosis`;
            diffBadge.textContent = `Mint saves ${absDiff}%`;
            diffBadge.style.color = '#4ade80';
        } else {
            // Buying is cheaper
            signalEl.className = 'arb-signal buy-cheaper';
            iconEl.textContent = '💱';
            actionEl.textContent = 'BUY IS CHEAPER';
            reasonEl.textContent = `Buying on Osmosis saves ${absDiff}% vs minting`;
            diffBadge.textContent = `Buy saves ${absDiff}%`;
            diffBadge.style.color = '#60a5fa';
        }
    }
}

// ===== Conversion Rate Simulator =====

function initSimulator() {
    const photonSlider = document.getElementById('sim-photon-pct');
    const inflationSlider = document.getElementById('sim-inflation');
    const yearsSlider = document.getElementById('sim-years');
    
    if (!photonSlider) return;
    
    // Set initial photon % from live data
    if (chainData.photonSupply !== null) {
        const currentPct = Number(chainData.photonSupply / 1_000_000n) / PHOTON_MAX_SUPPLY * 100;
        photonSlider.value = currentPct.toFixed(1);
    }
    
    const update = () => drawSimulator();
    photonSlider.addEventListener('input', update);
    inflationSlider.addEventListener('input', update);
    yearsSlider.addEventListener('input', update);
    
    drawSimulator();
}

function drawSimulator() {
    const photonPct = parseFloat(document.getElementById('sim-photon-pct').value);
    const inflation = parseFloat(document.getElementById('sim-inflation').value) / 100;
    const years = parseInt(document.getElementById('sim-years').value);
    
    // Update labels
    document.getElementById('sim-photon-pct-val').textContent = photonPct.toFixed(1) + '%';
    document.getElementById('sim-inflation-val').textContent = (inflation * 100).toFixed(1) + '%';
    document.getElementById('sim-years-val').textContent = years + (years === 1 ? ' year' : ' years');
    
    // Current values
    const currentAtoneSupply = chainData.atoneSupply 
        ? Number(chainData.atoneSupply / 1_000_000n) 
        : 136_731_102;
    
    const photonMinted = photonPct / 100 * PHOTON_MAX_SUPPLY;
    const currentRate = (PHOTON_MAX_SUPPLY - photonMinted) / currentAtoneSupply;
    
    // Project forward with monthly granularity
    const months = years * 12;
    const monthlyInflation = Math.pow(1 + inflation, 1/12) - 1;
    
    const points = [];
    let projAtone = currentAtoneSupply;
    
    for (let m = 0; m <= months; m++) {
        const rate = (PHOTON_MAX_SUPPLY - photonMinted) / projAtone;
        points.push({
            month: m,
            rate: rate,
            atoneSupply: projAtone,
        });
        projAtone *= (1 + monthlyInflation);
    }
    
    const finalRate = points[points.length - 1].rate;
    const finalAtone = points[points.length - 1].atoneSupply;
    const rateChange = ((finalRate - currentRate) / currentRate * 100);
    
    // Update result cards
    document.getElementById('sim-current-rate').textContent = currentRate.toFixed(4);
    document.getElementById('sim-projected-rate').textContent = finalRate.toFixed(4);
    document.getElementById('sim-rate-change').textContent = rateChange.toFixed(1) + '%';
    document.getElementById('sim-rate-change').style.color = rateChange < 0 ? '#f87171' : '#4ade80';
    document.getElementById('sim-atone-proj').textContent = formatCompact(Math.round(finalAtone));
    
    // Draw chart on canvas
    const canvas = document.getElementById('sim-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 48; // padding
    const h = 300;
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    
    // Clear
    ctx.clearRect(0, 0, w, h);
    
    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 40;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;
    
    const maxRate = Math.max(...points.map(p => p.rate)) * 1.05;
    const minRate = Math.min(...points.map(p => p.rate)) * 0.95;
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padTop + (chartH / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();
        
        // Y labels
        const val = maxRate - (maxRate - minRate) * (i / gridLines);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px "DM Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(2), padLeft - 8, y + 4);
    }
    
    // X labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    const yearMarks = Math.min(years, 10);
    for (let i = 0; i <= yearMarks; i++) {
        const m = Math.round(i * months / yearMarks);
        const x = padLeft + (m / months) * chartW;
        const yr = (m / 12).toFixed(0);
        ctx.fillText(yr + 'y', x, h - 8);
    }
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#d4a039';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    
    points.forEach((p, i) => {
        const x = padLeft + (p.month / months) * chartW;
        const y = padTop + chartH - ((p.rate - minRate) / (maxRate - minRate)) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Gradient fill under line
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, 'rgba(212, 160, 57, 0.15)');
    gradient.addColorStop(1, 'rgba(212, 160, 57, 0.0)');
    
    ctx.lineTo(padLeft + chartW, padTop + chartH);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Current rate dot
    const startX = padLeft;
    const startY = padTop + chartH - ((currentRate - minRate) / (maxRate - minRate)) * chartH;
    ctx.beginPath();
    ctx.arc(startX, startY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#d4a039';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 160, 57, 0.4)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // End dot
    const endX = padLeft + chartW;
    const endY = padTop + chartH - ((finalRate - minRate) / (maxRate - minRate)) * chartH;
    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171';
    ctx.fill();
    ctx.lineWidth = 1;
    
    // Labels
    ctx.font = '11px "DM Mono", monospace';
    ctx.fillStyle = '#d4a039';
    ctx.textAlign = 'left';
    ctx.fillText('now: ' + currentRate.toFixed(2), startX + 10, startY - 8);
    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'right';
    ctx.fillText('then: ' + finalRate.toFixed(2), endX - 10, endY - 8);
    
    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px "DM Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PHOTON/ATONE Conversion Rate Over Time', padLeft, padTop - 5);
}

// ===== Mobile Navigation =====

function initMobileNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });
    
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });
}

// ===== Scroll Animations =====

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll(
        '.data-card, .flow-step, .detail-card, .token-card, .resource-card, .timeline-item, .security-callout, .calc-container, .arb-card, .arb-signal, .arb-explainer, .sim-container, .code-card'
    );
    elements.forEach(el => observer.observe(el));
}

// ===== Smooth scroll for nav links =====

function initNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// ===== Init =====

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavigation();
    initMobileNav();

    // Calculator input listener
    document.getElementById('calc-atone').addEventListener('input', updateCalculator);

    // Fetch chain data immediately, then every 30s
    fetchChainData().then(() => {
        initSimulator();
    });
    setInterval(fetchChainData, REFRESH_INTERVAL);
    
    // Fetch price data immediately, then every 60s
    fetchPriceData();
    setInterval(fetchPriceData, PRICE_REFRESH);
    
    // Redraw simulator on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(drawSimulator, 200);
    });
});
