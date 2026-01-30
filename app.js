/**
 * Options Credit Spread Calculator
 * 计算垂直价差策略的单腿止盈止损目标价
 * 适配富途单腿条件单设置
 */

// DOM Elements
const sellPriceInput = document.getElementById('sellPrice');
const buyPriceInput = document.getElementById('buyPrice');
const takeProfitPercentInput = document.getElementById('takeProfitPercent');
const stopLossPercentInput = document.getElementById('stopLossPercent');

// Display Elements
const netCreditEl = document.getElementById('netCredit');

// Short Leg Elements
const shortTpPriceEl = document.getElementById('shortTpPrice');
const shortSlPriceEl = document.getElementById('shortSlPrice');
const shortProfitBadgeEl = document.getElementById('shortProfitBadge');
const shortLossBadgeEl = document.getElementById('shortLossBadge');

// Long Leg Elements
const longTpPriceEl = document.getElementById('longTpPrice');
const longSlPriceEl = document.getElementById('longSlPrice');

// Summary Elements
const summaryCreditEl = document.getElementById('summaryCredit');
const summaryProfitEl = document.getElementById('summaryProfit');
const summaryLossEl = document.getElementById('summaryLoss');

// Delta Recommendation Elements
const riskRewardRatioEl = document.getElementById('riskRewardRatio');
const requiredWinRateEl = document.getElementById('requiredWinRate');
const deltaRecommendationEl = document.getElementById('deltaRecommendation');
const deltaExplanationEl = document.getElementById('deltaExplanation');
const expectedValueEl = document.getElementById('expectedValue');
const topStrategiesEl = document.getElementById('topStrategies');
const comparisonTableBodyEl = document.getElementById('comparisonTableBody');

// Position Sizing Elements
const totalCapitalInput = document.getElementById('totalCapital');
const riskPercentInput = document.getElementById('riskPercent');
const maxRiskAmountEl = document.getElementById('maxRiskAmount');
const recommendedContractsEl = document.getElementById('recommendedContracts');
const actualMaxLossEl = document.getElementById('actualMaxLoss');
const potentialProfitEl = document.getElementById('potentialProfit');
const kellyPercentEl = document.getElementById('kellyPercent');

/**
 * 格式化价格显示
 * @param {number} value - 价格值
 * @returns {string} - 格式化后的价格字符串
 */
function formatPrice(value) {
    if (isNaN(value) || value === null || value < 0) {
        return '$0.00';
    }
    return `$${value.toFixed(2)}`;
}

/**
 * 计算期望值
 * @param {number} winRate - 胜率（百分比）
 * @param {number} profitPercent - 止盈百分比
 * @param {number} lossPercent - 止损百分比
 * @returns {number} - 期望值百分比
 */
function calculateExpectedValue(winRate, profitPercent, lossPercent) {
    return (winRate / 100) * profitPercent - ((100 - winRate) / 100) * lossPercent;
}

/**
 * 根据所需胜率获取 Delta 推荐
 * @param {number} requiredWinRate - 所需最低胜率
 * @returns {object} - Delta 推荐对象
 */
function getDeltaRecommendation(requiredWinRate) {
    // Delta 与胜率的对应关系
    const deltaTable = [
        { delta: 0.05, winRate: 95, label: '≤ 0.05', desc: '极保守型，权利金较低但胜率极高' },
        { delta: 0.10, winRate: 90, label: '≤ 0.10', desc: '保守型，权利金适中，胜率高' },
        { delta: 0.15, winRate: 85, label: '≤ 0.15', desc: '平衡型，权利金和胜率均衡' },
        { delta: 0.20, winRate: 80, label: '≤ 0.20', desc: '适中型，权利金较高' },
        { delta: 0.25, winRate: 75, label: '≤ 0.25', desc: '激进型，权利金高但风险增加' },
        { delta: 0.30, winRate: 70, label: '≤ 0.30', desc: '高风险型，不建议新手使用' }
    ];
    
    // 找到刚好满足所需胜率的 Delta（需要 10% 安全边际）
    const safetyMargin = 10;
    const targetWinRate = requiredWinRate + safetyMargin;
    
    for (let i = 0; i < deltaTable.length; i++) {
        if (deltaTable[i].winRate >= targetWinRate) {
            return {
                delta: deltaTable[i].delta,
                label: deltaTable[i].label,
                winRate: deltaTable[i].winRate,
                margin: deltaTable[i].winRate - requiredWinRate,
                desc: deltaTable[i].desc
            };
        }
    }
    
    // 如果所需胜率太高，返回最保守的
    return {
        delta: 0.05,
        label: '≤ 0.05',
        winRate: 95,
        margin: 95 - requiredWinRate,
        desc: '需要极高胜率，建议重新调整止盈止损比例'
    };
}

