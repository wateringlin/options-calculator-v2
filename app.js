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
