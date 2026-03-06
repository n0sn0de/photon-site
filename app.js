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

    // Remove skeleton states when data loads
    document.querySelectorAll('[data-skeleton]').forEach(el => {
        el.removeAttribute('data-skeleton');
        el.querySelectorAll('.skeleton-pulse').forEach(sp => sp.classList.remove('skeleton-pulse'));
    });

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
        // Re-calculate treasury USD with new prices
        fetchTreasury();
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
    const simColors = getChartColors();
    ctx.strokeStyle = simColors.gridLine;
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
        ctx.fillStyle = simColors.labelColor;
        ctx.font = '11px "DM Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(2), padLeft - 8, y + 4);
    }
    
    // X labels
    ctx.fillStyle = simColors.labelColor;
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
    ctx.fillStyle = simColors.titleColor;
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

// ===== Governance Data =====

async function fetchGovernance() {
    try {
        const [allRes, votingRes] = await Promise.allSettled([
            fetchJSON('/atomone/gov/v1/proposals?pagination.limit=8&pagination.reverse=true'),
            fetchJSON('/atomone/gov/v1/proposals?proposal_status=PROPOSAL_STATUS_VOTING_PERIOD'),
        ]);

        let proposals = [];
        if (allRes.status === 'fulfilled') {
            proposals = allRes.value.proposals || [];
        }

        let votingProposals = [];
        if (votingRes.status === 'fulfilled') {
            votingProposals = votingRes.value.proposals || [];
        }

        // Show active voting banner
        const banner = document.getElementById('gov-active-banner');
        if (votingProposals.length > 0) {
            banner.style.display = 'flex';
            document.getElementById('gov-active-text').textContent = 
                `${votingProposals.length} proposal${votingProposals.length > 1 ? 's' : ''} in active voting — your voice matters`;
        }

        // Render proposal cards
        const grid = document.getElementById('gov-grid');
        if (proposals.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No proposals found.</p>';
            return;
        }

        grid.innerHTML = proposals.map(p => {
            const status = formatGovStatus(p.status);
            const statusClass = getStatusClass(p.status);
            const title = p.title || 'Untitled Proposal';
            const id = p.id;
            
            // Vote end date
            const endDate = p.voting_end_time ? new Date(p.voting_end_time) : null;
            const dateStr = endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            
            // Tally bar
            const tally = p.final_tally_result || {};
            const yes = parseInt(tally.yes_count || '0');
            const no = parseInt(tally.no_count || '0');
            const abstain = parseInt(tally.abstain_count || '0');
            const total = yes + no + abstain;
            const yesPct = total > 0 ? (yes / total * 100) : 0;
            const noPct = total > 0 ? (no / total * 100) : 0;
            const abstainPct = total > 0 ? (abstain / total * 100) : 0;
            
            const tallyBar = total > 0 ? `
                <div class="gov-tally-bar">
                    <div class="gov-tally-yes" style="width:${yesPct}%" title="Yes: ${yesPct.toFixed(1)}%"></div>
                    <div class="gov-tally-no" style="width:${noPct}%" title="No: ${noPct.toFixed(1)}%"></div>
                    <div class="gov-tally-abstain" style="width:${abstainPct}%" title="Abstain: ${abstainPct.toFixed(1)}%"></div>
                </div>
            ` : '';

            return `
                <a href="https://gov.atom.one/proposals/${id}" target="_blank" class="gov-card gov-card-link">
                    <span class="gov-id">#${id}</span>
                    <div class="gov-info">
                        <div class="gov-title">${escapeHtml(title)}</div>
                        <div class="gov-meta">#${id} · ${dateStr}${total > 0 ? ` · Yes ${yesPct.toFixed(0)}%` : ''}</div>
                    </div>
                    <span class="gov-status ${statusClass}">${status}</span>
                    ${tallyBar}
                </a>
            `;
        }).join('');

    } catch (err) {
        console.error('Governance fetch failed:', err);
    }
}

function formatGovStatus(status) {
    const map = {
        'PROPOSAL_STATUS_PASSED': 'Passed',
        'PROPOSAL_STATUS_REJECTED': 'Rejected',
        'PROPOSAL_STATUS_VOTING_PERIOD': 'Voting',
        'PROPOSAL_STATUS_DEPOSIT_PERIOD': 'Deposit',
        'PROPOSAL_STATUS_FAILED': 'Failed',
    };
    return map[status] || status.replace('PROPOSAL_STATUS_', '');
}