/**
 * 生成最佳策略推荐 HTML
 * @param {number} currentTP - 当前止盈百分比
 * @param {number} currentSL - 当前止损百分比
 * @returns {string} - HTML 字符串
 */
function generateTopStrategies(currentTP, currentSL) {
    const presets = [
        { tp: 50, sl: 50 },
        { tp: 50, sl: 100 },
        { tp: 50, sl: 150 },
        { tp: 50, sl: 200 },
        { tp: 75, sl: 100 },
        { tp: 75, sl: 150 },
        { tp: 75, sl: 200 },
        { tp: 100, sl: 100 },
        { tp: 100, sl: 200 }
    ];
    
    // 计算所有策略的期望值
    const strategies = presets.map(p => ({
        tp: p.tp,
        sl: p.sl,
        ev: calculateExpectedValue(90, p.tp, p.sl),
        ratio: p.sl / p.tp
    }));
    
    // 按期望值从高到低排序
    strategies.sort((a, b) => b.ev - a.ev);
    
    // 生成前3个最佳策略的 HTML
    const medals = ['🥇', '🥈', '🥉'];
    let html = '';
    
    for (let i = 0; i < 3 && i < strategies.length; i++) {
        const s = strategies[i];
        const isCurrent = (s.tp === currentTP && s.sl === currentSL);
        const highlightClass = isCurrent ? 'top-strategy-item highlight' : 'top-strategy-item';
        
        html += `<div class="${highlightClass}" style="cursor: pointer;" onclick="applyPreset(${s.tp}, ${s.sl})">`;
        html += `<div class="top-strategy-left">`;
        html += `<span class="top-strategy-medal">${medals[i]}</span>`;
        html += `<div class="top-strategy-info">`;
        html += `<div class="top-strategy-name">止盈 ${s.tp}% / 止损 ${s.sl}%</div>`;
        html += `<div class="top-strategy-ratio">盈亏比 1:${s.ratio.toFixed(2)}</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `<div class="top-strategy-right">`;
        html += `<div class="top-strategy-ev">+${s.ev.toFixed(0)}%</div>`;
        html += `<div class="top-strategy-label">期望值</div>`;
        html += `</div>`;
        html += `</div>`;
    }
    
    return html;
}

/**
 * 生成对照表 HTML
 * @param {number} currentTP - 当前止盈百分比
 * @param {number} currentSL - 当前止损百分比
 * @returns {string} - HTML 字符串
 */
function generateComparisonTable(currentTP, currentSL) {
    const presets = [
        { tp: 50, sl: 50 },
        { tp: 50, sl: 100 },
        { tp: 50, sl: 150 },
        { tp: 50, sl: 200 },
        { tp: 75, sl: 100 },
        { tp: 75, sl: 150 },
        { tp: 75, sl: 200 },
        { tp: 100, sl: 100 },
        { tp: 100, sl: 200 }
    ];
    
    let html = '';
    for (const preset of presets) {
        const { tp, sl } = preset;
        const ratio = sl / tp;
        const reqWinRate = (sl / (tp + sl)) * 100;
        const ev = calculateExpectedValue(90, tp, sl);
        
        const isCurrentRow = (tp === currentTP && sl === currentSL);
        const rowClass = isCurrentRow ? 'highlight' : '';
        
        const evColor = ev >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        const evSign = ev >= 0 ? '+' : '';
        
        html += `<tr class="${rowClass}" style="cursor: pointer;" onclick="applyPreset(${tp}, ${sl})">`;
        html += `<td style="color: var(--text-primary)">${tp}%/${sl}%</td>`;
        html += `<td style="color: var(--text-secondary)">1:${ratio.toFixed(2)}</td>`;
        html += `<td style="color: var(--accent-orange)">${reqWinRate.toFixed(0)}%</td>`;
        html += `<td style="color: ${evColor}">${evSign}${ev.toFixed(0)}%</td>`;
        html += '</tr>';
    }
    
    return html;
}

/**
 * 计算并更新所有结果
 * 
 * Credit Spread 策略说明：
 * - Short Leg: 卖出的期权，开仓收到权利金，需要买回平仓
 * - Long Leg: 买入的期权，开仓支付权利金，需要卖出平仓
 * 
 * 对于 Short Leg（关键腿）：
 * - 止盈：期权价格下跌（对我们有利），当价格 ≤ 目标价时买回
 * - 止损：期权价格上涨（对我们不利），当价格 ≥ 目标价时买回
 * 
 * 计算逻辑：
 * - 止盈时，Short Leg 目标价 = 开仓价 - 盈利金额
 * - 止损时，Short Leg 目标价 = 开仓价 + 亏损金额
 */
function calculate() {
    // 获取输入值
    const sellPrice = parseFloat(sellPriceInput.value) || 0;
    const buyPrice = parseFloat(buyPriceInput.value) || 0;
    const takeProfitPercent = parseFloat(takeProfitPercentInput.value) || 75;
    const stopLossPercent = parseFloat(stopLossPercentInput.value) || 200;

    // 计算净收入 (Net Credit)
    const netCredit = sellPrice - buyPrice;

    // 更新净收入显示
    netCreditEl.textContent = formatPrice(netCredit);
    netCreditEl.style.color = netCredit >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)';

    // ===== 计算盈亏金额 =====
    const profitAmount = netCredit * (takeProfitPercent / 100);  // 止盈金额
    const lossAmount = netCredit * (stopLossPercent / 100);      // 止损金额

    // ===== Short Leg 价格计算 =====
    // Short Leg 开仓是卖出，收到 sellPrice
    // 止盈：价格下跌，买回价 = sellPrice - profitAmount（需要价格 ≤ 这个值才能实现盈利）
    // 止损：价格上涨，买回价 = sellPrice + lossAmount（价格 ≥ 这个值就触发止损）
    
    // 但实际上，对于 Credit Spread 整体止盈止损：
    // 止盈75%：整个价差需要缩小到 25%，即 netCredit * 0.25
    // 止损200%：整个价差需要扩大到 300%，即 netCredit * 3
    
    const takeProfitSpread = netCredit * (1 - takeProfitPercent / 100); // 目标价差
    const stopLossSpread = netCredit * (1 + stopLossPercent / 100);     // 目标价差

    // Short Leg 目标价（假设 Long Leg 归零或保持很小的值）
    // 止盈时：Short Leg 价格 ≈ 目标价差（因为 Long ≈ 0）
    // 止损时：Short Leg 价格 ≈ 目标价差 + Long Leg 当时的价值
    
    // 简化计算：主要监控 Short Leg
    const shortTpPrice = Math.max(0, takeProfitSpread);
    const shortSlPrice = stopLossSpread;

    // 更新 Short Leg 显示
    shortTpPriceEl.textContent = formatPrice(shortTpPrice);
    shortSlPriceEl.textContent = formatPrice(shortSlPrice);
    shortProfitBadgeEl.textContent = `盈利 ${formatPrice(profitAmount)}`;
    shortLossBadgeEl.textContent = `亏损 ${formatPrice(lossAmount)}`;

    // ===== Long Leg 价格计算 =====
    // Long Leg 通常在止盈时接近归零
    // 止盈时设一个很低的触发价，确保能卖出
    // 止损时，Long Leg 可能会有一定价值，但主要靠 Short Leg 触发
    
    const longTpPrice = 0.01; // 止盈时 Long Leg 接近归零
    // 止损时，估算 Long Leg 可能的价值（如果价格不利移动，Long Leg 也会上涨）
    // 估算：Long Leg 上涨幅度约为 Short Leg 上涨的一定比例
    const longSlPrice = buyPrice > 0 ? Math.max(0.01, buyPrice * 0.5) : 0.01;

    // 更新 Long Leg 显示
    longTpPriceEl.textContent = formatPrice(longTpPrice);
    longSlPriceEl.textContent = formatPrice(longSlPrice);

    // ===== 更新策略概览 =====
    summaryCreditEl.textContent = formatPrice(netCredit);
    summaryProfitEl.textContent = `+${formatPrice(profitAmount)} (${takeProfitPercent}%)`;
    summaryLossEl.textContent = `-${formatPrice(lossAmount)} (${stopLossPercent}%)`;

    // ===== 计算 Delta / 胜率推荐 =====
    const riskRewardRatio = stopLossPercent / takeProfitPercent;
    const requiredWinRate = (stopLossPercent / (takeProfitPercent + stopLossPercent)) * 100;
    
    // 更新盈亏比显示
    riskRewardRatioEl.textContent = `1:${riskRewardRatio.toFixed(2)}`;
    requiredWinRateEl.textContent = `${requiredWinRate.toFixed(1)}%`;
    
    // 根据所需胜率设置颜色
    if (requiredWinRate > 80) {
        requiredWinRateEl.style.color = 'var(--accent-red)'; // 红色 - 高风险
    } else if (requiredWinRate > 70) {
        requiredWinRateEl.style.color = 'var(--accent-orange)'; // 橙色 - 中等
    } else {
        requiredWinRateEl.style.color = 'var(--accent-green)'; // 绿色 - 安全
    }
    
    // 获取 Delta 推荐
    const recommendation = getDeltaRecommendation(requiredWinRate);
    deltaRecommendationEl.textContent = recommendation.label;
    deltaExplanationEl.textContent = `建议 Delta ${recommendation.label}（理论胜率 ~${recommendation.winRate}%），安全边际 ${recommendation.margin.toFixed(0)}%。${recommendation.desc}`;
    
    // 根据安全边际设置颜色
    if (recommendation.margin >= 15) {
        deltaRecommendationEl.style.color = 'var(--accent-green)'; // 绿色 - 充足
    } else if (recommendation.margin >= 10) {
        deltaRecommendationEl.style.color = 'var(--accent-orange)'; // 橙色 - 适中
    } else {
        deltaRecommendationEl.style.color = 'var(--accent-red)'; // 红色 - 不足
    }
    
    // ===== 计算期望值 =====
    const currentEV = calculateExpectedValue(recommendation.winRate, takeProfitPercent, stopLossPercent);
    const evSign = currentEV >= 0 ? '+' : '';
    expectedValueEl.textContent = `${evSign}${currentEV.toFixed(1)}%`;
    expectedValueEl.style.color = currentEV >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    
    // ===== 生成最佳策略推荐 =====
    topStrategiesEl.innerHTML = generateTopStrategies(takeProfitPercent, stopLossPercent);
    
    // ===== 生成对照表 =====
    comparisonTableBodyEl.innerHTML = generateComparisonTable(takeProfitPercent, stopLossPercent);
    
    // ===== 本金管理计算 =====
    const totalCapital = parseFloat(totalCapitalInput?.value) || 50000;
    const riskPercent = parseFloat(riskPercentInput?.value) || 2;
    
    // 单次最大风险金额
    const maxRiskAmount = totalCapital * (riskPercent / 100);
    
    // 每份合约的最大亏损（基于止损金额，乘以100因为期权合约是100股）
    const lossPerContract = lossAmount * 100;
    
    // 建议合约数
    const recommendedContracts = lossPerContract > 0 ? Math.floor(maxRiskAmount / lossPerContract) : 0;
    
    // 实际最大亏损
    const actualMaxLoss = recommendedContracts * lossPerContract;
    
    // 潜在收益
    const potentialProfit = recommendedContracts * profitAmount * 100;
    
    // 凯利公式计算: f* = (bp - q) / b
    // b = 赔率 (止盈/止损), p = 胜率, q = 败率
    const b = takeProfitPercent / stopLossPercent;
    const p = recommendation.winRate / 100;
    const q = 1 - p;
    const kellyPercent = Math.max(0, ((b * p - q) / b) * 100);
    
    // 更新显示
    if (maxRiskAmountEl) {
        maxRiskAmountEl.textContent = `$${maxRiskAmount.toLocaleString()}`;
    }
    if (recommendedContractsEl) {
        recommendedContractsEl.textContent = `${recommendedContracts} 份`;
    }
    if (actualMaxLossEl) {
        actualMaxLossEl.textContent = `-$${actualMaxLoss.toLocaleString()}`;
    }
    if (potentialProfitEl) {
        potentialProfitEl.textContent = `+$${potentialProfit.toLocaleString()}`;
    }
    if (kellyPercentEl) {
        kellyPercentEl.textContent = `${kellyPercent.toFixed(1)}%`;
    }
}

/**
 * 应用预设值
 * @param {number} tp - 止盈百分比
 * @param {number} sl - 止损百分比
 */
function applyPreset(tp, sl) {
    takeProfitPercentInput.value = tp;
    stopLossPercentInput.value = sl;
    calculate();
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 创建防抖版本的计算函数
const debouncedCalculate = debounce(calculate, 100);

// 绑定事件监听器
[sellPriceInput, buyPriceInput, takeProfitPercentInput, stopLossPercentInput].forEach(input => {
    input.addEventListener('input', debouncedCalculate);
    input.addEventListener('change', calculate);
});

// 本金管理输入框事件监听
if (totalCapitalInput && riskPercentInput) {
    [totalCapitalInput, riskPercentInput].forEach(input => {
        input.addEventListener('input', debouncedCalculate);
        input.addEventListener('change', calculate);
    });
}

// 初始计算
calculate();

// 从 URL 参数恢复状态
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('sell')) sellPriceInput.value = params.get('sell');
    if (params.has('buy')) buyPriceInput.value = params.get('buy');
    if (params.has('tp')) takeProfitPercentInput.value = params.get('tp');
    if (params.has('sl')) stopLossPercentInput.value = params.get('sl');
    calculate();
}

loadFromURL();
