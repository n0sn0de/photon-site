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
        '.data-card, .flow-step, .detail-card, .token-card, .resource-card, .timeline-item, .security-callout, .calc-container'
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

    // Calculator input listener
    document.getElementById('calc-atone').addEventListener('input', updateCalculator);

    // Fetch data immediately, then every 30s
    fetchChainData();
    setInterval(fetchChainData, REFRESH_INTERVAL);
});