function getStatusClass(status) {
    if (status.includes('PASSED')) return 'passed';
    if (status.includes('REJECTED') || status.includes('FAILED')) return 'rejected';
    if (status.includes('VOTING')) return 'voting';
    if (status.includes('DEPOSIT')) return 'deposit';
    return '';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== Validator Leaderboard =====

async function fetchValidators() {
    try {
        const res = await fetchJSON('/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=100');
        const validators = (res.validators || [])
            .sort((a, b) => parseInt(b.tokens) - parseInt(a.tokens))
            .slice(0, 20);

        if (validators.length === 0) return;

        const totalBonded = validators.reduce((sum, v) => sum + parseInt(v.tokens), 0);
        const allValidatorsBonded = (res.validators || []).reduce((sum, v) => sum + parseInt(v.tokens), 0);
        const totalValidators = (res.validators || []).length;

        // Calculate Nakamoto coefficient (min validators to reach 33.4%)
        let cumulativePower = 0;
        let nakamoto = 0;
        for (const v of validators) {
            cumulativePower += parseInt(v.tokens);
            nakamoto++;
            if (cumulativePower / allValidatorsBonded > 0.334) break;
        }

        // Update summary
        document.getElementById('val-total-bonded').textContent = formatCompact(allValidatorsBonded / 1e6) + ' ATONE';
        document.getElementById('val-active-count').textContent = totalValidators.toString();
        document.getElementById('val-nakamoto').textContent = nakamoto.toString();

        // Find max stake for bar scaling
        const maxStake = parseInt(validators[0].tokens);

        // Render table
        const tbody = document.getElementById('val-table-body');
        tbody.innerHTML = validators.map((v, i) => {
            const rank = i + 1;
            const moniker = v.description?.moniker || 'Unknown';
            const website = v.description?.website || '';
            const tokens = parseInt(v.tokens);
            const tokensDisplay = formatNumber(tokens / 1e6, 0);
            const powerPct = (tokens / allValidatorsBonded * 100);
            const barWidth = (tokens / maxStake * 100);
            const commission = (parseFloat(v.commission?.commission_rates?.rate || 0) * 100).toFixed(1);
            const rankClass = rank <= 3 ? ' top-3' : '';
            const valAddr = v.operator_address || '';
            const mintscanUrl = valAddr ? `https://www.mintscan.io/atomone/validators/${valAddr}` : '';

            return `
                <a href="${mintscanUrl}" target="_blank" class="val-row val-row-link" title="View on Mintscan">
                    <span class="val-rank${rankClass}">${rank}</span>
                    <div class="val-name">
                        <span class="val-moniker">${escapeHtml(moniker)}</span>
                        ${website ? `<span class="val-website">${escapeHtml(website.replace(/^https?:\/\//, ''))}</span>` : ''}
                    </div>
                    <span class="val-stake">${tokensDisplay}</span>
                    <div class="val-power">
                        <div class="val-power-bar"><div class="val-power-fill" style="width:${barWidth}%"></div></div>
                        <span class="val-power-pct">${powerPct.toFixed(2)}%</span>
                    </div>
                    <span class="val-comm">${commission}%</span>
                </a>
            `;
        }).join('');

    } catch (err) {
        console.error('Validator fetch failed:', err);
    }
}

// ===== Community Pool / Treasury =====

async function fetchTreasury() {
    try {
        const res = await fetchJSON('/cosmos/distribution/v1beta1/community_pool');
        const pool = res.pool || [];
        
        const uatone = pool.find(p => p.denom === 'uatone');
        const uphoton = pool.find(p => p.denom === 'uphoton');
        
        const atoneAmount = uatone ? parseFloat(uatone.amount) / 1e6 : 0;
        const photonAmount = uphoton ? parseFloat(uphoton.amount) / 1e6 : 0;
        
        document.getElementById('treasury-atone').textContent = formatNumber(Math.round(atoneAmount));
        document.getElementById('treasury-photon').textContent = formatNumber(Math.round(photonAmount));
        
        // Calculate USD value if we have price data
        if (priceData.atoneUsd || priceData.photonUsd) {
            const atoneUsd = atoneAmount * (priceData.atoneUsd || 0);
            const photonUsd = photonAmount * (priceData.photonUsd || 0);
            const totalUsd = atoneUsd + photonUsd;
            document.getElementById('treasury-usd').textContent = '$' + formatCompact(totalUsd);
        }
    } catch (err) {
        console.error('Treasury fetch failed:', err);
    }
}

// ===== Block Info / Chain Status Bar =====

let prevBlockHeight = null;
let prevBlockTime = null;

async function fetchBlockInfo() {
    try {
        const res = await fetchJSON('/cosmos/base/tendermint/v1beta1/blocks/latest');
        const header = res.block?.header || {};
        
        const height = parseInt(header.height || '0');
        const blockTime = new Date(header.time);
        const chainId = header.chain_id || 'atomone-1';
        
        document.getElementById('chain-id').textContent = chainId;
        document.getElementById('chain-height').textContent = formatNumber(height);
        
        // Time ago
        const ago = Math.round((Date.now() - blockTime.getTime()) / 1000);
        document.getElementById('chain-last-time').textContent = ago < 60 ? ago + 's ago' : Math.round(ago / 60) + 'm ago';
        
        // Block time (seconds between blocks)
        if (prevBlockHeight && prevBlockTime && height > prevBlockHeight) {
            const blocksDiff = height - prevBlockHeight;
            const timeDiff = (blockTime.getTime() - prevBlockTime.getTime()) / 1000;
            const avgBlockTime = timeDiff / blocksDiff;
            document.getElementById('chain-block-time').textContent = avgBlockTime.toFixed(1) + 's';
        }
        
        prevBlockHeight = height;
        prevBlockTime = blockTime;
    } catch (err) {
        console.error('Block info fetch failed:', err);
    }
}

// ===== FAQ Accordion =====

function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all others
            items.forEach(other => {
                if (other !== item) other.classList.remove('open');
                const otherBtn = other.querySelector('.faq-question');
                if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            });
            // Toggle this one
            item.classList.toggle('open', !isOpen);
            btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        });
        // Keyboard: Enter/Space
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// ===== Lazy-load API sections =====

const lazyLoaded = { governance: false, validators: false, treasury: false };

function initLazyLoad() {
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            if (id === 'governance' && !lazyLoaded.governance) {
                lazyLoaded.governance = true;
                fetchGovernance();
                setInterval(fetchGovernance, 300_000);
            } else if (id === 'validators' && !lazyLoaded.validators) {
                lazyLoaded.validators = true;
                fetchValidators();
                setInterval(fetchValidators, 300_000);
            } else if (id === 'treasury' && !lazyLoaded.treasury) {
                lazyLoaded.treasury = true;
                fetchTreasury();
                setInterval(fetchTreasury, 300_000);
            }
            lazyObserver.unobserve(entry.target);
        });
    }, { rootMargin: '200px 0px' }); // pre-fetch 200px before visible

    ['governance', 'validators', 'treasury'].forEach(id => {
        const el = document.getElementById(id);
        if (el) lazyObserver.observe(el);
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
        '.data-card, .flow-step, .detail-card, .token-card, .resource-card, .timeline-item, .security-callout, .calc-container, .arb-card, .arb-signal, .arb-explainer, .sim-container, .scarcity-container, .fee-container, .fee-result-card, .fee-context, .code-card, .constitution-block, .constitution-context, .gov-card:not(.skeleton), .gov-active-banner, .val-summary-stat, .val-table, .treasury-grid, .treasury-context, .dfee-card, .dfee-context, .naka-how, .naka-impact, .mint-method, .mint-alternative, .faq-item'
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

// ===== Light/Dark Mode =====

function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    
    // Check saved preference, then system preference
    const saved = localStorage.getItem('photon-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('photon-theme', next);
        
        // Redraw canvases with appropriate colors
        drawSimulator();
        drawScarcityModel();
    });
    
    // Listen for system preference changes (only if no manual override)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('photon-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
            drawSimulator();
            drawScarcityModel();
        }
    });
}

function getChartColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
        gridLine: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)',
        labelColor: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.3)',
        titleColor: isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.5)',
        baselineColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)',
    };
}

// ===== Rate Decay Sparkline =====

function drawSparkline() {
    const svg = document.getElementById('rate-sparkline');
    if (!svg || chainData.conversionRate === null || chainData.atoneSupply === null) return;
    
    const currentRate = chainData.conversionRate;
    const currentAtone = Number(chainData.atoneSupply / 1_000_000n);
    const photonWhole = chainData.photonSupply !== null ? Number(chainData.photonSupply / 1_000_000n) : 0;
    
    // Project 12 months with ~10% inflation (midpoint estimate)
    const monthlyInflation = Math.pow(1.10, 1/12) - 1;
    const points = [];
    let projAtone = currentAtone;
    
    for (let m = 0; m <= 12; m++) {
        const rate = (PHOTON_MAX_SUPPLY - photonWhole) / projAtone;
        points.push(rate);
        projAtone *= (1 + monthlyInflation);
    }
    
    const maxRate = Math.max(...points);
    const minRate = Math.min(...points);
    const range = maxRate - minRate || 0.001;
    const w = 60, h = 24, pad = 2;
    
    const coords = points.map((rate, i) => {
        const x = pad + (i / 12) * (w - pad * 2);
        const y = pad + (1 - (rate - minRate) / range) * (h - pad * 2);
        return { x, y };
    });
    
    const pathStr = coords.map((c, i) => (i === 0 ? 'M' : 'L') + c.x.toFixed(1) + ',' + c.y.toFixed(1)).join(' ');
    const fillPath = pathStr + ` L${(w - pad).toFixed(1)},${(h - pad).toFixed(1)} L${pad.toFixed(1)},${(h - pad).toFixed(1)} Z`;
    const last = coords[coords.length - 1];
    
    svg.innerHTML = `
        <defs>
            <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#d4a039" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#d4a039" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <path d="${fillPath}" fill="url(#sparkline-grad)"/>
        <path d="${pathStr}" fill="none" stroke="#d4a039" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="2" fill="#f87171"/>
    `;
}

// ===== Init =====

// ===== Scarcity Model =====

function initScarcityModel() {
    const inflSlider = document.getElementById('scarcity-inflation');
    if (!inflSlider) return;

    const update = () => drawScarcityModel();
    inflSlider.addEventListener('input', update);
    drawScarcityModel();
}

function drawScarcityModel() {
    const inflation = parseFloat(document.getElementById('scarcity-inflation').value) / 100;
    document.getElementById('scarcity-inflation-val').textContent = (inflation * 100).toFixed(1) + '%';

    const currentAtone = chainData.atoneSupply
        ? Number(chainData.atoneSupply / 1_000_000n)
        : 136_731_102;
    const currentPhoton = chainData.photonSupply
        ? Number(chainData.photonSupply / 1_000_000n)
        : 74_000_000;

    const years = 10;
    const months = years * 12;
    const monthlyInfl = Math.pow(1 + inflation, 1/12) - 1;

    // Scenarios: % of initial ATONE supply burned over 10 years (spread linearly)
    const burnScenarios = [
        { label: '5%', pct: 0.05, color: '#4ade80' },
        { label: '20%', pct: 0.20, color: '#d4a853' },
        { label: '50%', pct: 0.50, color: '#f87171' },
    ];
    const chartColors = getChartColors();
    const baselineColor = chartColors.baselineColor;

    // Baseline (no burn, just inflation)
    const baselinePoints = [];
    let bAtone = currentAtone;
    for (let m = 0; m <= months; m++) {
        const rate = (PHOTON_MAX_SUPPLY - currentPhoton) / bAtone;
        baselinePoints.push({ month: m, rate });
        bAtone *= (1 + monthlyInfl);
    }

    // Each burn scenario
    const scenarioPoints = burnScenarios.map(sc => {
        const points = [];
        let atone = currentAtone;
        let photon = currentPhoton;
        const totalBurn = currentAtone * sc.pct;
        const monthlyBurn = totalBurn / months;
        for (let m = 0; m <= months; m++) {
            const rate = (PHOTON_MAX_SUPPLY - photon) / atone;
            points.push({ month: m, rate });
            // Apply inflation first
            atone *= (1 + monthlyInfl);
            // Then burn (reducing atone, increasing photon)
            if (atone > monthlyBurn) {
                const convRate = (PHOTON_MAX_SUPPLY - photon) / atone;
                const photonMinted = monthlyBurn * convRate;
                atone -= monthlyBurn;
                photon += photonMinted;
                if (photon > PHOTON_MAX_SUPPLY) photon = PHOTON_MAX_SUPPLY;
            }
        }
        return { ...sc, points };
    });

    // Update result values
    document.getElementById('scarcity-rate-base').textContent = baselinePoints[baselinePoints.length - 1].rate.toFixed(4);
    scenarioPoints.forEach(sc => {
        const elId = 'scarcity-rate-' + sc.label.replace('%','');
        const el = document.getElementById(elId);
        if (el) el.textContent = sc.points[sc.points.length - 1].rate.toFixed(4);
    });

    // Draw on canvas
    const canvas = document.getElementById('scarcity-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 48;
    const h = 350;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padLeft = 65, padRight = 20, padTop = 25, padBottom = 40;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Find y-range across all series
    const allRates = [
        ...baselinePoints.map(p => p.rate),
        ...scenarioPoints.flatMap(s => s.points.map(p => p.rate))
    ];
    const maxRate = Math.max(...allRates) * 1.05;
    const minRate = Math.min(...allRates) * 0.95;

    // Grid
    ctx.strokeStyle = chartColors.gridLine;
    ctx.lineWidth = 1;
    const gridN = 5;
    for (let i = 0; i <= gridN; i++) {
        const y = padTop + (chartH / gridN) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();
        const val = maxRate - (maxRate - minRate) * (i / gridN);
        ctx.fillStyle = chartColors.labelColor;
        ctx.font = '11px "DM Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(2), padLeft - 8, y + 4);
    }

    // X labels
    ctx.fillStyle = chartColors.labelColor;
    ctx.textAlign = 'center';
    for (let yr = 0; yr <= years; yr += 2) {
        const x = padLeft + (yr * 12 / months) * chartW;
        ctx.fillText(yr + 'y', x, h - 8);
    }

    function drawLine(points, color, lineW) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        ctx.lineJoin = 'round';
        points.forEach((p, i) => {
            const x = padLeft + (p.month / months) * chartW;
            const y = padTop + chartH - ((p.rate - minRate) / (maxRate - minRate)) * chartH;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    // Draw baseline (dashed)
    ctx.setLineDash([6, 4]);
    drawLine(baselinePoints, baselineColor, 1.5);
    ctx.setLineDash([]);

    // Draw scenarios
    scenarioPoints.forEach(sc => drawLine(sc.points, sc.color, 2.5));

    // Title
    ctx.fillStyle = chartColors.titleColor;
    ctx.font = '12px "DM Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Conversion Rate Under Burn Scenarios (10yr)', padLeft, padTop - 8);
}

// ===== Fee Revenue Estimator =====

function initFeeEstimator() {
    const txSlider = document.getElementById('fee-daily-txs');
    const gasSlider = document.getElementById('fee-avg-gas');
    if (!txSlider || !gasSlider) return;

    const update = () => updateFeeEstimator();
    txSlider.addEventListener('input', update);
    gasSlider.addEventListener('input', update);
    updateFeeEstimator();
}

function updateFeeEstimator() {
    const txsLog = parseFloat(document.getElementById('fee-daily-txs').value);
    const dailyTxs = Math.round(Math.pow(10, txsLog));
    const avgGas = parseFloat(document.getElementById('fee-avg-gas').value);

    document.getElementById('fee-daily-txs-val').textContent = formatCompact(dailyTxs);
    document.getElementById('fee-avg-gas-val').textContent = avgGas.toFixed(3);

    const dailyFees = dailyTxs * avgGas;
    const monthlyFees = dailyFees * 30;
    const annualFees = dailyFees * 365;

    const currentPhoton = chainData.photonSupply
        ? Number(chainData.photonSupply / 1_000_000n)
        : 74_000_000;

    const pctSupply = (annualFees / currentPhoton * 100);

    document.getElementById('fee-daily').textContent = formatCompact(dailyFees) + ' ◎';
    document.getElementById('fee-monthly').textContent = formatCompact(monthlyFees) + ' ◎';
    document.getElementById('fee-annual').textContent = formatCompact(annualFees) + ' ◎';
    document.getElementById('fee-pct-supply').textContent = pctSupply < 0.01
        ? '<0.01%'
        : pctSupply.toFixed(2) + '%';
}

// ===== Init =====

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initScrollAnimations();
    initNavigation();
    initMobileNav();
    initFAQ();

    // Calculator input listener
    document.getElementById('calc-atone').addEventListener('input', updateCalculator);

    // Fetch chain data immediately, then every 30s
    fetchChainData().then(() => {
        initSimulator();
        initScarcityModel();
        initFeeEstimator();
        drawSparkline();
    });
    setInterval(fetchChainData, REFRESH_INTERVAL);
    
    // Fetch price data immediately, then every 60s
    fetchPriceData();
    setInterval(fetchPriceData, PRICE_REFRESH);

    // Lazy-load governance, validators, treasury when scrolled near
    initLazyLoad();

    // Block info (lightweight, always fetch)
    fetchBlockInfo();
    setInterval(fetchBlockInfo, 10_000);
    
    // Re-observe new elements after governance/validators load
    setTimeout(() => initScrollAnimations(), 3000);
    
    // Redraw simulator on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawSimulator();
            drawScarcityModel();
        }, 200);
    });
});
